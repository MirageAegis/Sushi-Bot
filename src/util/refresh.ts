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

import {
    Client, Collection, Guild, GuildMember, Snowflake, TextChannel, User
} from "discord.js";
import { Blacklist } from "../schemas/blacklist";
import { getAdminLogsChannel, getAdminServer } from "./channels";

/**
 * This module contains functions for refreshing things.
 * It currently has a function for:
 * - refreshing the blacklist
 */

/**
 * Refreshes the blacklist, very simple
 * 
 * @param client the client that performs the refreshing
 */
export const refreshBlacklist = async (client: Client): Promise<void> => {
    // Fetch the blacklisted users and the reasons for blacklisting them
    const bl: ReadonlyMap<string, string> = (await Blacklist.get()).users;

    // The error log channel
    const logs: TextChannel = getAdminLogsChannel();

    // Ban each user in the blacklist from each of Sushi Bot's servers
    for await (const [uid, reason] of bl) {

        // The failed bans of each blacklisted user
        const fails: Guild[] = [];

        // Ban the user from all servers Sushi Bot is in
        for await (const s of client.guilds.cache) {
            const server: Guild = s[1];

            try {
                await server.bans.create(
                    uid,
                    { reason: reason }
                );
            } catch (e) {
                // If the ban fails
                fails.push(server);
            }
        }

        // If no bans failed, report success
        if (!fails.length) {
            await logs.send(`Successfully reloaded bans for <@${uid}>`);
            continue;
        }

        // Generate an error log
        let report: string = `Failed to ban <@${uid}> in:\n`;

        for (const server of fails) {
            report += `**${server.name}**, contact <@${server.ownerId}>\n`;
        }

        await logs.send(report);
    }
};

/**
 * Checks whether a user is eligible to have Sushi Bot in their server
 * 
 * @param user the user to check
 * @returns whether the user is eligible or not
 */
export const verify = async (user: User | Snowflake): Promise<boolean> => {
    // The official server
    const adminServer: Guild = await getAdminServer();

    // The member object tied to the user, if they're a member
    let member: GuildMember;
    try {
        // Try fetching the member
        member = await adminServer.members.fetch(user);
    } catch (e) {
        // Any error is probably an unknown member error, aka. the user
        // isn't a member
        return false;
    }
    
    // If they have the VTuber role, they're eligible, else they're not
    return member.roles.cache.get(process.env.VTUBER_ROLE_ID) ? true : false;
};

/**
 * Refreshes the bot's servers, leaving any ineligible server
 * 
 * @param client the client that performs the refreshing
 */
export const refreshServers = async (client: Client): Promise<void> => {
    // All the servers that Sushi Bot is currently in
    const servers: Collection<string, Guild> = client.guilds.cache;
    
    // The error log channel
    const logs: TextChannel = getAdminLogsChannel();

    for await (const s of servers) {
        const server: Guild = s[1];
        
        await leaveIneligibleServer(client, server, logs);
    }
};

/**
 * Leaves a server if it doesn't fulfill the requirements.
 * 
 * @param client the Discord bot
 * @param server the server to check
 * @param logs the admin logs channel
 * @returns whether the server is eligible or not, true -> eligible
 */
export const leaveIneligibleServer = async (client: Client, server: Guild, logs: TextChannel): Promise<boolean> => {
    const owner: User = (await server.fetchOwner()).user;

    const eligible: boolean = await verify(owner);

    // Notify the ineligible server owners and leave their server
    if (!eligible) {
        try {
            await (await owner.createDM())
                .send(
                    `Your server, **${server.name}** is not eligible for my services. ` +
                    "Please join my official server and view the requirements there!\n\n" +
                    "https://discord.gg/Pqv2JkDKAg"
                );
        } catch (e) {
            await logs.send(`Couldn't DM <@${owner.id}>`);
        }
        
        await server.leave();
        await logs.send(`Left <@${owner.id}>'s server, **${server.name}**`);

        // Server ineligible
        return false;
    }

    // Server eligible
    return true;
};
