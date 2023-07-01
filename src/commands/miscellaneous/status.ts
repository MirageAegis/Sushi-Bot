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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../command-template.js";
import { defaultErrorHandler } from "../../error-handler.js";
import { BLUE } from "../../util/colours.js";

/*
 * Displays the current status of the bot in a rich embed.
 * The stats include the bot's current uptime, amount of servers it's in,
 * the date it was created, and its current version.
 */

const millisToSecs: number = 1000;
const secsPerMin: number = 60;
const secsPerHour: number = 3600;

/**
 * Generates a string representing the bot's uptime
 * 
 * @param uptime the uptime of the bot in seconds
 * @returns a formatted string
 */
const formatUptime = (uptime: number): string => {
    // Total seconds translated to hours, minutes, seconds
    const hours: number = Math.floor(uptime / secsPerHour);
    const minutes: number = Math.floor(Math.floor(uptime % secsPerHour) / secsPerMin);
    const seconds: number = Math.floor(Math.floor(uptime % secsPerHour) % secsPerMin);

    return `${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`;
};

// Static embed data
const embed: EmbedBuilder = new EmbedBuilder()
    .setTitle("Status")
    .setColor(BLUE)
    .setDescription("This is the current status of Sushi Bot")
    .setFooter({ text: "Bot runs locally" });

const name: string = "status";

export default {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("View the current statistics of the bot")
        .setDMPermission(false),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Dynamically fetch the bot's data
        embed.setAuthor({
            name: "Sushi Bot",
            iconURL: ctx.client.user.avatarURL()
        })
            .setFields(
                {
                    name: "Bot Created",
                    value: "2020-11-08",
                    inline: true
                },
                {
                    name: "Servers",
                    value: `${ctx.client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: "Uptime",
                    value: formatUptime(ctx.client.uptime / millisToSecs),
                    inline: false
                },
                {
                    name: "Developers",
                    value: "<@123456133368119296>\n\n" +
                           "Feel free to leave suggestions and report bugs to us!",
                    inline: false
                },
                {
                    name: "Version",
                    value: process.env.npm_package_version
                }
            );

        await ctx.reply({ embeds: [embed] });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Status")
        .setDescription(
            "A command that displays the current status of Sushi Bot.\n" +
            "It contains the bot's date of creation, server count, uptime, developers, and version"
        )
        .addFields(
            { name: "Format", value: `\`/name\`` }
        )
} as Command;
