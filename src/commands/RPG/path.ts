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

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, InteractionResponse, CollectorFilter, StringSelectMenuInteraction, ComponentType } from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { Player } from "../../schemas/player.js";
import { checkValid } from "../../rpg/util/check.js";
import { PATH_LEVEL, Path, Paths, RECLASS_COST, getPaths } from "../../rpg/types/class.js";

/*
 * A command for users to reset their level and stats to increase their level cap.
 */

const SELECT_MENU_TIMEOUT: number = 60_000;
const CANCEL: string = "Cancel";

const name: string = "path";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("Tread a path to gain boons")
        .setDMPermission(false),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Check if the user can access the command
        if (!await checkValid(ctx.user)) {
            await ctx.reply(
                "You cannot access this command! Contact the administrators if this doesn't sound right"
            );
            return;
        }

        const player: Player = await Player.get(ctx.user.id);

        // Check if the player is underlevelled
        if (player.level < PATH_LEVEL) {
            await ctx.reply("You're not ready to tread a path yet!");
            return;
        }

        // Check if they can change their Path
        if (!player.canChangePath) {
            await ctx.reply("You cannot change your Path at the moment!");
            return;
        }

        // Get all Paths except for Pathless and the player's current Path
        const paths: readonly Paths[] = player.getAvailablePaths();
        const pathData: ReadonlyMap<Paths, Path> = getPaths();

        // Create a menu with all the available Paths
        const pathSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("path")
            .setPlaceholder("Choose a Path to tread")
            .addOptions(
                ...paths.map(p => {
                    const path: Path = pathData.get(p);
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(path.name)
                        .setValue(p);
                }),
                new StringSelectMenuOptionBuilder()
                    .setLabel(CANCEL)
                    .setValue(CANCEL)
            );
        
        const pathRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(pathSelectMenu);

        let reply: string;
        if (player.path === Paths.Pathless) {
            reply = "Which Path do you want to tread?";
        } else {
            reply = `Changing Paths will cost ${RECLASS_COST} Sushi Coins, which Path to you want to tread?`;
        }

        const prompt: InteractionResponse = await ctx.reply({
            content: reply,
            components: [pathRow]
        });

        // Check if the user pressing the button is the same user
        const menuCheck: CollectorFilter<[StringSelectMenuInteraction]> = (m: StringSelectMenuInteraction): boolean => m.user.id === ctx.user.id;

        // Disable the buttons to signify that the interaction has ended
        pathRow.components.forEach(c => c.setDisabled(true));

        // Wait for the Path selection
        let pathSelection: StringSelectMenuInteraction;
        try {
            // Times out after 1 minute
            pathSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                filter: menuCheck,
                time: SELECT_MENU_TIMEOUT
            });

            // End the interaction as soon as a button is pressed
            await pathSelection.update({
                components: [pathRow]
            });
        } catch {
            // End the interaction upon timeout
            await prompt.edit({
                components: [pathRow]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp({
                content: "Interaction timed out, ending Path selection",
            });
            return;
        }

        const path: string = pathSelection.values[0];

        if (path === CANCEL) {
            await ctx.followUp("Cancelled Path selection. Come back when you're ready!");
            return;
        }

        // Attempt to change the Path of the player
        const [
            success,
            reclass
        ] = player.changePath(<Paths> path);

        // Check if the change was successful
        if (!success) {
            await ctx.followUp("Failed to change Path...");
            return;
        }

        await player.save();

        // Check if the player changed from a Path other than Pathless
        if (reclass) {
            await ctx.followUp(
                `You're now treading the **Path of the ${path}** and your classes have been removed!`
            );
            return;
        }

        await ctx.followUp(
            `You're now treading the **Path of the ${path}**!`
        );
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Path")
        .setDescription("help description")
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
