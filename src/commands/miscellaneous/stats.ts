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
import { execSync } from "node:child_process";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { AZURE } from "../../util/colours.js";
import { Bot } from "../../util/bot.js";

/*
 * Displays the current stats of the bot in a rich embed.
 * The stats include the bot's current uptime, amount of servers it's in,
 * the date it was created, and its current version.
 */

let hash: string;

// Let the hash be the hash of the latest commit if in a repo,
// otherwise it's "Untracked"
if (process.platform === "win32") {
    // Execute this in PowerShell if running on Windows
    hash = execSync(
        "if (git rev-parse --is-inside-work-tree 2>$null) {\n" +
        "    git rev-parse --short HEAD\n" +
        "} else {\n" +
        "    echo \"Unofficial\"\n" +
        "}",
        {
            cwd: process.cwd(),
            shell: "powershell.exe"
        }
    )
        .toString()
        .trim();
} else {
    // Otherwise run this
    hash = execSync(
        "if git rev-parse --is-inside-work-tree 1>/dev/null 2>/dev/null; then\n" +
        "    git rev-parse --short HEAD;\n" +
        "else\n" +
        "    echo \"Unofficial\";\n" +
        "fi",
        { cwd: process.cwd() }
    )
        .toString()
        .trim();
}

const millisPerSecs: number = 1000;
const secsPerMin: number = 60;
const secsPerHour: number = 3600;
const secsPerDay: number = 86400;

/**
 * Generates a string representing the bot's uptime
 * 
 * @param uptime the uptime of the bot in seconds
 * @returns a formatted string
 */
const formatUptime = (uptime: number): string => {
    // Total seconds translated to hours, minutes, seconds
    const days: number = Math.floor(uptime / secsPerDay);
    const hours: number = Math.floor(Math.floor(uptime % secsPerHour) / secsPerHour);
    const minutes: number = Math.floor(Math.floor(uptime % secsPerHour) / secsPerMin);
    const seconds: number = Math.floor(Math.floor(uptime % secsPerHour) % secsPerMin);

    return `${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`;
};

const name: string = "stats";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("View the current statistics of the bot")
        .setDMPermission(false),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Generate embed with bot stats
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Stats")
            .setColor(AZURE)
            .setDescription("These are the current stats of Sushi Bot")
            .setAuthor({
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
                    value: formatUptime(ctx.client.uptime / millisPerSecs),
                    inline: false
                },
                {
                    name: "Version",
                    value: `${process.env.npm_package_version} (${hash})`,
                    inline: false
                },
                {
                    name: "Commands",
                    value: `${(<Bot> ctx.client).commands.size}`,
                    inline: false
                }
            )
            .setFooter({ text: "Bot runs locally" });

        await ctx.reply({ embeds: [embed] });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Status")
        .setDescription(
            "A command that displays the current stats of Sushi Bot.\n" +
            "It contains the bot's date of creation, server count, uptime, version, and command count"
        )
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
