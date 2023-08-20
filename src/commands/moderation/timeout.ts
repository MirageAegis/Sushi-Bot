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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, GuildMember } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { NoMemberFoundError } from "../../util/errors.js";

/*
 * Moderation command for timing out a user from a server
 */

// Limits of the different parameters, cannot exceed 27d 23h 59m 59s
const MIN: number = 0;
const MAX_SECS: number = 59;
const MAX_MINS: number = MAX_SECS;
const MAX_HOURS: number = 23;
const MAX_DAYS: number = 27;

const secsToMillis: number = 1000;
const minsToMillis: number = 60 * secsToMillis;
const hoursToMillis: number = 60 * minsToMillis;
const daysToMillis: number = 24 * hoursToMillis;

const name: string = "timeout";

export const command: Command = {
    // Command headers
    data: <SlashCommandBuilder> new SlashCommandBuilder()
        .setName(name)
        .setDescription("Time out a user")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addUserOption(o =>
            o.setName("member")
                .setDescription("The member to time out")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("days")
                .setDescription("The amount of days to time out")
                .setMinValue(MIN)
                .setMaxValue(MAX_DAYS)
        )
        .addIntegerOption(o =>
            o.setName("hours")
                .setDescription("The amount of hours to time out")
                .setMinValue(MIN)
                .setMaxValue(MAX_HOURS)
        )
        .addIntegerOption(o =>
            o.setName("minutes")
                .setDescription("The amount of minutes to time out")
                .setMinValue(MIN)
                .setMaxValue(MAX_MINS)
        )
        .addIntegerOption(o =>
            o.setName("seconds")
                .setDescription("The amount of seconds to time out")
                .setMinValue(MIN)
                .setMaxValue(MAX_SECS)
        )
        .addStringOption(o =>
            o.setName("reason")
                .setDescription("Why is the member being timed out?")),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const member: GuildMember = <GuildMember> ctx.options.getMember("member") ?? null;
        
        // Can't time out someone who isn't a member
        if (!member) {
            throw new NoMemberFoundError();
        }

        const days: number = ctx.options.getInteger("days") ?? 0;
        const hours: number = ctx.options.getInteger("hours") ?? 0;
        const minutes: number = ctx.options.getInteger("minutes") ?? 0;
        const seconds: number = ctx.options.getInteger("seconds") ?? 0;
        const reason: string = `${ctx.user}: ${ctx.options.getString("reason") ?? "No reason"}`;

        const duration: number = days * daysToMillis +
                                 hours * hoursToMillis +
                                 minutes * minsToMillis +
                                 seconds * secsToMillis;

        // Apply time out if duration isn't 0
        if (duration) {
            await member.timeout(duration, reason);

            await ctx.reply(`Timed **${member.displayName}** out for ` +
                            `${days ? `${days} day(s) `: ""}` +
                            `${hours ? `${hours} hour(s) `: ""}` +
                            `${minutes ? `${minutes} minute(s) `: ""}` +
                            `${seconds ? `${seconds} second(s)`: ""}`
            );
        } else { // Remove time out if it is 0
            await member.timeout(null, reason);

            await ctx.reply(`Cleared **${member.displayName}**'s time out`);
        }
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Timeout")
        .setDescription(
            "A moderation command for timing out server members. Cannot exceed 28 days. Leave duration empty to clear a timeout"
        )
        .addFields(
            { name: "Format", value: `\`/${name} <member> [days] [hours] [minutes] [seconds] [reason]\`` },
            { name: "<member>", value: "Required parameter. The server member to time out" },
            { name: "[days]", value: "Optional parameter. The amount of days to time the member out for" },
            { name: "[hours]", value: "Optional parameter. The amount of hours to time the member out for" },
            { name: "[minutes]", value: "Optional parameter. The amount of minutes to time the member out for" },
            { name: "[seconds]", value: "Optional parameter. The amount of seconds to time the member out for" },
            { name: "[reason]", value: "Optional parameter. The reason, if any, to time the member out" }
        )
};
