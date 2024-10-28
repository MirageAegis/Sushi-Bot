/*
 * MIT License
 *
 * Copyright (c) 2024-present Fabian "Splitzy" Sales
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

import fs from "node:fs";
import path from "node:path";
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Collection, PermissionsBitField } from "discord.js";
import { Command, Subcommand } from "../../util/command-template.js";

/*
 * The top level anime command
 * 
 * This command is a little different because it encompasses all anime
 * commands in the form of subcommands
 */

const name: string = "anime";

const data = new SlashCommandBuilder()
    .setName(name)
    .setDescription("A collection of anime commands")
    .setDMPermission(false)

const subcommands: Collection<string, Subcommand> = new Collection();

const subcmdFolder: string = path.join(__dirname, "anime-subcommands");
const subcmdFiles: string[] = fs.readdirSync(subcmdFolder).filter(f => f.endsWith(".js"));

// Load all admin subcommands
for (const file of subcmdFiles) {
    const subcmdPath: string = path.join(subcmdFolder, file);
    const subcmd: Subcommand = require(subcmdPath).command;

    const name: string = subcmd.data.name;

    subcommands.set(name, subcmd);
    data.addSubcommand(subcmd.data);
}

export const command: Command = {
    // Command headers
    data: data,

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const subcmd = ctx.options.getSubcommand();

        // Execute the requested subcommand
        await subcommands.get(subcmd).execute(ctx);
    },

    // Error handler
    async error(ctx: ChatInputCommandInteraction, err: Error): Promise<void> {
        const subcmd = ctx.options.getSubcommand();

        // Execute the requested subcommand's error handler
        await subcommands.get(subcmd).error(ctx, err);
    },

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Anime")
        .setDescription(
            `Commands for Kitsu Anime API. Use \`/${name} help\` for information about these commands.`
        )
        .addFields(
            { name: "Format", value: `\`/${name} <subcommand>\`` },
            { name: "<subcommand>", value: "The subcommand to use" }
        )
};
