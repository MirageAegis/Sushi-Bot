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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User, Snowflake } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { Player } from "../../schemas/player.js";
import { Blacklist } from "../../schemas/blacklist.js";
import { genProfileEmbed } from "../../util/profile-embed-factory.js";
import { checkValid } from "../../rpg/util/check.js";

/*
 * Displays a user's RPG profile in a rich embed.
 */

const name: string = "profile";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Check your profile!")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("user")
                .setDescription("The user whose profile to display")
        ),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Check if the user can access the command
        if (!checkValid(ctx.user)) {
            await ctx.reply(
                "You cannot access this command! Contact the administrators if this doesn't sound right"
            );
            return;
        }

        // Default parameter values
        const user: User = ctx.options.getUser("user") ?? ctx.user;

        // Check if the requested user is in the blacklist
        const blacklist: ReadonlyMap<Snowflake, string> = (await Blacklist.get()).users;
        // Blacklisted users do not have profiles
        if (blacklist.get(user.id)) {
            await ctx.reply("The specified user is blacklisted!");
            return;
        }

        const player: Player = await Player.get(user.id);

        // If the specified player hasn't gained experience yet, say so
        // eslint-disable-next-line no-magic-numbers
        if (player.level === 1 && !player.experience && !player.prestige) {
            await ctx.reply(`${ctx.user.id === user.id ? "You don't" : "This player doesn't"} have a profile yet!`);
            return;
        }

        await ctx.reply({ embeds: [genProfileEmbed(user, ctx.guild, player)]});
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Profile")
        .setDescription("Displays a user profile which includes the path, classes, and stats of the user")
        .addFields(
            { name: "Format", value: `\`/${name} [user]\`` },
            { name: "[user]", value: "Optional parameter. The user whose profile to show if not your own" }
        )
};
