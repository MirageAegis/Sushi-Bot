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
    SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction,
    ChannelType, TextChannel
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { Server } from "../../../schemas/server.js";
import { DISCORD_NAME, CHANNEL, LINK, TITLE, GAME } from "../../../events/shoutout.js";

/*
 * A server configuration command for setting a go-live channel and message
 */

const name: string = "golive";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Sets or unsets a channel and message for auto go-live posts")
        .addChannelOption(o => 
            o.setName("channel")
                .setDescription("The channel to use as a go-live post channel. Omit to remove configuration")
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(o =>
            o.setName("message")
                .setDescription("The message to shout out with. Omit to use the default message")
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const channel: TextChannel = ctx.options.getChannel("channel") ?? null;
        const message: string = ctx.options.getString("message") ?? null;

        await ctx.deferReply();

        // Get the server document from the database
        const server: Server = await Server.get(ctx.guildId);

        // Remove configurations if channel was omitted
        if (!channel) {
            server.goLive = null;
            await server.save();
            await ctx.followUp("Set to not auto go-live post");
            return;
        }
        
        server.goLive = {
            channel: channel.id,
            message: message
        };
        await server.save();

        await ctx.followUp(`Set to auto go-live post in ${channel}`);
    },
    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Golive")
        .setDescription(
            "A server configutation command that sets the go-live channel and message for a server"
        )
        .addFields(
            { name: "Format", value: `\`/config ${name} [channel] [message]\`` },
            { name: "[channel]", value: "Optional parameter. The channel to set as auto go-live post channel. Omit to remove auto shout outs" },
            {
                name: "[message]",
                value: "Optional parameter. The auto go-live message. Omit to use the default message\n" +
                       "Variables:\n" +
                       `- \`${DISCORD_NAME}\` - Replaced with Discord display name\n` +
                       `- \`${CHANNEL}\` - Replaced with Twitch username\n` +
                       `- \`${LINK}\` - Replaced with Twitch link\n` +
                       `- \`${TITLE}\` - Replaced with Stream title\n` +
                       `- \`${GAME}\` - Replaced with Stream game`
            }
        )
};
