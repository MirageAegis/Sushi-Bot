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

import { Snowflake } from "discord.js";
import mongoose, { Schema, Document } from "mongoose";

const serverSchema: Schema = new Schema({
    _id: String,
    logs: String,
    shoutout: {
        channel: String,
        role: String,
        message: String
    },
    goLive: {
        channel: String,
        message: String
    },
    reactionMessages: {
        type: Map,
        of: {
            mode: String,
            reactionRoles: {
                type: Map,
                of: String
            }
        },
    }
});

/**
 * Auto shout out configuration struct.
 * 
 * @param channel the channel ID of the auto shout out channel
 * @param role the role ID of the auto shout out role
 * @param message the auto shout out message
 */
export type Shoutout = {
    readonly channel?: Snowflake;
    readonly role?: Snowflake;
    readonly message?: Snowflake;
};

/**
 * Auto go-live post configuration struct.
 * 
 * @param channel the channel ID of the auto go-live post channel
 * @param message the auto go-live message
 */
export type GoLive = {
    readonly channel?: Snowflake;
    readonly message?: Snowflake;
};

/**
 * The type of reaction roles.
 * `regular` reaction roles lets users pick multiple roles and deselect
 * roles.
 * `unique` reaction roles only allow users to have one of the roles at
 * a time.
 * `confirm` roles gives the user a role upon reacting and is limited
 * to one role per message.
 */
export type ReactionRoleStyle = "regular" |
    "unique" |
    "confirm";

export const REGULAR_RR: ReactionRoleStyle = "regular";
export const UNIQUE_RR: ReactionRoleStyle = "unique";
export const CONFIRM_RR: ReactionRoleStyle = "confirm";

/**
 * Represents reaction roles on a message where emogi IDs are
 * mapped to role IDs.
 */
type ReactionRoles = {
    mode: ReactionRoleStyle;
    reactionRoles: Map<Snowflake, Snowflake>;
};

/**
 * Represents a collection of messages with reaction roles where message
 * IDs are mapped to `ReactionRoles`.
 */
type ReactionMessages = Map<Snowflake, ReactionRoles>;

interface ServerI extends Document<string> {
    _id: string;
    logs?: Snowflake;
    shoutout?: Shoutout;
    goLive?: GoLive;
    reactionMessages?: ReactionMessages;
}

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
    declare private data: ServerI;

    /**
     * Creates a new document for a server.
     * 
     * @param id server ID for the new document
     */
    private constructor(id: Snowflake);

    /**
     * Inflates a server object using data from the database.
     * 
     * @param data server data from database
     */
    private constructor(data: ServerI);

    /**
     * Instantiates a server object that represents a server document.
     * 
     * @param arg the data passed
     */
    private constructor(arg: Snowflake | ServerI) {
        if (typeof arg === "string" || arg instanceof String) {
            // Create new server document if a Snowflake was passed
            this.data = <ServerI> new Server.model({
                _id: <string> arg,
                logs: null
            });
        } else {
            // Otherwise use the document from the database
            this.data = <ServerI> arg;
        }
    }

    /**
     * Gets a server document from the database.
     * 
     * @param id the server ID
     * @returns the requested server document or null if none was found
     */
    public static async get(id: Snowflake): Promise<Server> {
        // Try to get the server from the cache
        const s: [Server, NodeJS.Timeout] = Server.cache.get(id);
        let server: Server;

        if (s) {
            // If the server is found, clear the old timeout
            clearTimeout(s[1]);
            server = s[0];
        } else {
            // Otherwise, fetch from the database
            const data: ServerI = await Server.model.findById(id);
            
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
    public get logs(): Snowflake {
        return this.data.logs;
    }

    public set logs(id: Snowflake) {
        this.data.logs = id;
    }

    /**
     * The auto shout out data
     */
    public get shoutout(): Shoutout {
        const shoutout: Shoutout = this.data.shoutout;
        return shoutout.channel && shoutout.role ? shoutout : null;
    }

    public set shoutout(data: Shoutout) {
        this.data.shoutout = data;
    }

    /**
     * The auto go-live post data
     */
    public get goLive(): GoLive {
        const goLive: GoLive = this.data.goLive;
        return goLive.channel ? goLive : null;
    }

    public set goLive(data: GoLive) {
        this.data.goLive = data;
    }

    /**
     * Retrieve the reaction role ID associated with a certain message ID
     * and emoji ID. Returns null if there is no reaction role associated.
     * 
     * @param message the reaction role message ID
     * @param emoji the reaction role emoji ID
     * @returns the reaction role mode and role ID, or null if not a valid reaction role
     */
    public getReactionRole(
        message: Snowflake,
        emoji: Snowflake
    ): [ReactionRoleStyle, Snowflake] {
        // Get the reaction roles for the message
        const roles: ReactionRoles = this.data.reactionMessages
            ?.get(message);

        // Return null if the message doesn't have reaction roles
        if (!roles) {
            return null;
        }

        // Get the reaction role connected to the emoji
        const role: Snowflake = roles.reactionRoles.get(emoji);

        // Return null if the emoji isn't tied to a reaction role
        if (!role) {
            return null;
        }

        return [roles.mode, role];
    }

    /**
     * Sets reaction roles for a message. This cannot be changed later, only deleted.
     * 
     * @param message the reaction role message ID
     * @param mode the reaction role mode
     * @param reactionRoles the collection of reaction roles
     */
    public setReactionRoles(
        message: Snowflake,
        mode: ReactionRoleStyle,
        reactionRoles: Map<Snowflake, Snowflake>
    ): void {
        // Get the collection of reaction role messages
        let messages: ReactionMessages = this.data.reactionMessages;

        // Create a new collection if none was found
        if (!messages) {
            this.data.reactionMessages = new Map<Snowflake, ReactionRoles>();
            messages = this.data.reactionMessages;
        }

        // Set a new reaction role message
        const roles: ReactionRoles = {
            mode: mode,
            reactionRoles: reactionRoles
        };

        messages.set(message, roles);
    }

    public deleteReactionRoles(message: Snowflake): void {
        this.data.reactionMessages.delete(message);
    }
}
