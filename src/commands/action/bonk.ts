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
import { YELLOW } from "../../util/colours.js";

/*
 * Creates an embed that states that the user had been bonked.
 * The embed has an appropriate gif.
 */

const name: string = "bonk";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Bonk your friends... or your enemies. The bonk NEVER misses")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("target")
                .setDescription("The target of the bonkening")
                .setRequired(true)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const tenor: TenorSingleton = TenorSingleton.getInstance();
        const bonker: GuildMember = <GuildMember> ctx.member;
        const bonked: GuildMember = <GuildMember> ctx.options.getMember("target") ?? null;
        const gif: string = await tenor.getGifs("anime+bonk");

        // If the user provided wasn't a member,
        // tell the user so
        if (!bonked) {
            await ctx.reply("Couldn't find that member... who are you trying to bonk?");
            return;
        }

        let response: string;

        switch (true) {
            case bonker.id === bonked.id:
                // User tries to bonk themselves
                response = "Why are you hitting yourself??\n" +
                           `${bonker} bonks themselves!`;
                break;
            case bonked.id === ctx.client.user.id:
                // User tries to bonk Sushi Bot
                response = "Oh no you don't\n" +
                           `${ctx.client.user} bonks ${bonker}!`;
                break;
            default:
                // User bonks someone else
                response = `${bonker} bonks ${bonked}. Ouchies!`;
                break;
        }

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(response)
            .setColor(YELLOW)
            .setImage(gif);

        await ctx.reply({
            embeds: [embed]
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Bonk")
        .setDescription("A lil silly command to bonk another user")
        .setFields(
            { name: "Format", value: `\`/${name} <target>\`` },
            { name: "target", value: "Required parameter. The user you want to bonk" }
        )
};
