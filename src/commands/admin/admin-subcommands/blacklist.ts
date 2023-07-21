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

import { SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User, Collection, Guild, DiscordAPIError } from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { MISSING_PERMISSIONS, defaultErrorHandler } from "../../../util/error-handler.js";
import { BlacklistT, Blacklist } from "../../../schemas/blacklist.js";
import { createBlacklist } from "../../../util/create-blacklist.js";

/*
 * A command for the administrators of Sushi Bot to use for
 * blacklisting users
 */

// 7 days in seconds
const BAN_DELETE_SECONDS: number = 604800;
const name: string = "blacklist";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Blacklist a user across all Sushi Bot's servers")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("The user to blacklist from Sushi Bot")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Why is this user is being blacklisted?")
                .setRequired(true)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // The user to blacklist
        const user: User = ctx.options.getUser("user");
        const uid: string = user.id;
        const reason: string = ctx.options.getString("reason");

        await ctx.deferReply();

        const bl: BlacklistT = await Blacklist.findById(process.env.BLACKLIST_ID);

        // Should ideally not be null but in the off-chance,
        // throw an error
        if (!bl) {
            await createBlacklist();
        }

        const users: string[] = bl.users;

        if (users.includes(uid)) {
            await ctx.followUp("The specified user is already blacklisted");
            return;
        }

        await ctx.followUp(`Commencing blacklisting of \`${user.id}\` (<@${user.id}>)...`);

        // All the servers that the bot is in
        const servers: Collection<string, Guild> = ctx.client.guilds.cache;

        // The report on whether it was successful or partially successful
        let report: string = `The user with ID \`${uid}\` (<@${user.id}>) has been blacklisted`;
        const fails: Guild[] = [];

        for await (const s of servers) {
            const server: Guild = s[1];
            try {
                // Try to ban the user from the server
                await server.bans.create(
                    user,
                    {
                        reason: reason,
                        deleteMessageSeconds: BAN_DELETE_SECONDS
                    }
                );
                
                // Confirm ban if successful
                await ctx.channel.send(`Banned **${user.username}** from **${server.name}**`);
            } catch (e) {
                // Add server to the list of failed bans
                fails.push(server);

                // Log information if possible
                if (e instanceof DiscordAPIError && (<DiscordAPIError> e).code === MISSING_PERMISSIONS) {
                    await ctx.channel.send(`Missing permissions in **${server.name}**, contact <@${server.ownerId}>`);
                } else {
                    await ctx.channel.send(`Something went wrong in **${server.name}**, contact <@${server.ownerId}>`);
                }
            }
        }

        // Add which users to contact if the blacklist partially failed
        if (fails.length) {
            report += " but I failed to ban them in these servers:\n";
            for (const server of fails) {
                report += `- **${server.name}**, contact <@${server.ownerId}>\n`;
            }
        } else {
            report += " in all my servers";
        }

        // Save to the database
        users.push(uid);
        await bl.save();

        await ctx.followUp(report);
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Blacklist")
        .setDescription(
            "An administrative command that adds a user to Sushi Bot's global blacklist and bans them from all " +
            "servers that Sushi Bot is in")
        .addFields(
            { name: "Format", value: `\`/admin ${name} <user>\`` },
            { name: "<user>", value: "Required parameter. The user to blacklist from Sushi Bot's servers" },
            { name: "<reason>", value: "Required parameter. The reason to blacklist the user" }
        )
};
