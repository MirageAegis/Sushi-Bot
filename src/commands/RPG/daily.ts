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
import { formatTime } from "../../util/format.js";
import { genLevelUpEmbed } from "../../rpg/util/profile-embed-factory.js";
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
        if (!await checkValid(ctx.user)) {
            await ctx.reply(
                "You cannot access this command! Contact the administrators if this doesn't sound right"
            );
            return;
        }

        // The player who's claiming their daily
        const player: Player = await Player.get(ctx.user.id);

        // Action lock the player
        const now: number = Date.now();
        if (!player.lock(now)) {
            await ctx.reply("You're currently performing an action, please finish that first!");
            return;
        }
        
        const {
            streak,
            before,
            after,
            rewards,
            cooldown,
            pathUnlock,
            classUnlock,
            canLimitbreak
        } = await player.daily();

        let response: string;

        // Tell the user if their rewards are on cooldown
        if (cooldown) {
            // Action lock release the player
            player.release(now);

            response = "Your daily rewards are on cooldown, " +
                       `you can collect them in ${formatTime(cooldown)}!`;
            await ctx.reply(response);
            return;
        }

        await player.save();

        // Action lock release the player
        player.release(now);

        response = "Daily rewards claimed!\n";

        // Check the daily streak
        if (streak.after > streak.before) {
            response += `Streak up! Your streak is now **${streak.after}**\n`;
        } else if (streak.after < streak.before) {
            response += "Daily streak lost... 😢\n";
        }

        response += `Claimed **${rewards.experience}** experience and **${rewards.funds}** Sushi Coins!\n`;

        let embed: EmbedBuilder;

        // Check if the player levelled up
        if (after) {
            embed = genLevelUpEmbed(ctx.user, ctx.guild, player, before, after);
            response += "You've also levelled up!\n";

            // Tell users on their first level up that pings are defaulted to being off
            // eslint-disable-next-line no-magic-numbers
            if (before.level === 1 && !player.prestige) {
                response += "Level up pings are defaulted to being **off**\n" +
                            "If you wish to be pinged in future level ups, use the `/levels` command!";
            }
        }

        // Check if the player can tread a Path
        if (pathUnlock) {
            response += "You can now tread a path!\n";
        } else if (classUnlock) {
            // Or if the player can unlock a class
            response += "You can spec into a class!\n";
        }

        // Check if the player can break their limits
        if (canLimitbreak) {
            response += "You're ready to break your limits!";
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
