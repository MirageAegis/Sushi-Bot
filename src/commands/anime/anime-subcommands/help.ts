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
import { SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Collection } from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { MAGENTA } from "../../../util/colours.js";

/*
 * The help command for all anime commands
 *
 * This command module differs from all other commands because it needs to load them
 * to access the help embed of each command
 */

// The default help window to show when no command is specified
const defaultEmbed: EmbedBuilder = new EmbedBuilder()
    .setTitle("Anime Help")
    .setDescription("Here are all the anime commands! Use `/anime help <command>` to get help for a specific command")
    .setColor(MAGENTA);


// ----- LOAD HELP COMMAND EMBEDS -----

const commands: Collection<string, EmbedBuilder> = new Collection();

// The the contents of this folder
const cmdFiles: string[] = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));

// The string used to accumulate all commands
let cmdstr: string = "";

// Look through each JS file in each command in this folder
for (const file of cmdFiles) {
    // Skip this file
    if (file === "help.js") {
        cmdstr += "`/anime help`, ";
        continue;
    }

    // Get the path of the current directory (/src) > "commands" > "configuration" > "config-subcommands" > command
    const cmdPath: string = path.join(__dirname, file);
    const cmd: Subcommand = require(cmdPath).command;
    
    // If the imported file is a valid command, add it
    if ("data" in cmd && "execute" in cmd && "error" in cmd && "help" in cmd) {
        const name: string = cmd.data.name;
        // The colour is set to magenta here
        commands.set(name, cmd.help.setColor(MAGENTA));
        cmdstr += `\`/anime ${name}\`, `;
    }
}
// Remove the dangling comma
// eslint-disable-next-line no-magic-numbers
cmdstr = cmdstr.slice(0, cmdstr.length - 2);

defaultEmbed.addFields({ name: "Commands", value: cmdstr });

const name: string = "help";

// Help command embed
const help: EmbedBuilder = new EmbedBuilder()
    .setTitle("Help")
    .setDescription("The help command which displays useful command information!")
    .addFields(
        { name: "Format", value: `\`/anime ${name} [command]\`` },
        { name: "[command]", value: "Optional parameter. The command that you want to know more about" }
    )
    .setColor(MAGENTA);

// Add the help field of the help command
commands.set("help", help);

// The command choices for the help command
// with the required fields in each choice
const choices = Array.from(commands.keys()).map((cmd: string): { name: string, value: string } => {
    return { name: cmd, value: cmd };
});

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Need help with anime commands?")
        .addStringOption(o =>
            o.setName("command")
                .setDescription("The command to get more information about")
                .addChoices(...choices)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Get the topic if it exists
        const command = ctx.options.getString("command") ?? null;
        
        // If there is a topic, send its embed
        if (command) {
            // Set the embed author field to "Help" and add the server's icon
            const embed = commands.get(command)
                .setAuthor({ name: "Help", iconURL: ctx.guild.iconURL() });
            await ctx.reply({ embeds: [embed] });
            return;
        } else { // Otherwise send the default help window
            defaultEmbed.setAuthor({ name: "Help", iconURL: ctx.guild.iconURL() });
            await ctx.reply({ embeds: [defaultEmbed] });
            return;
        }
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: help
};
