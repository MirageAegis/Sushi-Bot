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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";

/*
 * A command for rolling a dice. The user can specify the amount of sides
 * that the dice should have
 */

// The minimun amount of sides that a dice can have is 2
const MIN_SIDES: number = 2;
// The maximum amount of sides that a dice can have is 1000
const MAX_SIDES: number = 1000;
// The default dice has 6 sides
const DEFAULT_SIDES: number = 6;
// 1.5 seconds delay per roll
const ROLL_DELAY: number = 1500;

const name: string = "roll";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Roll a dice")
        .setDMPermission(false)
        .addIntegerOption(o =>
            o.setName("sides")
                .setDescription("The amount of sides the dice should have, defaults to 6")
                .setMinValue(MIN_SIDES)
                .setMaxValue(MAX_SIDES)
        ),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const sides: number = ctx.options.getInteger("sides") ?? DEFAULT_SIDES;
        const user: User = ctx.user;

        // Roll a number between 1~sides
        const roll: number = Math.ceil(Math.random() * sides);

        // The
        const response = await ctx.reply(`${user} rolls a D${sides}...\n`);

        setTimeout(async () => {
            await response.edit(
                `${user} rolled ${roll} on a D${sides}!`
            );
        }, ROLL_DELAY);
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Roll")
        .setDescription(
            "A command for rolling a dice. You can specify the number of sides that the dice should have"
        )
        .addFields(
            { name: "Format", value: `\`/${name} [sides]\`` },
            {
                name: "[sides]",
                value: "Optional parameter. The amount of sides the dice should have, defaults to 6. " +
                       "Accepts values between 2 and 1000"
            }
        )
};
