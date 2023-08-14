/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

const serverSchema: Schema = new Schema({
    _id: String,
    logs: String,
});

type ServerT = InferSchemaType<typeof serverSchema>;

/**
 * The minimum time a server object stays in the cache.
 * 20 minutes
 */
const serverLifetime: number = 1_200_000;

export class Server {
    /**
     * The corresponding Mongo model used for reading and writing to the database.
     */
    private static readonly model = mongoose.model("Server", serverSchema);

    /**
     * The cached servers.
     * The servers are stored along with the ID for the timer responsible for
     * clearing the memory.
     */
    private static cache: Map<string, [Server, NodeJS.Timeout]> = new Map();

    /**
     * The instance data from the database.
     */
    declare private data: Document;

    /**
     * Creates a new document for a server.
     * 
     * @param id server ID for the new document
     */
    private constructor(id: string);

    /**
     * Inflates a server object using data from the database.
     * 
     * @param data server data from database
     */
    private constructor(data: Document);

    /**
     * Instantiates a server object that represents a server document.
     * 
     * @param arg the data passed
     */
    private constructor(arg: string | Document) {
        if (typeof arg === "string" || arg instanceof String) {
            // Create new server document if a string was passed
            this.data = new Server.model({
                _id: <string> arg,
                logs: null
            });
        } else {
            // Otherwise use the document from the database
            this.data = <Document> arg;
        }
    }

    /**
     * Gets a server document from the database.
     * 
     * @param id the server ID
     * @returns the requested server document or null if none was found
     */
    public static async get(id: string): Promise<Server> {
        // Try to get the server from the cache
        const s: [Server, NodeJS.Timeout] = Server.cache.get(id);
        let server: Server;

        if (s) {
            // If the server is found, clear the old timeout
            clearTimeout(s[1]);
            server = s[0];
        } else {
            // Otherwise, fetch from the database
            const data: Document = await Server.model.findById(id);
            
            // If the database didn't have the server,
            // create a new document
            server = data ? new Server(data) : new Server(id);
        }

        // Create a timeout that flushes the server from the cache
        // after a set period of time
        const timeout: NodeJS.Timeout = setTimeout(async (): Promise<void> => {
            await server.save();
            Server.cache.delete(id);
        }, serverLifetime);

        // Save to the cache
        Server.cache.set(id, [server, timeout]);

        return server;
    }

    /**
     * Saves the cached data to the database.
     */
    public async save(): Promise<void> {
        await this.data.save();
    }

    /**
     * Deletes the server configurations from the database.
     */
    public async delete(): Promise<void> {
        const [, timeout]: [Server, NodeJS.Timeout] = Server.cache.get(this.data._id);
        // Clear the server data from the cache
        clearTimeout(timeout);
        Server.cache.delete(this.data._id);
        // Delete from the database
        await Server.model.findByIdAndDelete(this.data._id);
    }

    /**
     * The ID of the logs channel
     */
    public get logs(): string {
        return (<ServerT> this.data).logs;
    }

    public set logs(id: string) {
        (<ServerT> this.data).logs = id;
    }
}
