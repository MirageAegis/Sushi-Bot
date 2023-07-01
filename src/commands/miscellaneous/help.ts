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

import fs from "node:fs";
import path from "node:path";
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../command-template.js";
import { defaultErrorHandler } from "../../error-handler.js";

/*
 * The help command of the bot, which displays information
 * about the commands that the bot has
 */

/*
 * This command module differs from all other commands because it needs to load them
 * to access the help embed of each command
 */

const EMBED_COLOUR: number = 0xE91E63;

// The default help window to show when no topic is specified
const defaultEmbed: EmbedBuilder = new EmbedBuilder()
    .setTitle("General Help")
    .setDescription("Here are my commands! Use `/help <topic>` to get help for a specific command")
    .setColor(EMBED_COLOUR);


// ----- LOAD HELP COMMAND EMBEDS -----

const commands: Map<string, EmbedBuilder> = new Map();

// Get the path of the commands directory (./src) > "commands"
const cmdFoldersPath: string = path.join(__dirname, "..");
const cmdFolders: string[] = fs.readdirSync(cmdFoldersPath);

// Look through each command category folder
for (const folder of cmdFolders) {
    // Get the path of the current directory (./src) > "commands" > category
    const cmdFolder: string = path.join(cmdFoldersPath, folder);
    const cmdFiles: string[] = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"));

    let categoryCommands: string = "";

    // Look through each JS file in each command category folder
    for (const file of cmdFiles) {
        // Skip this file
        if (file === "help.js") {
            categoryCommands += "`/help`, ";
            continue;
        }
        
        // Get the path of the current directory (./src) > "commands" > category > command
        const cmdPath: string = path.join(cmdFolder, file);
        const cmd: Command = require(cmdPath).default;
        
        // If the imported file is a valid command, add it
        if ("data" in cmd && "execute" in cmd && "help" in cmd) {
            const name: string = cmd.data.name;
            // The colour is set to magenta here
            commands.set(name, cmd.help.setColor(EMBED_COLOUR));
            categoryCommands += `\`/${name}\`, `;
        }
    }

    // Remove the dangling comma
    // eslint-disable-next-line no-magic-numbers
    categoryCommands = categoryCommands.slice(0, categoryCommands.length - 2);

    // Capitalise the category name
    const name: string = folder.replace(folder[0], folder[0].toUpperCase());
    defaultEmbed.addFields({ name: name, value: categoryCommands });
}

const name: string = "help";

// Help command embed
const help: EmbedBuilder = new EmbedBuilder()
    .setTitle("Help")
    .setDescription("The help command which displays useful command information!")
    .addFields(
        { name: "Format", value: `\`/${name} [topic]\`` },
        { name: "[topic]", value: "Optional parameter. The command that you want to know more about" }
    )
    .setColor(EMBED_COLOUR);

// Add the help field of the help command
commands.set("help", help);

// The command choices for the help command
// with the required fields in each choice
const choices = Array.from(commands.keys()).map((cmd: string): { name: string, value: string } => {
    return { name: cmd, value: cmd };
});

// ----- END LOAD HELP COMMAND EMBEDS -----


export default {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("Wanna know more about me?")
        .setDMPermission(false)
        .addStringOption(o =>
            o.setName("topic")
                .setDescription("The topic to get more information about")
                .addChoices(...choices)
        ),
    
    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Get the topic if it exists
        const topic = ctx.options.getString("topic") ?? null;
        
        // If there is a topic, send its embed
        if (topic) {
            // Set the embed author field to "Help" and add the server's icon
            const embed = commands.get(topic)
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
} as Command;
