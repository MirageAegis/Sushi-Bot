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

import { Channel, Client } from "discord.js";
import mongoose from "mongoose";
import { getAdminLogsChannel, getUserReportsChannel } from "./channels";
import { refreshBlacklist } from "./refresh";
import { Blacklist } from "../schemas/blacklist";

/**
 * This module has an initialisation routine for the bot
 */

export const init = async (client: Client): Promise<void> => {
    console.log("Connecting to database...");
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("Failed to connect to MongoDB");
        console.error(e);
        process.exit();
    }
    
    console.log("Fetching the user reports channel...");
    const userReports: Channel = getUserReportsChannel(client);
    console.log(`Found ${userReports}`);

    console.log("Fetching the error logs channel...");
    const logs: Channel = getAdminLogsChannel(client);
    console.log(`Found ${logs}`);

    console.log("Fetching blacklist...");
    await Blacklist.get();
    console.log("Blacklist fetched");
    
    console.log("Refreshing blacklist...");
    await refreshBlacklist(client);
    console.log("Blacklist refreshed");
};