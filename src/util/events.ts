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

import { Client, Guild, GuildBan, GuildMember, Message } from "discord.js";
import { leaveIneligibleServer } from "./refresh";
import { getAdminLogsChannel } from "./channels";

/*
 * This module has event listeners for the bot
 */

export const onMemberJoin = async (client: Client, member: GuildMember): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMemberLeave = async (client: Client, member: GuildMember): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMemberBan = async (client: Client, ban: GuildBan): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMemberUnban = async (client: Client, ban: GuildBan): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMemberUpdate = async (client: Client, before: GuildMember, after: GuildMember): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMessageEdit = async (client: Client, before: Message, after: Message): Promise<void> => {
    throw new Error("Not implemented");
};

export const onMessageDelete = async (client: Client, message: Message): Promise<void> => {
    throw new Error("Not implemented");
};

/**
 * Triggered when the bot joins a Discord server.
 * It leaves the server if the owner is ineligible to have the bot.
 * 
 * @param client the Discord bot
 * @param server the Discord server joined
 */
export const onServerJoin = async (client: Client, server: Guild): Promise<void> => {
    await leaveIneligibleServer(client, server, getAdminLogsChannel());
};

export const onServerLeave = async (client: Client, server: Guild): Promise<void> => {
    throw new Error("Not implemented");
};
