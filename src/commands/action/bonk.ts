/*
 * MIT License
 *
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

import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { TenorSingleton } from "../../util/tenor-utils.js";

/*
 * Creates an embed that states that the user had been bonked.
 * The embed has an appropriate gif.
 */

const name: string = "bonk";

export const command: Command = {
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Bonk your friends ... or your enemies.\n ***the bonk*** *never* misses")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("target")
                .setDescription("The target of the bonkening")
                .setRequired(true)
        ),
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const tenor: TenorSingleton = TenorSingleton.getInstance();
        const bonker: User = <User>ctx.member.user;
        const bonked: User = <User>ctx.options.getUser("target");
        const gif: string = await tenor.getGifs("anime+bonk");

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(`<@${bonker.id}> bonks <@${bonked.id}>. OUCH, THAT HURT!!`)
            .setImage(gif);

        await ctx.reply({
            embeds: [embed]
        });
    },

    error: defaultErrorHandler,

    help: new EmbedBuilder()
        .setTitle("Bonk")
        .setDescription("A lil silly command to bonk another user")
        .setFields(
            { name: "Format", value: `\`/${name} <target>\`` },
            { name: "target", value: "Required parameter.The user you want to bonk" }
        )
};
