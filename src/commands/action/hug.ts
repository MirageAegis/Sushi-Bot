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
import { PINK } from "../../util/colours.js";

/*
 * Creates an embed that states that the user had been hugged.
 * The emebed has a gif
 */

const name: string = "hug";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Give someone user a big warm hug")
        .setDMPermission(false)
        .addUserOption(o =>
            o.setName("target")
                .setDescription("The user you want to hug")
                .setRequired(true)
        ),
    
    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const tenor: TenorSingleton = TenorSingleton.getInstance();
        const hugger: GuildMember = <GuildMember> ctx.member;
        const hugged: GuildMember = <GuildMember> ctx.options.getMember("target") ?? null;
        const gif: string = await tenor.getGifs("anime+hug");

        // If the user provided wasn't a member,
        // tell the user so
        if (!hugged) {
            await ctx.reply("Couldn't find that member... who are you trying to hug?");
            return;
        }

        let response: string;

        switch (true) {
            case hugger.id === hugged.id:
                // User tries to hug themselves
                response = "You're looking a little lonely...\n" +
                           `${ctx.client.user} hugs ${hugger}!`;
                break;
            case hugged.id === ctx.client.user.id:
                // User hugs Sushi Bot
                response = "Aww, I love hugs!\n" +
                           `${ctx.client.user} hugs ${hugger} back`;
                break;
            default:
                // User hugs someone else
                response = `${hugger} hugs ${hugged}. Awww`;
                break;
        }

        const embed: EmbedBuilder = new EmbedBuilder()
            .setDescription(response)
            .setColor(PINK)
            .setImage(gif);

        await ctx.reply({
            embeds: [embed]
        });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Hug")
        .setDescription("A hug command to cheer someone up")
        .setFields(
            { name: "Format", value: `\`/${name} <target>\`` },
            { name: "target", value: "Required parameter. The user you want to hug"}
        )
};
