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

import {
    SlashCommandBuilder,EmbedBuilder, ChatInputCommandInteraction, ButtonBuilder,
    ButtonStyle, ActionRowBuilder, CollectorFilter, ButtonInteraction,
    InteractionResponse, MessageComponentInteraction
} from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { checkValid } from "../../rpg/util/check.js";
import { Player, Stats } from "../../schemas/player.js";
import { genLimitbreakEmbed } from "../../rpg/util/profile-embed-factory.js";

/*
 * A command that lets players prestige to progress further.
 */

const name: string = "limitbreak";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("Break your limits and reach for the stars")
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

        const player: Player = await Player.get(ctx.user.id);

        // Check if the player can limitbreak
        if (!player.canLimitbreak) {
            await ctx.reply(
                "You're not ready to break your limits yet\n" +
                `You can try once you've reached level **${player.maxLevel}**`
            );
            return;
        }

        // Action lock the player
        const now: number = Date.now();
        if (!player.lock(now)) {
            await ctx.reply("You're currently performing an action, please finish that first!");
            return;
        }

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

        const prompt: InteractionResponse = await ctx.reply({
            content: "Are you ready to break your limits?\n" +
                     "You will reset your: level, stats, Path, and Classes\n" +
                     "You will increase your max level by 100",
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

            // If the user selected no, abort reload
            if (confirmation.customId === "no") {
                // Action lock release the player
                player.release(now);

                await ctx.followUp(
                    "You will not be able to progress any further, " +
                    "come back when you're ready to break your limits!"
                );
                return;
            }
        } catch (e) {
            // Action lock release the player
            player.release(now);

            // End the interaction upon timeout
            await prompt.edit({
                components: [row]
            });
            return;
        }

        // The state of the player before the limitbreak
        const level: number = player.level;
        const prestige: number = player.prestige;
        const stats: Stats = player.stats;

        player.limitbreak();
        await player.save();

        // Action lock release the player
        player.release(now);

        await ctx.followUp({
            content: "You have broken your limits! You feel a bit weak but that you can grow even stronger than before!",
            embeds: [genLimitbreakEmbed(
                ctx.user,
                ctx.guild,
                { level, stats, prestige },
                {
                    level: player.level,
                    stats: player.stats,
                    prestige: player.prestige
                }
            )]
        });
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Limitbreak")
        .setDescription(
            "Reset your level, stats, Path, and Classes to reach higher hights! Breaking your limits lets " +
            "you reach higher levels"
        )
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
