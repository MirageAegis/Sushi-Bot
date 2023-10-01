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

/*
 * A server configuration command for enabling or disabling chat experience
 */

const name: string = "levels";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Enables or disables chat experience")
        .addChannelOption(o => 
            o.setName("levelup")
                .setDescription("The channel to use for level up announcements")
                .addChannelTypes(ChannelType.GuildText)
        ),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters

        const levelup: TextChannel = ctx.options.getChannel("levelup") ?? null;

        await ctx.deferReply();

        // Get the server document from the database
        const server: Server = await Server.get(ctx.guildId);
        
        server.levelUps = levelup?.id;
        await server.save();

        if (levelup) {
            await ctx.followUp(`Enabled chat experience and set to out put level ups in ${levelup}`);
        } else {
            await ctx.followUp("Disabled chat experience");
        }
    },
    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Levels")
        .setDescription(
            "A server configutation command that enables or disables chat experience"
        )
        .addFields(
            { name: "Format", value: `\`/config ${name} [levelup]\`` },
            { name: "[levelup]", value: "Optional parameter. The channel to set as a level up announcement channel. Omit to disable chat experience" }
        )
};
