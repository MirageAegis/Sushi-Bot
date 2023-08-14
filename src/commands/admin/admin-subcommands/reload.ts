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

import { 
    SlashCommandSubcommandBuilder, EmbedBuilder, ChatInputCommandInteraction,
    ButtonBuilder, ButtonStyle, ActionRowBuilder, Message, CollectorFilter,
    ButtonInteraction, MessageComponentInteraction, InteractionResponse
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import { refreshBlacklist, refreshServers } from "../../../util/refresh.js";

/*
 * A command for the administrators of Sushi Bot to use for
 * reloading the blacklist and the servers that the bot is in
 */

const name: string = "reload";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Reloads the blacklist and the bot's servers on demand"),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        const yes: ButtonBuilder = new ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success);
        
        const no: ButtonBuilder = new ButtonBuilder()
            .setCustomId("no")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger);

        const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yes, no);

        const prompt: InteractionResponse = await ctx.reply({
            content: "Soft reload me? This may take a while",
            components: [row]
        });

        // Check if the user pressing the button is the same user
        const check: CollectorFilter<[ButtonInteraction]> = (m: ButtonInteraction): boolean => m.user.id === ctx.user.id;

        // Disable the buttons to signify that the interaction has ended
        row.components.forEach(c => c.setDisabled(true));

        try {
            const confirmation: MessageComponentInteraction = await prompt.awaitMessageComponent({ filter: check, time: 10_000 });

            // End the interaction as soon as a button is pressed
            await confirmation.update({
                components: [row]
            });

            // If the user selected no, abort reload
            if (confirmation.customId === "no") {
                await ctx.followUp("Reloading denied, aborting opertation");
                return;
            }
        } catch (e) {
            // End the interaction upon timeout
            await prompt.edit({
                components: [row]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp("Interaction timed out, aborting operation");
            return;
        }

        // Proceed if the user pressed yes
        const report: Message = await ctx.followUp(
            `Commencing bot reload...\nActions will be logged in <#${process.env.LOGS_CHANNEL_ID}>`
        );

        await refreshBlacklist(ctx.client);
        await refreshServers(ctx.client);

        await report.edit("Reload complete");
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Reload")
        .setDescription(
            "An administrative command that reloads the bot's blacklist and servers. " +
            "This bans everyone in the blacklist from all of Sushi Bot's servers, " +
            "and leaves all ineligible server."
        )
        .addFields(
            { name: "Format", value: `\`/admin ${name}\`` }
        )
};
