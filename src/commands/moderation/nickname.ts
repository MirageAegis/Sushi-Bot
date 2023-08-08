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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, GuildMember } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { NoMemberFoundError } from "../../util/errors.js";

/*
 * A command for changing the nickname of a server member
 */

const name: string = "nickname";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Change the nickname of a server member")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageNicknames)
        .addUserOption(o =>
            o.setName("member")
                .setDescription("The member to change nickname for")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("new_nickname")
                .setDescription("The new nickname for the user")
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Why is the member's nickname being changed?")),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const member: GuildMember = <GuildMember> ctx.options.getMember("member") ?? null;

        // Check if the user is a member
        if (!member) {
            throw new NoMemberFoundError();
        }

        const oldNick: string = member.displayName;
        const newNick: string = ctx.options.getString("new_nickname") ?? null;
        const reason: string = ctx.options.getString("reason") ?? null;

        await member.setNickname(newNick, reason);

        await ctx.reply({
            content: `Changed **${member.user.username}** from **${oldNick}** to **${newNick}**`
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Nickname")
        .setDescription("A moderation command for changing the fickname of a server member")
        .addFields(
            { name: "Format", value: `\`/${name} <member> [new_nickname] [reason]\`` },
            { name: "<member>", value: "Required parameter. The member to change nickname for" },
            { name: "[new_nickname]", value: "Optional parameter. The new nickname for the user, omit to remove their current nickname" },
            { name: "[reason]", value: "Optional parameter. The reason, if any, to change the member's nickname" }
        )
};
