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
import { Schema, model, Model, HydratedDocument } from "mongoose";

const blacklistSchema: Schema = new Schema({
    _id: Number,
    users: { type: Map, of: String }
});

interface BlacklistI {
    _id: number;
    users?: Map<Snowflake, string>;
}

/**
 * Wrapper class for the blacklist.
 * It has functions and methods for all necessary operations on the blacklist.
 */
export class Blacklist {
    /**
     * The corresponding Mongo model used for reading and writing to the database.
     */
    private static readonly model: Model<BlacklistI> = model<BlacklistI>("Blacklist", blacklistSchema);

    /**
     * The singleton instance of the blacklist.
     */
    private static instance: Blacklist = null;

    /**
     * The instance data from the database.
     */
    private data: HydratedDocument<BlacklistI>;

    /**
     * Instantiates a singleton with data.
     */
    private constructor(data: HydratedDocument<BlacklistI>) {
        this.data = data;
    }

    /**
     * Gets the blacklist singleton.
     * 
     * @returns the blacklist
     */
    public static async get(): Promise<Blacklist> {
        if (Blacklist.instance) {
            return Blacklist.instance;
        }

        const data: HydratedDocument<BlacklistI> = await Blacklist.model.findById(process.env.BLACKLIST_ID);

        let instance: Blacklist;
        if (data) {
            // If theres a blacklist in the database, use it
            instance = new Blacklist(data);
        } else {
            // Otherwise create one
            instance = new Blacklist(
                new Blacklist.model({
                    _id: process.env.BLACKLIST_ID,
                    users: new Map<string, string>()
                })
            );
        }

        return this.instance = instance;
    }

    /**
     * Adds a user to the blacklist and saves it.
     * 
     * @param id the id of the user being blacklisted
     * @param reason the reason the user is being blacklisted
     */
    public async add(id: Snowflake, reason: string): Promise<void> {
        this.data.users.set(id, reason);
        await this.data.save();
    }

    /**
     * Gets a readonly version of the map of blacklisted users.
     * 
     * @returns the map of blacklisted users with user IDs mapped to
     * the reason they were blacklisted
     */
    public get users(): ReadonlyMap<Snowflake, string> {
        return <ReadonlyMap<Snowflake, string>> this.data.users;
    }
}
