/*
 * MIT License
 *
 * Copyright (c) 2023-present Mirage Aegis
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

const frozenPlayerListSchema: Schema = new Schema({
    _id: Number,
    users: { type: Map, of: Boolean }
});

interface FrozenPlayerListI {
    _id: number;
    users?: Map<Snowflake, string>;
}

/**
 * Wrapper class for the frozen player list, a list of users who have terminated their profiles.
 * It has functions and methods for all necessary operations on the frozen player list.
 */
export class FrozenPlayerList {
    /**
     * The corresponding Mongo model used for reading and writing to the database.
     */
    private static readonly model: Model<FrozenPlayerListI> = model<FrozenPlayerListI>("FrozenPlayerList", frozenPlayerListSchema);

    /**
     * The singleton instance of the blacklist.
     */
    private static instance: FrozenPlayerList = null;

    /**
     * The instance data from the database.
     */
    private data: HydratedDocument<FrozenPlayerListI>;

    /**
     * Instantiates a singleton with data.
     */
    private constructor(data: HydratedDocument<FrozenPlayerListI>) {
        this.data = data;
    }

    /**
     * Gets the blacklist singleton.
     * 
     * @returns the blacklist
     */
    public static async get(): Promise<FrozenPlayerList> {
        if (FrozenPlayerList.instance) {
            return FrozenPlayerList.instance;
        }

        const data: HydratedDocument<FrozenPlayerListI> = await FrozenPlayerList.model.findById(process.env.BLACKLIST_ID);

        let instance: FrozenPlayerList;
        if (data) {
            // If theres a blacklist in the database, use it
            instance = new FrozenPlayerList(data);
        } else {
            // Otherwise create one
            instance = new FrozenPlayerList(
                new FrozenPlayerList.model({
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
