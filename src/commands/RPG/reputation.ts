/* 
 * MIT License
 * 
 * Copyright (c) 2023-present Mirage Aegis
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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { checkValid } from "../../rpg/util/check.js";
import { Player } from "../../schemas/player.js";
import { formatTime } from "../../util/format.js";

/*
 * Lets users increase each others' reputation.
 * Users can only give other players reputation points,
 * never themselves.
 */

const name: string = "reputation";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Increase another user's reputation")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("user")
                .setDescription("The user to give a reputation point to")
                .setRequired(true)
        ),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Check if the user can access the command
        if (!checkValid(ctx.user.id)) {
            await ctx.reply(
                "You cannot access this command! Contact the administrators if this doesn't sound right"
            );
            return;
        }

        // Default parameter values
        const target: GuildMember = <GuildMember> ctx.options.getMember("user") ?? null;

        // Check if the target user is a member
        if (!target) {
            await ctx.reply(
                "You can only give reputation points to server members!"
            );
            return;
        }

        // Check if the target user is valid
        if (!checkValid(target.id)) {
            await ctx.reply(
                "The specified user cannot access the RPG!"
            );
            return;
        }

        // Proceed if both users are valid
        const player: Player = await Player.get(ctx.user.id);
        const targetPlayer: Player = await Player.get(target.user.id);

        const [selfRep, cooldown] = player.giveReputation(targetPlayer);

        // Tell the user that they can't rep themselves if they're trying to
        if (selfRep) {
            await ctx.reply(
                "You can't give yourself reputation points!"
            );
            return;
        }

        // Tell the user if the command is on cooldown
        if (cooldown) {
            await ctx.reply(
                "You don't have a reputation point to give right now!\n" +
                `You'll have one to give in ${formatTime(cooldown)}`
            );
            return;
        }

        // Save the affected player documents if successful
        await player.save();
        await targetPlayer.save();

        await ctx.reply(
            `You gave a reputation point to ${target}!`
        );
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Reputation")
        .setDescription(
            "Increases the reputation of a user. You can only use this command to give " +
            "other users reputation points\n" +
            "This command has a 1 week cooldown"
            )
        .addFields(
            { name: "Format", value: `\`/${name} <user>\`` },
            { 
                name: "<user>",
                value: "Required parameter. The user to give a reputation point to. " +
                       "Must be a server member and cannot be yourself"
            }
        )
};
