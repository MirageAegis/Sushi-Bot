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
    ChannelType, TextChannel, Role
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { Server } from "../../../schemas/server.js";
import { DISCORD_NAME, CHANNEL, LINK, TITLE, GAME, NEW_LINE } from "../../../events/shoutout.js";

/*
 * A server configuration command for setting an auto shout out role,
 * channel, and message
 */

const name: string = "shoutout";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Sets or unsets a channel, role, and message for auto shout outs")
        .addChannelOption(o => 
            o.setName("channel")
                .setDescription("The channel to use as a shout out channel. Omit to remove configuration")
                .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("The role to auto shout out. Omit to remove configuration")
        )
        .addStringOption(o =>
            o.setName("message")
                .setDescription("The message to shout out with. Omit to use the default message")
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const channel: TextChannel = ctx.options.getChannel("channel") ?? null;
        const role: Role = <Role> ctx.options.getRole("role") ?? null;
        const message: string = ctx.options.getString("message") ?? null;

        await ctx.deferReply();

        // Get the server document from the database
        const server: Server = await Server.get(ctx.guildId);

        // Remove configurations if channel or role was omitted
        if (!channel || !role) {
            server.shoutout = null;
            await server.save();
            await ctx.followUp("Set to not auto shout out");
            return;
        }
        
        server.shoutout = {
            channel: channel.id,
            role: role.id,
            message: message
        };
        await server.save();

        await ctx.followUp(`Set to auto shout out ${role} in ${channel}`);
    },
    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Shoutout")
        .setDescription(
            "A server configutation command that sets the auto shout out channel, role, and message for a server"
        )
        .addFields(
            { name: "Format", value: `\`/config ${name} [channel] [role] [message]\`` },
            { name: "[channel]", value: "Optional parameter. The channel to set as auto shout out channel. Omit to remove auto shout outs" },
            { name: "[role]", value: "Optional parameter. The role to set as auto shout out role. Omit to remove auto shout outs" },
            {
                name: "[message]",
                value: "Optional parameter. The auto shout out message. Omit to use the default message\n" +
                       "Variables:\n" +
                       `- \`${DISCORD_NAME}\` - Replaced with Discord display name\n` +
                       `- \`${CHANNEL}\` - Replaced with Twitch username\n` +
                       `- \`${LINK}\` - Replaced with Twitch link\n` +
                       `- \`${TITLE}\` - Replaced with Stream title\n` +
                       `- \`${GAME}\` - Replaced with Stream game` +
                       `- \`${NEW_LINE}\` - Replaced with a new line`
            }
        )
};
