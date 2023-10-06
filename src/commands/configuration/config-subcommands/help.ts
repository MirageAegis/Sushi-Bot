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

import fs from "node:fs";
import path from "node:path";
import { SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Collection, AutocompleteInteraction } from "discord.js";
import { MAX_CHOICES, Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { MAGENTA } from "../../../util/colours.js";

/*
 * The help command for all config commands
 *
 * This command module differs from all other commands because it needs to load them
 * to access the help embed of each command
 */

// The default help window to show when no command is specified
const defaultEmbed: EmbedBuilder = new EmbedBuilder()
    .setTitle("Config Help")
    .setDescription("Here are my server configuration commands! Use `/config help <command>` to get help for a specific command")
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
        cmdstr += "`/config help`, ";
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
        cmdstr += `\`/config ${name}\`, `;
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
        { name: "Format", value: `\`/config ${name} [command]\`` },
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
        .setDescription("Need help with my server configuration commands?")
        .addStringOption(o =>
            o.setName("command")
                .setDescription("The command to get more information about")
                .addChoices(...choices)
        ),

    // Option autocompleter
    async autocomplete(ctx: AutocompleteInteraction): Promise<void> {
        // The value that the user has entered
        const focusedValue: string = ctx.options.getFocused() ?? "";
        // Filter out everything that doesn't start with the entered string
        let filtered: { name: string, value: string }[] = choices.filter(c =>
            c.name.includes(focusedValue)
        );
        
        // Slice the array if it's too large
        if (filtered.length > MAX_CHOICES) {
            // eslint-disable-next-line no-magic-numbers
            filtered = filtered.slice(0, MAX_CHOICES);
        }
        await ctx.respond(filtered);
    },
    
    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Get the command if it exists
        const command = ctx.options.getString("command") ?? null;
        
        // If no command was provided, send the default help window
        if (!command) {
            defaultEmbed.setAuthor({ name: "Help", iconURL: ctx.guild.iconURL() });
            await ctx.reply({ embeds: [defaultEmbed] });
            return;
        }

        // Otherwise try to send the corresponding help window
        const embed: EmbedBuilder = commands.get(command);

        // Check if the command exists
        if (!embed) {
            await ctx.reply(`\`/${command}\` isn't a valid command!`);
            return;
        }

        // Set the embed author field to "Help" and add the server's icon
        embed.setAuthor({ name: "Help", iconURL: ctx.guild.iconURL() });
        await ctx.reply({ embeds: [embed] });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: help
};
