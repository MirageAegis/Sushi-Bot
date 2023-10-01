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

import {
    SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Snowflake
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import {
    GoLive, Greeting, Logs, ReactionRoles, Server, Shoutout
} from "../../../schemas/server";
import { AZURE } from "../../../util/colours.js";
import { NEW_LINE_RE } from "../../../events/shoutout.js";

/*
 * Displays server configurations.
 * The data displayed by this command includes:
 * - the logs channels;
 * - the go-live channel and message;
 * - the shout out channel, role, and message;
 * - the number of reaction roles;
 * - the welcome channel and message; and
 * - the goodbye channel and message.
 */

const name: string = "view";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("View the serber configurations for this server"),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // The server configurations
        const server: Server = await Server.get(ctx.guildId);

        // The server configuration data
        const logs: Logs = server.logs;
        const goLive: GoLive = server.goLive;
        const shoutout: Shoutout = server.shoutout;
        const reactionRoles: ReadonlyMap<Snowflake, ReactionRoles> = server.reactionRoles;
        const welcome: Greeting = server.welcome;
        const goodbye: Greeting = server.goodbye;
        const levelUps: Snowflake = server.levelUps;

        // The base embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Server configurations")
            .setColor(AZURE)
            .setDescription(
                `These are the configurations for ${ctx.guild.name}`
            )
            .setAuthor({
                name: ctx.guild.name,
                iconURL: ctx.guild.iconURL()
            });

        // Fill in the configuration fields

        // Add if any logs are configured
        if (logs) {
            embed.addFields(
                {
                    name: "Member logs",
                    value: logs.members ? `<#${logs.members}>` : "null",
                    inline: true
                },
                {
                    name: "Message logs",
                    value: logs.messages ? `<#${logs.messages}>` : "null",
                    inline: true
                },
                {
                    name: "Profile logs",
                    value: logs.profiles ? `<#${logs.profiles}>` : "null",
                    inline: true
                }
            );
        }

        // Add if automatic go-live posts are configured
        if (goLive) {
            embed.addFields(
                {
                    name: "Automatic go-live channel",
                    value: `<#${goLive.channel}>`,
                    inline: false
                },
                {
                    name: "Automatic go-live message template",
                    value: goLive.message?.replace(NEW_LINE_RE, "\n") ?? "default template",
                    inline: false
                }
            );
        }

        // Add if automatic shout outs are configured
        if (shoutout) {
            embed.addFields(
                {
                    name: "Automatic shout out channel",
                    value: `<#${shoutout.channel}>`,
                    inline: false
                },
                {
                    name: "Automatic shout out role",
                    value: `<@&${shoutout.role}>`,
                    inline: false
                },
                {
                    name: "Automatic shout out message template",
                    value: shoutout.message?.replace(NEW_LINE_RE, "\n") ?? "default template",
                    inline: false
                }
            );
        }

        const reactionRoleCount: number = reactionRoles?.size;
        // Add if reaction roles have been configured
        if (reactionRoleCount) {
            embed.addFields({
                name: "Reaction role message count",
                value: `${reactionRoleCount}`,
                inline: false
            });
        }

        // Add if automatic welcome posts are configured
        if (welcome) {
            embed.addFields(
                {
                    name: "Automatic welcome channel",
                    value: `<#${welcome.channel}>`,
                    inline: false
                },
                {
                    name: "Automatic welcome message template",
                    value: welcome.message?.replace(NEW_LINE_RE, "\n") ?? "default template",
                    inline: false
                }
            );
        }

        // Add if automatic goodbye posts are configured
        if (goodbye) {
            embed.addFields(
                {
                    name: "Automatic goodbye channel",
                    value: `<#${goodbye.channel}>`,
                    inline: false
                },
                {
                    name: "Automatic goodbye message template",
                    value: goodbye.message?.replace(NEW_LINE_RE, "\n") ?? "default template",
                    inline: false
                }
            );
        }

        // The chat experience configuration
        embed.addFields({
            name: "Chat experience",
            value: `${levelUps ? `**Enabled** with output in <#${levelUps}>` : "**Disabled**"}`
        });

        await ctx.reply({ embeds: [embed] });
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("View")
        .setDescription(
            "A server configuration command that displays the current configuration for a server"
        )
        .addFields(
            { name: "Format", value: `\`/config ${name}\`` }
        )
};
