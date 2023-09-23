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
    SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Snowflake,
    GuildMember, Collection
} from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { AZURE } from "../../util/colours.js";

/*
 * Displays the current stats of a server in a rich embed.
 * The stats include the Number of users, users who are online,
 * and bots in that server
 */

const millisPerSecs: number = 1000;

const name: string = "serverstats";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("View the current statistics of this server")
        .setDMPermission(false),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        await ctx.deferReply();

        // Server members
        const allMembers: Collection<Snowflake, GuildMember> = await ctx.guild.members.fetch({
            withPresences: true
        });

        // The number of users in the server
        let users: number = 0;
        // The number of users who are online in the server
        let online: number = 0;
        // The number of bots in the server
        let bots: number = 0;

        for (const [, member] of allMembers) {
            if (member.user.bot) {
                // Increment bots if the member is a bot
                bots++;
            } else if (member.presence && member.presence.status !== "offline") {
                // Increment users and online if the member isn't offline
                users++;
                online++;
            } else {
                // Otherwise only increase users
                users++;
            }
        }

        // Generate embed with server stats
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Server stats")
            .setColor(AZURE)
            .setDescription(`These the current stats of ${ctx.guild.name}`)
            .setAuthor({
                name: ctx.guild.name,
                iconURL: ctx.guild.iconURL()
            })
            .setFields(
                {
                    name: "Created",
                    value: `<t:${Math.floor(ctx.guild.createdTimestamp / millisPerSecs)}:f>`,
                    inline: false
                },
                {
                    name: "Owner",
                    value: `${await ctx.guild.fetchOwner()}`,
                    inline: false
                },
                {
                    name: "Members",
                    value: `${users}`,
                    inline: false
                },
                {
                    name: "Online",
                    value: `${online}`,
                    inline: false
                },
                {
                    name: "Offline",
                    value: `${users - online}`
                },
                {
                    name: "Bots",
                    value: `${bots}`,
                    inline: false
                }
            );

        await ctx.followUp({ embeds: [embed] });
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Serverstats")
        .setDescription(
            "A command that displays the current stats of the server it's executed in.\n" +
            "It contains the server owner, member count, online member count, " +
            "offline member count, and bot count"
        )
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
