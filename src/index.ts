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
import {
    ActivityType, Client, Events, GatewayIntentBits, Interaction
} from "discord.js";
import { Command } from "./util/command-template.js";
import { init, loadListeners } from "./util/init.js";
import { onButtonPressed } from "./events/reactionroles.js";
import { reactionRolesErrorHandler } from "./util/error-handler.js";
import { Bot } from "./util/bot.js";

// Loads the environment variables
require("dotenv").config();

// Client instance with all required intents
const client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
    ],
    presence: {
        status: "online",
        activities: [{
            name: "The World of Sushis!",
            type: ActivityType.Playing
        }]
    }
});

// Listener for the on ready event
client.once(Events.ClientReady, async (c: Client): Promise<void> => {
    console.log("Running initialisation routines...");
    await init(c);
    console.log("Done initialising!");
    
    console.log(`Bot ready! I'm ${c.user.tag}!`);
});

loadListeners(client);


// ----- LOAD COMMANDS -----

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
        const cmd: Command = require(cmdPath).command;
        
        
        // If the imported file is a valid command, add it
        if ("data" in cmd && "execute" in cmd && "error" in cmd && "help" in cmd) {
            client.commands.set(cmd.data.name, cmd);
        } else { // Otherwise print a warning
            console.log(`---WARNING--- ${cmdPath} exports a command without the required "data", "execute", or "help" property.`);
        }
    }
}

// Interaction handler
client.on(Events.InteractionCreate, async (ctx: Interaction): Promise<void> => {
    // Process button interactions
    if (ctx.isButton()) {
        try {
            await onButtonPressed(ctx);
        } catch (e) {
            await reactionRolesErrorHandler(ctx, e);
        }
        return;
    }

    // Process autocomplete interactions
    if (ctx.isAutocomplete()) {
        // Get the command from the command register
        const cmd: Command = client.commands.get(ctx.commandName);
        
        // If the command is not found, inform the user and log the error
        if (!cmd) {
            console.error(`Command ${ctx.commandName} not found.`);
            return;
        }

        await cmd.autocomplete(ctx);
        return;
    }
    
    // Process commands
    if (ctx.isChatInputCommand()) {
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
            await cmd.error(ctx, e);
        }
    }
});

// ----- END LOAD COMMANDS -----

// Log in to Discord with the login token
client.login(process.env.TOKEN);
