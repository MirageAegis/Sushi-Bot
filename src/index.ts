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

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Events, GatewayIntentBits, Interaction } from "discord.js";
import { Command } from "./command-template.js";

// Loads the environment variables
require("dotenv").config();

/**
 * Wrapper class adding a collection of slash commands
 * to a Discord Client
 */
class Bot extends Client {
    /**
     * A collection of slash commands that the bot has
     */
    public commands: Collection<string, Command>;
}

// Client instance with all required intents
const client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    presence: {
        status: "online",
        activities: [{
            name: "The World of sushis!",
            type: 0  // Playing
        }]
    }
});

// Listener for the on ready event
client.once(Events.ClientReady, (c: Client): void => {
    console.log(`Bot ready! I'm ${c.user.tag}!`);
});


// ----- LOAD COMMANDS -----

client.commands = new Collection();

// Get the path of the commands directory (./src) > "commands"
const cmdFoldersPath: string = join(__dirname, "commands");
const cmdFolders: string[] = readdirSync(cmdFoldersPath);

// Look through each command category folder
for (const folder of cmdFolders) {
    // Get the path of the current directory (./src) > "commands" > category
    const cmdFolder: string = join(cmdFoldersPath, folder);
    const cmdFiles: string[] = readdirSync(cmdFolder).filter(f => f.endsWith(".js"));
    
    // Look through each JS file in each command category folder
    for (const file of cmdFiles) {
        // Get the path of the current directory (./src) > "commands" > category > command
        const cmdPath: string = join(cmdFolder, file);
        const cmd: Command = require(cmdPath).default;
        
        
        // If the imported file is a valid command, add it
        if ("data" in cmd && "execute" in cmd && "help" in cmd) {
            client.commands.set(cmd.data.name, cmd);
        } else { // Otherwise print a warning
            console.log(`---WARNING--- ${cmdPath} exports a command without the required "data", "execute", or "help" property.`);
        }
    }
}

// Command handler
client.on(Events.InteractionCreate, async (ctx: Interaction) => {
    // Do nothing if it's not a chat command
    if (!ctx.isChatInputCommand()) {
        return;
    }
    
    // Get the command from the command register
    const cmd: Command = client.commands.get(ctx.commandName);
    
    // If the command is not found, inform the user and log the error
    if (!cmd) {
        console.error(`Command ${ctx.commandName} not found.`);
        return;
    }
    
    // Try to run the command
    try {
        await cmd.execute(ctx);
    } catch (e) { // Command error handling
        console.error(e);
        if (ctx.replied || ctx.deferred) {
            await ctx.followUp({
                content: "Oops! Something seems to have gone wrong...",
                ephemeral: true
            });
        } else {
            await ctx.reply({
                content: "Oops! Something seems to have gone wrong...",
                ephemeral: true
            });
        }
    }
});

// ----- END LOAD COMMANDS -----


// Log in to Discord with the login token
client.login(process.env.TOKEN);
