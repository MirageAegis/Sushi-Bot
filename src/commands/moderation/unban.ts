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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, User } from "discord.js";
import { Command } from "../../command-template.js";
import { defaultErrorHandler } from "../../error-handler.js";
import { UserIsMemberError } from "../../util/errors.js";
import { Action, genEmbed } from "../../util/mod-embed-factory.js";

/*
 * Kicks a member from a server
 * This command can only be used by members with the "kick members" permission
 */

const name: string = "unban";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Unban a user")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(o => 
            o.setName("user")
                .setDescription("User to ban (use user ID)")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Why is this user is being unbanned?")
        )
        .addBooleanOption(o =>
            o.setName("verbose")
                .setDescription("Should the response be shown?")
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Check if the user is already a server member
        if (ctx.options.getMember("user")) {
            throw new UserIsMemberError();
        }

        // Default values for parameters

        const user: User = ctx.options.getUser("user") ?? null;
        const reason: string = ctx.options.getString("reason") ?? null;
        const verbose: boolean = ctx.options.getBoolean("verbose") ?? false;

        await ctx.guild.bans.remove(user, reason);

        const embed: EmbedBuilder = genEmbed(user, ctx.guild, Action.UNBAN, reason);

        await ctx.reply({
            embeds: [embed],
            ephemeral: !verbose
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Unban")
        .setDescription("A moderation command for unbanning users from the server the command is executed in")
        .addFields(
            { name: "Format", value: `\`/${name} <user> [reason] [verbose]\`` },
            { name: "<user>", value: "Required parameter. The user to unban" },
            { name: "[reason]", value: "Optional parameter. The reason, if any, to unban the user"},
            { name: "[verbose]", value: "Optional parameter. If the unban should be shown to the others in the channel. Defaults to not showing" }
        )
};
