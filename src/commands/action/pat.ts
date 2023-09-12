/*
 * MIT License
 *
 * Copyright (c) 2023-present Zahatikoff, Mirage Aegis
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
    ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder
} from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { TenorSingleton } from "../../util/tenor-utils.js";
import { AZURE } from "../../util/colours.js";

/*
 * Creates an embed that states that the user headpatted another user.
 * The embed has an appropriate gif.
 */

const name: string = "pat";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Give someone a nice headpat")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("target")
                .setDescription("The user you want to headpat")
                .setRequired(true)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const tenor: TenorSingleton = TenorSingleton.getInstance();
        const patter: GuildMember = <GuildMember> ctx.member;
        const patted: GuildMember = <GuildMember> ctx.options.getMember("target") ?? null;
        const gif: string = await tenor.getGifs("anime+headpat");

        // If the user provided wasn't a member,
        // tell the user so
        if (!patted) {
            await ctx.reply("Couldn't find that member... who are you trying to pat?");
            return;
        }

        let response: string;

        switch (true) {
            case patter.id === patted.id:
                // User tries to pat themselves
                response = "Looking for a pat? I'll give you one!\n" +
                           `${ctx.client.user} pats ${patter}`;
                break;
            case patted.id === ctx.client.user.id:
                // User pats Sushi Bot
                response = "Aww, thanks for the pat!\n" +
                           `${ctx.client.user} pats ${patter} back`;
                break;
            default:
                // User pats someone else
                response = `${patter} pats ${patted}. Awww`;
                break;
        }

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(response)
            .setColor(AZURE)
            .setImage(gif);

        await ctx.reply({
            embeds: [embed]
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Pat")
        .setDescription("A command to headpat another user")
        .setFields(
            { name: "Format", value: `\`/${name} <target>\`` },
            { name: "target", value: "Required parameter. The user you want to headpat" }
        )
};
