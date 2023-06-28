import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { Command } from "./command-template.js";

// Loads the environment variables
require("dotenv").config();

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

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
        const cmd: Command = require(cmdPath).default;

        // If the imported file is a valid command, add it
        if ("data" in cmd && "execute" in cmd && "help" in cmd) {
            commands.push(cmd.data.toJSON());
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// and deploy your commands!
(async (): Promise<void> => {
    try {
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
