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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { Player } from "../../schemas/player.js";
import { MILLIS_PER_SEC, formatTime } from "../../util/format.js";
import { genLevelUpEmbed } from "../../util/profile-embed-factory.js";
import { checkValid } from "../../rpg/util/check.js";

/*
 * A command that lets users claim daily rewards.
 * Displays a cooldown if the user's daily rewards are on cooldown
 */

const name: string = "daily";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("Claim your daily rewards")
        .setDMPermission(false),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Check if the user can access the command
        if (!checkValid(ctx.user)) {
            await ctx.reply(
                "You cannot access this command! Contact the administrators if this doesn't sound right"
            );
            return;
        }

        // The player who's claiming their daily
        const player: Player = await Player.get(ctx.user.id);
        const now: number = Math.floor(Date.now() / MILLIS_PER_SEC);
        const cooldown: number = player.cooldowns.daily - now;

        let response: string;

        // Tell the user if their rewards are on cooldown
        // eslint-disable-next-line no-magic-numbers
        if (cooldown > 0) {
            response = "Your daily rewards are on cooldown, " +
                       `you can collect them in ${formatTime(cooldown)}!`;
            await ctx.reply(response);
            return;
        }

        const [streak, before, after, rewards] = player.daily();
        await player.save();

        response = "Daily rewards claimed!\n";

        // Check the daily streak
        if (streak[1] > streak[0]) {
            response += `Streak up! Your streak is now **${streak[1]}**\n`;
        } else if (streak[1] < streak[0]) {
            response += "Daily streak lost... 😢\n";
        }

        response += `Claimed ${rewards[0]} experience and ${rewards[1]} Sushi Coins!\n`;

        let embed: EmbedBuilder;

        // Check if the player levelled up
        if (after) {
            embed = genLevelUpEmbed(ctx.user, ctx.guild, player, before, after);
            response += "You've also levelled up!";
        }

        await ctx.reply({
            content: response,
            embeds: embed ? [embed] : null
        });
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Daily")
        .setDescription(
            "The command to claim your daily rewards with, if your rewards are ready\n" +
            "This command has a 1 day cooldown"
        )
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
