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

import { Client, Guild, TextChannel } from "discord.js";
import { Blacklist } from "../schemas/blacklist";
import { getAdminLogsChannel } from "./channels";

/**
 * This module contains functions for refreshing things.
 * It currently has a function for:
 * - refreshing the blacklist
 */

/**
 * Refreshes the blacklist, very simple
 * 
 * @param client the client that performs the initialisation
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
