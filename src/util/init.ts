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

import {
    Channel, Client, Events, Guild, GuildBan, GuildMember, Message, User
} from "discord.js";
import mongoose from "mongoose";
import { getAdminLogsChannel, getAdminServer, getUserReportsChannel } from "./channels";
import { refreshBlacklist, refreshServers } from "./refresh";
import { Blacklist } from "../schemas/blacklist";
import {
    onError,
    onMemberBan, onMemberJoin, onMemberLeave, onMemberUnban, onMemberUpdate,
    onMessageDelete, onMessageEdit, onServerJoin, onUserUpdate
} from "../events/events";

/**
 * This module has an initialisation routine for the bot
 */

/**
 * The initialisation routine for Sushi Bot.
 * Includes connecting to the MongoDB Atlas database, fetching resources from
 * Discord, and refreshing server states.
 * 
 * @param client the Discord bot
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
    
    console.log("Fetching the admin server...");
    const adminServer: Guild = await getAdminServer(client);
    console.log(`Found ${adminServer.name}`);
    
    console.log("Fetching the user reports channel...");
    const userReports: Channel = getUserReportsChannel(client);
    console.log(`Found ${userReports}`);

    console.log("Fetching the error logs channel...");
    const logs: Channel = getAdminLogsChannel(client);
    console.log(`Found ${logs}`);

    console.log("Fetching blacklist...");
    await Blacklist.get();
    console.log("Blacklist fetched");

    console.log("Refreshing servers...");
    await refreshServers(client);
    console.log("Servers refreshed");

    console.log("Refreshing blacklist...");
    await refreshBlacklist(client);
    console.log("Blacklist refreshed");
};

export const loadListeners = (client: Client): void => {
    client.on(Events.GuildCreate, async (server: Guild): Promise<void> => {
        await onServerJoin(client, server);
    });

    client.on(Events.GuildMemberAdd, async (member: GuildMember): Promise<void> => {
        await onMemberJoin(client, member);
    });

    client.on(Events.GuildMemberRemove, async (member: GuildMember): Promise<void> => {
        await onMemberLeave(client, member);
    });

    client.on(Events.GuildBanAdd, async (ban: GuildBan): Promise<void> => {
        await onMemberBan(client, ban);
    });

    client.on(Events.GuildBanRemove, async (ban: GuildBan): Promise<void> => {
        await onMemberUnban(client, ban);
    });

    client.on(Events.GuildMemberUpdate, async (before: GuildMember, after: GuildMember): Promise<void> => {
        await onMemberUpdate(client, before, after);
    });

    client.on(Events.UserUpdate, async (before: User, after: User): Promise<void> => {
        await onUserUpdate(client, before, after);
    });

    client.on(Events.MessageUpdate, async (before: Message, after: Message): Promise<void> => {
        await onMessageEdit(client, before, after);
    });

    client.on(Events.MessageDelete, async (message: Message): Promise<void> => {
        await onMessageDelete(client, message);
    });

    client.on(Events.Error, async (error: Error): Promise<void> => {
        await onError(client, error);
    });
};
