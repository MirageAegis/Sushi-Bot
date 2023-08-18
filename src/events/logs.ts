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
    Attachment, AuditLogEvent, Collection, EmbedBuilder, GuildAuditLogs, GuildBan,
    GuildMember, Message, User
} from "discord.js";
import { BLUE, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from "../util/colours";

/*
 * This module has embed factories for loggable events
 */

const millisToSecs: number = 1000;

// ----- MEMBER UPDATES -----

/**
 * Generates an embed for whenever a member joins a server.
 * 
 * @param member the member who joined
 * @returns an embed to be logged
 */
export const genMemberJoinEmbed = (member: GuildMember): EmbedBuilder => {
    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(member.user.username)
        .setColor(GREEN)
        .setAuthor({
            name: "Member joined!",
            iconURL: member.guild.iconURL()
        })
        .setThumbnail(member.displayAvatarURL())
        .addFields(
            { name: "ID", value: member.id, inline: true },
            { name: "Created", value: `<t:${Math.floor(member.user.createdTimestamp / millisToSecs)}>`, inline: true },
            { name: "Bot user", value: `${member.user.bot}`, inline: true }
        );

    return embed;
};

/**
 * The amount of milliseconds back to check when fetching from the audit log.
 */
const TIME_CHECK: number = 500;

/**
 * Generates an embed for whenever a member leaver a server.
 * 
 * @param member the member who left
 * @returns an embed to be logged
 */
export const genMemberLeaveEmbed = async (member: GuildMember): Promise<EmbedBuilder> => {
    const now: number = Date.now();

    // Check the latest kick, which should be this one if the member was kicked
    const logEntry: GuildAuditLogs<AuditLogEvent.MemberKick> = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
    });

    // The data from the kick action
    const {
        reason,
        target,
        createdAt,
        executor,
    } = logEntry.entries.first();

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(member.user.username)
        .setColor(YELLOW)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
            { name: "ID", value: member.id, inline: true },
            { name: "Created", value: `<t:${Math.floor(member.user.createdTimestamp / millisToSecs)}>`, inline: true },
            { name: "Joined", value: `<t:${Math.floor(member.joinedTimestamp / millisToSecs)}>`, inline: true },
            { name: "Bot user", value: `${member.user.bot}`, inline: true }
        );

    // Check whether the member left or was kicked
    // If the most recent kick was on the user who left
    // and was within short time, consider it a kick
    let action: string;
    if (
        target.id === member.id &&
        now - TIME_CHECK < createdAt.getTime()
    ) {
        action = "Member kicked";
        embed.addFields(
            { name: "Moderator", value: `${executor}`, inline: false },
            { name: "Reason", value: `${reason ?? "N/A"}`, inline: false }
        );
    } else {
        //otherwise they probably left
        action = "Member left";
    }

    embed.setAuthor({
        name: action,
        iconURL: member.guild.iconURL()
    });

    return embed;
};

/**
 * Generates an embed for whenever a user is banned from a server.
 * 
 * @param ban the ban created
 * @returns an embed to be logged
 */
export const genMemberBanEmbed = async (ban: GuildBan): Promise<EmbedBuilder> => {
    // Get the ban data from the audit log
    const logEntry: GuildAuditLogs<AuditLogEvent.MemberBanAdd> = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
    });

    // The most recent ban data
    const {
        reason,
        executor,
    } = logEntry.entries.first();

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(ban.user.username)
        .setColor(RED)
        .setAuthor({
            name: "User banned",
            iconURL: ban.guild.iconURL()
        })
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields(
            { name: "ID", value: ban.user.id, inline: true },
            { name: "Created", value: `<t:${Math.floor(ban.user.createdTimestamp / millisToSecs)}>`, inline: true },
            { name: "Bot user", value: `${ban.user.bot}`, inline: true },
            { name: "Moderator", value: `${executor}`, inline: false },
            { name: "Reason", value: `${reason ?? "N/A"}`, inline: false }
        );

    return embed;
};

/**
 * Generates an embed for whenever a user is unbanned from a server.
 * 
 * @param ban the ban removed
 * @returns an embed to be logged
 */
export const genMemberUnbanEmbed = async (ban: GuildBan): Promise<EmbedBuilder> => {
    // Get the unban data from the audit log
    const logEntry: GuildAuditLogs<AuditLogEvent.MemberBanRemove> = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove,
    });

    // The most recent unban data
    const {
        reason,
        executor,
    } = logEntry.entries.first();

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(ban.user.username)
        .setColor(BLUE)
        .setAuthor({
            name: "User unbanned",
            iconURL: ban.guild.iconURL()
        })
        .setThumbnail(ban.user.displayAvatarURL())
        .addFields(
            { name: "ID", value: ban.user.id, inline: true },
            { name: "Created", value: `<t:${Math.floor(ban.user.createdTimestamp / millisToSecs)}>`, inline: true },
            { name: "Bot user", value: `${ban.user.bot}`, inline: true },
            { name: "Moderator", value: `${executor}`, inline: false },
            { name: "Reason", value: `${reason ?? "N/A"}`, inline: false }
        );

    return embed;
};

/**
 * Generates an embed for whenever a member's nickname or server avatar is updated.
 * 
 * @param before the member's state before the update
 * @param after the member's state after the update
 * @returns an embed for logging; or null if the member's nickname and avatar stay the same
 */
export const genMemberUpdateEmbed = (before: GuildMember, after: GuildMember): EmbedBuilder | null => {
    // Properties to check
    const oldNick: string = before.nickname;
    const newNick: string = after.nickname;
    const oldPfp: string = before.avatar;
    const newPfp: string = after.avatar;

    // No embed generated if nickname and avatar stay the same
    if (
        oldNick === newNick &&
        oldPfp === newPfp
    ) {
        return null;
    }

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(before.user.username)
        .setColor(PURPLE)
        .setAuthor({
            name: "Server profile updated",
            iconURL: before.guild.iconURL()
        })
        .setThumbnail(before.displayAvatarURL())
        .addFields(
            { name: "ID", value: before.id, inline: false }
        );

    // Add this if the nickname was updated
    if (oldNick !== newNick) {
        embed.addFields(
            { name: "Old nickname", value: oldNick ?? before.displayName, inline: false },
            { name: "New nickname", value: newPfp ?? after.displayName, inline: false },
        );
    }

    // Add this if the avatar was updated
    if (oldPfp !== newPfp) {
        embed.addFields(
            { name: "New avatar", value: "_ _" } // Empty field value
        )
            .setImage(after.displayAvatarURL());
    }

    return embed;
};

/**
 * Generates an embed for whenever a member's nickname or server avatar is updated.
 * 
 * @param before the user's state before the update
 * @param after the user's state after the update
 * @returns an embed for logging; or null if the user's username, display name, and avatar stay the same
 */
export const genUserUpdateEmbed = (before: User, after: User): EmbedBuilder | null => {
    // Properties to check
    const oldUsername: string = before.username;
    const newUsername: string = after.username;
    const oldDisplayName: string = before.globalName;
    const newDisplayName: string = after.globalName;
    const oldPfp: string = before.avatar;
    const newPfp: string = after.avatar;

    // No embed generated if username, display name, and avatar stay the same
    if (
        oldUsername === newUsername &&
        oldDisplayName === newDisplayName &&
        oldPfp === newPfp
    ) {
        return null;
    }

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(oldUsername)
        .setColor(PURPLE)
        .setThumbnail(before.displayAvatarURL())
        .addFields(
            { name: "ID", value: before.id }
        );

    // Add this if the username was updated
    if (oldUsername !== newUsername) {
        embed.addFields(
            { name: "Old username", value: oldUsername, inline: false },
            { name: "New username", value: newUsername, inline: false },
        );
    }

    // Add this if the display name was updated
    if (oldDisplayName !== newDisplayName) {
        embed.addFields(
            { name: "Old display name", value: oldDisplayName, inline: false },
            { name: "New display name", value: newDisplayName, inline: false },
        );
    }

    // Add this if the username was updated
    if (oldPfp !== newPfp) {
        embed.addFields(
            { name: "New avatar", value: "_ _", inline: false }
        )
            .setImage(after.displayAvatarURL());
    }

    return embed;
};

// ----- !MEMBER UPDATES -----

// ----- MESSAGE UPDATES -----

/**
 * Generates an embed for whenever a message is edited.
 * 
 * @param before the message before being edited
 * @param after the edited message
 * @returns an embed for logging, or null if the contents and attachments are identiccal
 */
export const genMessageEditEmbed = (before: Message, after: Message): EmbedBuilder | null => {
    // Message components to check
    const oldContent: string = before.content;
    const newContent: string = after.content;
    const oldAttachments: Collection<string, Attachment> = before.attachments;
    const newAttachments: Collection<string, Attachment> = after.attachments;

    const diffAttachments: boolean = !oldAttachments.equals(newAttachments);

    // No enbed generated if content and attachments stay the same,
    // or if the attachments stay the same but there was no old content
    if (
        (oldContent === newContent ||
        !oldContent) &&
        !diffAttachments
    ) {
        return null;
    }

    const author: User = before.author;

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(author.username)
        .setColor(TEAL)
        .setAuthor({
            name: "Message edited",
            iconURL: before.guild.iconURL()
        })
        .setTimestamp(before.createdAt)
        .addFields(
            { name: "Member ID", value: author.id, inline: true },
            { name: "Message ID", value: before.id, inline: true },
            { name: "Channel", value: before.channel.toString(), inline: false }
        );

    // Add this if the content was updated,
    // and if the old message actually had text
    if (
        oldContent !== newContent &&
        oldContent
    ) {
        embed.addFields(
            { name: "Old content", value: oldContent, inline: false },
            { name: "New content", value: newContent ? newContent : "_ _", inline: false }
        );
    }

    // Add this if the attachments were updated
    if (diffAttachments) {
        // Get the URLs of the old attachmetns
        let oldUrls: string = "";

        for (const [, attachment] of oldAttachments) {
            oldUrls += `${attachment.url}\n`;
        }

        // Get the URLS of the new attachments
        let newUrls: string = "";

        for (const [, attachment] of newAttachments) {
            newUrls += `${attachment.url}\n`;
        }

        embed.addFields(
            { name: "Old attachments", value: oldUrls ? oldUrls : "_ _", inline: false },
            { name: "New attachments", value: newUrls ? newUrls : "_ _", inline: false }
        );
    }

    return embed;
};

/**
 * Generates an embed for whenever a message is deleted.
 * 
 * @param message the deleted message
 * @returns en embed for logging,
 * or null if the message had neithe text nor attachments
 */
export const genMessageDeleteEmbed = (message: Message): EmbedBuilder | null => {
    // The components to log
    const content: string = message.content;
    const attachments: Collection<string, Attachment> = message.attachments;
    const author: User = message.author;

    // No embed generated if the message had no content nor attachments
    if (!content && !attachments.size) {
        return null;
    }

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(author.username)
        .setColor(ORANGE)
        .setAuthor({
            name: "Message deleted",
            iconURL: message.guild.iconURL()
        })
        .setTimestamp(message.createdAt)
        .addFields(
            { name: "Member ID", value: author.id, inline: true },
            { name: "Message ID", value: message.id, inline: true },
            { name: "Channel", value: message.channel.toString(), inline: false },
        );

    // Add if the message has text
    if (content) {
        embed.addFields(
            { name: "Content", value: content, inline: false }
        );
    }

    // Add if the message has attachments
    if (attachments.size) {
        let urls: string = "";

        for (const [, attachment] of attachments) {
            urls += `${attachment.url}\n`;
        }

        embed.addFields(
            { name: "Attachments", value: urls, inline: false }
        );
    }

    return embed;
};

// ----- !MESSAGE UPDATES -----
