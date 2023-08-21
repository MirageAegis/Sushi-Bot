/*
 * MIT License
 *
 * Copyright (c) 2022-present Zahatikoff
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

import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { TenorSingleton } from "../../util/tenor-utils.js";

/*
 * Creates an embed that states that the user headpatted another user.
 * The embed has an appropriate gif.
 */

const name: string = "pat";

export const command: Command = {
    data: <SlashCommandBuilder>new SlashCommandBuilder()
        .setName(name)
        .setDescription("Give another user a nice headpat")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("target")
                .setDescription("The user you want to headpat")
                .setRequired(true)
        ),
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const tenor: TenorSingleton = TenorSingleton.getInstance();
        const patter: User = <User>ctx.member.user;
        const patted: User = <User>ctx.options.getUser("target");
        const gif: string = await tenor.getGifs("anime+hug");

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(`<@${patter.id}> pats <@${patted.id}>. How cute!!`)
            .setImage(gif);

        await ctx.reply({
            embeds: [embed]
        });
    },
    error: defaultErrorHandler,
    help: new EmbedBuilder()
        .setTitle("Pat")
        .setDescription("A command to headpat another user")
        .setFields(
            { name: "Format", value: `\`/${name} <target>\`` },
            { name: "target", value: "Required parameter.The user you want to headpat" }
        )
};
