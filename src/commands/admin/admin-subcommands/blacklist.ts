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

import { 
    SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User,
    Collection, Guild, DiscordAPIError, ButtonBuilder, ButtonStyle, ActionRowBuilder,
    Message, CollectorFilter, ButtonInteraction, MessageComponentInteraction
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { MISSING_PERMISSIONS, defaultErrorHandler } from "../../../util/error-handler.js";
import { Blacklist } from "../../../schemas/blacklist.js";
import { RED } from "../../../util/colours.js";

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
        const reason: string = `Sushi Bot Blacklist: ${ctx.options.getString("reason")}`;

        await ctx.deferReply();

        const bl: Blacklist = await Blacklist.get();

        const users: ReadonlyMap<string, string> = bl.users;

        // Do nothing if the user has already been blacklisted
        if (users.get(uid)) {
            await ctx.followUp("The specified user is already blacklisted");
            return;
        }

        const millisToSecs: number = 1000;

        // Ask for confirmation before blacklisting the target user
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle(`Blacklist ${user.username}?`)
            .setDescription("The following action will be difficult to reverse, are you sure?")
            .setColor(RED)
            .setAuthor({ name: "Blacklist", iconURL: ctx.client.user.avatarURL() })
            .setThumbnail(user.avatarURL())
            .addFields(
                { name: "User ID", value: user.id, inline: true },
                { name: "Created", value: `<t:${Math.floor(user.createdTimestamp / millisToSecs)}>`, inline: true },
                { name: "Reason", value: reason }
            );
        
        const yes: ButtonBuilder = new ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success);
        
        const no: ButtonBuilder = new ButtonBuilder()
            .setCustomId("no")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger);

        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yes, no);

        const prompt: Message = await ctx.followUp({
            embeds: [embed],
            components: [row]
        });

        // Check if the user pressing the button is the same user
        const check: CollectorFilter<[ButtonInteraction]> = (m: ButtonInteraction): boolean => m.user.id === ctx.user.id;

        // Disable the buttons to signify that the interaction has ended
        row.components.forEach(c => c.setDisabled(true));

        try {
            const confirmation: MessageComponentInteraction = await prompt.awaitMessageComponent({ filter: check, time: 10_000 });

            // End the interaction as soon as a button is pressed
            await confirmation.update({
                components: [row]
            });

            // If the user selected no, abort blacklisting
            if (confirmation.customId === "no") {
                await ctx.followUp("Blacklisting denied, aborting opertation");
                return;
            }
        } catch (e) {
            // End the interaction upon timeout
            await prompt.edit({
                components: [row]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp("Interaction timed out, aborting operation");
            return;
        }

        // Proceed if the user pressed yes
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
        await bl.add(uid, reason);

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
            { name: "Format", value: `\`/admin ${name} <user> <reason>\`` },
            { name: "<user>", value: "Required parameter. The user to blacklist from Sushi Bot's servers" },
            { name: "<reason>", value: "Required parameter. The reason to blacklist the user" }
        )
};
