/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
 * Copyright (c) 2023-present Zahatikoff
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

import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { Command } from "./util/command-template.js";

// Loads the environment variables
require("dotenv").config();

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const adminCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

// Get the path of the commands directory (./src) > "commands"
const cmdFoldersPath: string = path.join(__dirname, "commands");
const cmdFolders: string[] = fs.readdirSync(cmdFoldersPath);

// Look through each command category folder
for (const folder of cmdFolders) {
    // Get the path of the current directory (./src) > "commands" > category
    const cmdFolder: string = path.join(cmdFoldersPath, folder);
    const cmdFiles: string[] = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"));

    // Look through each JS file in each command category folder
    for (const file of cmdFiles) {
        // Get the path of the current directory (./src) > "commands" > category > command
        const cmdPath: string = path.join(cmdFolder, file);
        const cmd: Command = require(cmdPath).command;

        // If the imported file is a valid command, add it
        if ("data" in cmd && "execute" in cmd && "error" in cmd && "help" in cmd) {
            // Add the admin commands to a different array to be loaded as server commands
            // in the admin/official server
            if (folder === "admin") {
                adminCommands.push(cmd.data.toJSON());
                continue;
            }

            commands.push(cmd.data.toJSON());
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// and deploy your commands!
(async (): Promise<void> => {
    try {
        console.log(`Started refreshing ${adminCommands.length} admin application (/) commands.`);

        // The put method is used to fully refresh all commands with the current set
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adminData: any = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.ADMIN_SERVER_ID),
            { body: adminCommands }
        );

        console.log(`Successfully reloaded ${adminData.length} admin application (/) commands.`);
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands with the current set
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (e) {
        // And of course, make sure you catch and log any errors!
        console.error(e);
    }
})();
