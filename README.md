# Sushi Bot
Sushi Bot is currently a work in progress.
The vision for Sushi Bot is a general purpose Discord bot for VTubers,
with a variety of commands and a chat experience system with an RPG.

## Prerequisites

### Node.js and npm
Sushi Bot is built on [Node.js v18 (Hydrogen)][node v18]
and therefore requires it to run. Select the appropriate installation
for your system and follow the setup instructions.

**For Windows users:** \
Get the installer [here][node win]

**For macOS users:** \
Get the installer [here][node mac]

**For Linux users:** \
Refer to [Installing Node.js via package manager][node pm]
and make sure to install Node v18

### Discord bot
The programme needs a Discord bot to connect to. You can make
a bot in Discord's [developer portal][ddev]
by creating a new application.

The bot also need all of the privileged intents to function properly.

### MongoDB
The programme needs a Mongo database to connect to for storing data.
You can either use MongoDB Atlas, a cloud database; or a local Mongo
database.

### Tenor
The programme needs a Tenor API key for the GIFs used in the action
commands.

## Getting Started
To set up your own instance of Sushi Bot, follow these steps:
1. Download the files from the latest release and unzip the folder.
2. Navigate to the root folder of the project. (The one containing `package.json`)
3. Install all dependencies needed with `npm i`.
4. Compile the source files with `npm run build`.
5. Create a `.env` file based on [`example.env`](./example.env).
6. Add the required secrets to your newly created `.env` file.
7. Deploy the bot's commands with `npm run update`.
8. Start the bot with `npm start`.

That's it, you should now have your own instance of Sushi Bot running!

## Limitations
Although Sushi Bot is open source, the main bot will only run in
verified VTubers' Discord servers. That being said, you are free to
run your own instance of Sushi Bot if you wish to.

## Planned Features
- Chat experience system
- An RPG using the chat experience system
- A VTuber library
- And more

## Contributing

Read through our [contributing guidelines](./CONTRIBUTING.md) before making any contributions.

There are also additional guidelines in our wiki regarding code convention if
you want to contribute code.

## License

This project is licensed under the MIT license - see [LICENSE](./LICENSE) for details.

## Community
Join the [Sushi Hub][sushi hub] community to interact with
other Sushi Bot users and the Sushi Bot developers!

[node v18]: https://nodejs.org/dist/v18.17.1/
[node win]: https://nodejs.org/dist/v18.16.1/node-v18.16.1-x64.msi
[node mac]: https://nodejs.org/dist/v18.16.1/node-v18.16.1.pkg
[node pm]: https://nodejs.org/en/download/package-manager
[ddev]: https://discord.com/developers/applications
[sushi hub]: https://discord.gg/Pqv2JkDKAg
