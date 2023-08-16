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

import { EmbedBuilder, Guild, GuildMember, User } from "discord.js";
import { BLUE, RED, YELLOW } from "./colours";

export enum Action {
    KICK,
    BAN,
    UNBAN
}

/**
 * An embed factory for kicking, banning, and unbanning users
 * 
 * @param user the Discord user this action concerns
 * @param server the server this action is performed in
 * @param action the type of action performed
 * @param reason the reason for the action
 */
export const genEmbed = (user: User | GuildMember, server: Guild, action: Action, reason: string = null): EmbedBuilder => {
    // The embed for the moderation action
    const embed: EmbedBuilder = new EmbedBuilder();

    // Constant for converting millisecond timestamps to regular timestamps
    const millisToSecs: number = 1000;

    // Set the title and colour of the embed depending on the action
    switch (action) {
        case Action.KICK:
            embed.setAuthor({ name: "User kicked", iconURL: server.iconURL() })
                .setColor(YELLOW);
            break;
        case Action.BAN:
            embed.setAuthor({ name: "User banned", iconURL: server.iconURL() })
                .setColor(RED);
            break;
        case Action.UNBAN:
            embed.setAuthor({ name: "User unbanned", iconURL: server.iconURL() })
                .setColor(BLUE);
            break;
    }

    // Convert member objects to user objects, to access the username
    const userObj: User = user instanceof GuildMember ? user.user : user;

    // Username displayed in the embed
    const username: string = userObj.username;
    // The user discriminator
    const discriminator: string = userObj.discriminator;

    // Fill in the rest on the embed
    embed.setTitle(`${username}${discriminator === "0" ? "" : `#${discriminator}`}`)
        .setThumbnail(userObj.avatarURL())
        .addFields(
            {
                name: "User ID", value: `${userObj.id}`, inline: true
            },
            {
                name: "Created", value: `<t:${Math.floor(userObj.createdTimestamp / millisToSecs)}>`, inline: true
            },
            {
                name: "Joined", value: user instanceof GuildMember ? `<t:${Math.floor(user.joinedTimestamp / millisToSecs)}>` : "N/A", inline: true
            },
            {
                name: "Reason", value: reason ?? "N/A", inline: true
            },
            {
                name: "Bot user", value: `${userObj.bot}`, inline: true
            },
            {
                name: "System user", value: `${userObj.system}`, inline: true
            }
        );

    return embed;
};
