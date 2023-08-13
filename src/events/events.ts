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
    Client, Collection, EmbedBuilder, Guild, GuildBan, GuildMember, Message,
    TextChannel, User
} from "discord.js";
import { leaveIneligibleServer } from "../util/refresh";
import { getAdminLogsChannel } from "../util/channels";
import { Server } from "../schemas/server";
import {
    genMemberBanEmbed, genMemberJoinEmbed, genMemberLeaveEmbed, genMemberUnbanEmbed,
    genMemberUpdateEmbed, genMessageDeleteEmbed, genMessageEditEmbed, genUserUpdateEmbed
} from "./logs";
import { Blacklist } from "../schemas/blacklist";

/*
 * This module has event listeners for the bot
 */

/**
 * Logs member join events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param member the member who joined
 */
export const onMemberJoin = async (client: Client, member: GuildMember): Promise<void> => {
    // The server and logs channel ID of the server that the member joined
    const server: Server = await Server.get(member.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

    try {
        // Log to the logs channel
        await logs.send({ embeds: [genMemberJoinEmbed(member)] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }

    // Check if the new member is blacklisted
    const bl: Blacklist = await Blacklist.get();
    const ban: string = bl.users.get(member.id);

    // Immediately ban if they are
    if (ban) {
        await member.ban({
            reason: ban
        });
    }
};

/**
 * Logs member leave events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param member the member who left
 */
export const onMemberLeave = async (client: Client, member: GuildMember): Promise<void> => {
    // The server and logs channel ID of the server that the member left
    const server: Server = await Server.get(member.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

    try {
        // Log to the logs channel
        await logs.send({ embeds: [genMemberLeaveEmbed(member)] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Logs member ban events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param ban the ban data
 */
export const onMemberBan = async (client: Client, ban: GuildBan): Promise<void> => {
    // The server and logs channel ID of the server that the member was banned from
    const server: Server = await Server.get(ban.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

    try {
        // Log to the logs channel
        await logs.send({ embeds: [genMemberBanEmbed(ban)] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Logs member unban events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param ban the ban data
 */
export const onMemberUnban = async (client: Client, ban: GuildBan): Promise<void> => {
    // The server and logs channel ID of the server that the member was unbanned from
    const server: Server = await Server.get(ban.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

    try {
        // Log to the logs channel
        await logs.send({ embeds: [genMemberUnbanEmbed(ban)] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Logs member server profile update events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param before the member's profile state before update
 * @param after the member's current profile state
 */
export const onMemberUpdate = async (client: Client, before: GuildMember, after: GuildMember): Promise<void> => {
    // The server and logs channel ID of the server that the member updated their profile in
    const server: Server = await Server.get(before.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);
    const embed: EmbedBuilder = genMemberUpdateEmbed(before, after);

    // If embed is null, the changes aren't significant to Sushi Bot
    if (!embed) {
        return;
    }

    try {
        // Log to the logs channel
        await logs.send({ embeds: [embed] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Logs user profile update events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param before the user's profile state before update
 * @param after the user's current profile state
 */
export const onUserUpdate = async (client: Client, before: User, after: User): Promise<void> => {
    const embed: EmbedBuilder = genUserUpdateEmbed(before, after);

    // If embed is null, the changes aren't significant to Sushi Bot
    if (!embed) {
        return;
    }

    // All mutual servers
    const guilds: Collection<string, Guild> = client.guilds.cache;

    // For each server...
    for await (const [, guild] of guilds) {
        try {
            // If fetched, the user is a member of that server
            await guild.members.fetch(before.id);
        } catch {
            // If not, they're not, so we skip
            continue;
        }

        // The server and logs channel ID of the mutual server
        const server: Server = await Server.get(guild.id);
        const logsID: string = server.logs;

        // Skip if the server isn't subscribed to logs
        if (!logsID) {
            continue;
        }

        const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

        try {
            // Log to the logs channel
            await logs.send({ embeds: [
                embed.setAuthor({
                    name: "Profile updated",
                    iconURL: guild.iconURL()
                })
            ]});
        } catch {
            // Remove configurations if logging failed.
            // Most likely causes are that the channel was deleted or that
            // Sushi Bot had its permissions revoked
            server.logs = null;
            await server.save();
        }
    }
};

/**
 * Logs message edit events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param before the message's state before editing
 * @param after the message's current state
 */
export const onMessageEdit = async (client: Client, before: Message, after: Message): Promise<void> => {
    // The server and logs channel ID of the server that had a message edited
    const server: Server = await Server.get(before.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);
    const embed: EmbedBuilder = genMessageEditEmbed(before, after);

    // If embed is null, the changes aren't significant to Sushi Bot
    if (!embed) {
        return;
    }

    try {
        // Log to the logs channel
        await logs.send({ embeds: [embed] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Logs message delete events to servers subscribed to logs.
 * 
 * @param client the Discord bot
 * @param message the message that was deleted
 */
export const onMessageDelete = async (client: Client, message: Message): Promise<void> => {
    // The server and logs channel ID of the server that had a message deleted
    const server: Server = await Server.get(message.guild.id);
    const logsID: string = server.logs;

    // Skip if the server isn't subscribed to logs
    if (!logsID) {
        return;
    }

    const embed: EmbedBuilder = genMessageDeleteEmbed(message);

    // If embed is null, the message wasn't significant to Sushi Bot
    if (!embed) {
        return;
    }

    const logs: TextChannel = <TextChannel> client.channels.cache.get(logsID);

    try {
        // Log to the logs channel
        await logs.send({ embeds: [embed] });
    } catch {
        // Remove configurations if logging failed.
        // Most likely causes are that the channel was deleted or that
        // Sushi Bot had its permissions revoked
        server.logs = null;
        await server.save();
    }
};

/**
 * Triggered when the bot joins a Discord server.
 * It leaves the server if the owner is ineligible to have the bot.
 * 
 * @param client the Discord bot
 * @param server the Discord server joined
 */
export const onServerJoin = async (client: Client, server: Guild): Promise<void> => {
    const eligible: boolean = await leaveIneligibleServer(client, server, getAdminLogsChannel());

    if (eligible) {
        const bl: Blacklist = await Blacklist.get();

        for await (const [uid, reason] of bl.users) {
            await server.bans.create(
                uid,
                { reason: reason }
            );
        }
    }
};

/**
 * Triggered when the bot leaves a Discord server,
 * or when a Discord server is deleted.
 * It deletes the server configurations from the database.
 * 
 * @param client the Discord bot
 * @param server the Discord server left
 */
export const onServerLeave = async (client: Client, server: Guild): Promise<void> => {
    await (await Server.get(server.id)).delete();
};
