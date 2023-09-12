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
    EmbedBuilder, ChatInputCommandInteraction, ChannelType, SlashCommandSubcommandBuilder, TextChannel
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { Server } from "../../../schemas/server";
import { NAME, NEW_LINE, OWNER, PING, SERVER } from "../../../events/greet.js";

/*
 * A server configuration command for setting a goodbye message
 */

const name: string = "goodbye";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Configure goodbye messages for this server")
        .addChannelOption(o =>
            o.setName("channel")
                .setDescription("The channel to say goodbye to members in")
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(o =>
            o.setName("message")
                .setDescription("The message to say goodbye with. Omit to use the default message")
        ),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const channel: TextChannel = ctx.options.getChannel("channel") ?? null;
        const message: string = ctx.options.getString("message") ?? null;

        await ctx.deferReply();

        // Get the sevrer document
        const server: Server = await Server.get(ctx.guildId);

        // Remove configurations if channel was omitted
        if (!channel) {
            server.goodbye = null;
            await server.save();
            await ctx.followUp("Set to not say goodbye to members");
            return;
        }

        server.goodbye = {
            channel: channel.id,
            message: message
        };
        await server.save();

        await ctx.followUp(`Set to say goodbye to members in ${channel}`);
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Welcome")
        .setDescription(
            "A server configutation command that sets the goodbye message for the server"
        )
        .addFields(
            { name: "Format", value: `\`/${name} [channel] [message]\`` },
            { name: "[channel]", value: "Optional parameter. The channel to say goodbye to members in. Omit to remove welcome messages" },
            {
                name: "[message]",
                value: "Optional parameter. The message to say goodbye with. Omit to use the default message\n" +
                       "Variables:\n" +
                       `- \`${NAME}\` - Replaced with the new member's display name\n` +
                       `- \`${PING}\` - Replaced with a mention to the new member\n` +
                       `- \`${SERVER}\` - Replaced with the server's name\n` +
                       `- \`${OWNER}\` - Replaced with the server owner's display name\n` +
                       `- \`${NEW_LINE}\` - Replaced with a new line`
            }
        )
};
