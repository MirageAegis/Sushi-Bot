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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, GuildTextBasedChannel, Collection, Message, PartialMessage } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";

/*
 * Clears messages from a text channel
 */

const MIN: number = 1;
const MAX: number = 100;

const name: string = "clear";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Clear messages from this channel")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addIntegerOption(o =>
            o.setName("amount")
                .setDescription("The amount of messages to delete, defaults to 1")
                .setMinValue(MIN)
                .setMaxValue(MAX)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // The channel to delete messages from
        const channel: GuildTextBasedChannel = ctx.channel;
        // The amount of messages to delete, defaults to 1
        const amount: number = ctx.options.getInteger("amount") ?? MIN;

        await ctx.deferReply({ ephemeral: true });
        const deleted: Collection<string, Message | PartialMessage> = await channel.bulkDelete(amount, true);

        await ctx.followUp({
            content: `Deleted ${deleted.size} message(s)` +
                     `${deleted.size < amount ? `, ${amount - deleted.size} messages couldn't be deleted because they either don't exist or are too old` : ""}`,
            ephemeral: true
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Clear")
        .setDescription(
            "A moderation command for deleting messages in bulk from the channel this command is executed in. Cannot delete messages older than 14 days"
        )
        .addFields(
            { name: "Format", value: `\`/${name} [amount]\`` },
            { name: "[amount]", value: "Optional parameter. The amount of messages to delete, defaults to 1. Accepts values between 1 and 100" }
        )
};
