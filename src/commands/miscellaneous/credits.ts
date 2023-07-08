/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../command-template.js";
import { defaultErrorHandler } from "../../error-handler.js";
import { BLUE } from "../../util/colours.js";

/*
 * Displays the project contributors in a rich embed.
 * The names, roles and discord handles are displayed in the current version
 */

const name: string = "credits";

export const command: Command = {
	// Command headers
	data: new SlashCommandBuilder()
		.setName(name)
		.setDescription("Display the bot's credits, including programmers, artists, concept idea sources, etc.")
		.setDMPermission(false),

	// Command execution
	async execute(ctx: ChatInputCommandInteraction): Promise<void> {
		const embed: EmbedBuilder = new EmbedBuilder()
			.setTitle("Credits")
			.setColor(BLUE)
			.setDescription("Here are the people who have worked on Sushi Bot!")
			.setAuthor({
				name: "Sushi Bot",
				iconURL: ctx.client.user.avatarURL()
			})
			.addFields(
				{
					name: "Lead Developer and Programmer",
					value: "Mirage Aegis (<@123456133368119296>)",
					inline: false
				},
				{
					name: "Lead Artist",
					value: "Chade (<@283653964816187392>)",
					inline: false
				},
				{
					name: "Developers",
					value: "Zahatikoff (<@458627903211569162>)"
				}
			);

		await ctx.reply({ embeds: [embed] });
	},

	// Error handler
	error: defaultErrorHandler,

	// Help command embed
	help: new EmbedBuilder()
		.setTitle("Credits")
		.setDescription(
			"A command that displays the current contributors of the project" +
			"It contains the list of names and roles of the contributors"
		)
		.addFields(
			{ name: "Format", value: `\`/${name}\`` }
		)
};
