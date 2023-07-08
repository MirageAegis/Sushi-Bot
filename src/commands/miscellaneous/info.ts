/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
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
import { Command } from "../../command-template.js";
import { defaultErrorHandler } from "../../error-handler.js";
import { BLUE } from "../../util/colours.js";

/*
 * Provides useful links that lead to the GitHub repository and select wiki pages
 */

const name: string = "info";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get a link to the bot's repository")
        .setDMPermission(false),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle("Information")
            .setColor(BLUE)
            .setDescription("Here are some useful links!")
            .setAuthor({
                name: "Sushi Bot",
                iconURL: ctx.client.user.avatarURL()
            })
            .addFields(
                {
                    name: "Repository",
                    value: "Follow this [link](https://github.com/MirageAegis/Sushi-Bot \"Link to Sushi Bot's " +
                           "repository\") to the bot's repository to see its source code and wiki pages"
                },
                {
                    name: "Terms of Service",
                    value: "The bot's Terms of Service can be found " +
                           "[here](https://github.com/MirageAegis/Sushi-Bot/wiki/Terms-of-Service \"Link to Sushi Bot's " +
                           "Terms of Service\")\n" +
                           "By using Sushi Bot, you agree to the ToS"
                },
                {
                    name: "Privacy Policy",
                    value: "The bot's Privacy Policy can be found " +
                           "[here](https://github.com/MirageAegis/Sushi-Bot/wiki/Privacy-Policy \"Link to Sushi Bot's " +
                           "Privacy Policy\")\n" +
                           "Find out what kind of data the bot collects and how it's being used"
                }
            );

        await ctx.reply({ embeds: [embed] });
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Info")
        .setDescription("A command the provides links to Sushi Bot's GitHub repository, which contains more information")
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
