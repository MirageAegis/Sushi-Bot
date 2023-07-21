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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, User, Guild, TextChannel, Message } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { Blacklist, BlacklistT } from "../../schemas/blacklist.js";
import { createBlacklist } from "../../util/create-blacklist.js";
import { getUserReportsChannel } from "../../util/channels.js";

/*
 * Command for alerting the administrators about someone to blacklist
 */

const name: string = "blacklist";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Alert the Sushi admins about a potentially dangerous individual")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(o => 
            o.setName("user")
                .setDescription("User to report")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Why should this user be blacklisted? Provide a short paragraph")
                .setRequired(true)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // The user to blacklist
        const user: User = ctx.options.getUser("user");
        const uid: string = user.id;

        // The reason provided by the mod/admin
        const reason: string = ctx.options.getString("reason");

        // The server this command was executed in
        const server: Guild = ctx.guild;
        // The user who used this command
        const source: User = ctx.user;
        // The channel to log the report in
        const userReports: TextChannel = getUserReportsChannel();

        await ctx.deferReply({ ephemeral: true });

        const bl: BlacklistT = await Blacklist.findById(process.env.BLACKLIST_ID);

        // Should ideally not be null but in the off-chance,
        // recreate it
        if (!bl) {
            await createBlacklist();
        }

        const users: string[] = bl.users;

        if (users.includes(uid)) {
            await ctx.followUp({ content: "The specified user is already blacklisted", ephemeral: true });
            return;
        }

        // Log the report in the user reports channel
        const reportMsg: Message = await userReports.send(
            "# USER REPORT\n" +
            `**Server:** ${server.name}\n` +
            `**Sent by:** <@${source.id}>\n` +
            `**Target:** <@${user.id}>\n` +
            `**Reason:** ${reason}\n` +
            "--------------------"
        );

        // Add reactions for the admins to use
        // Yellow for process started and green for process finished
        await reportMsg.react("🟡");
        await reportMsg.react("🟢");

        await ctx.followUp({
            content: "A report has been sent to the administrators, they will contact you as soon as possible. " +
                     "Make sure that you have a sound argument and evidence of any potentially dangerous actions!\n" +
                     `In the meantime, ban **${user.username}** from this server if you haven't already`,
            ephemeral: true
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Blacklist")
        .setDescription(
            "An administrative command for reporting dangerous individuals that should be kept away from VTuber communities." +
            "Blacklisted users are automatically banned from every server that Sushi Bot is in\n" +
            "**__DO NOT SPAM THIS COMMAND. FAILING TO COMPLY MAY RESULT IN HAVING ACCESS TO SUSHI BOT REVOKED__**"
        )
        .addFields(
            { name: "Format", value: `\`/${name} <user>\`` },
            { name: "<user>", value: "Required parameter. The user to report" }
        )
};
