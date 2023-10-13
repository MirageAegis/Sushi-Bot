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
    SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, GuildMember, ActionRowBuilder, CollectorFilter,
    ComponentType, InteractionResponse, StringSelectMenuInteraction
} from "discord.js";
import { Command } from "../../util/command-template.js";
import { defaultErrorHandler } from "../../util/error-handler.js";
import { checkValid } from "../../rpg/util/check.js";
import { Player } from "../../schemas/player.js";
import {
    CLASS_1_LEVEL, CLASS_2_LEVEL, Class, PathClasses, Paths, RECLASS_COST, getClasses
} from "../../rpg/types/class.js";

/*
 * A command that lets users to spec into classes, given that they can.
 */

const SELECT_MENU_TIMEOUT: number = 60_000;
const CANCEL: string = "Cancel";

const name: string = "class";

export const command: Command = {
    // Command headers
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription("Specialise in a class")
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
        const canAddClass: boolean = player.canAddClass;
        const canChangeClass: boolean = player.canChangeClass;

        // Check if the player can spec into a class at all
        if (player.level < CLASS_1_LEVEL) {
            await ctx.reply("You're not ready to spec into a Class yet!");
            return;
        }

        // Check if the player can spec into a second class
        if (player.level < CLASS_2_LEVEL && !canAddClass) {
            await ctx.reply("You're not ready to spec into a second class yet!");
            return;
        }

        // Action lock the player
        const now: number = Date.now();
        if (!player.lock(now)) {
            await ctx.reply("You're currently performing an action, please finish that first!");
            return;
        }

        // Get all Classes except for Classes the player has
        const classes: readonly PathClasses[] = await player.getAvailableClasses(<GuildMember> ctx.member);
        const classData: ReadonlyMap<PathClasses, Class<Paths, boolean>> = getClasses();
        
        // Create a menu with all the available Classes
        const classSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("class")
            .setPlaceholder("Choose a Class to specialise in")
            .addOptions(
                ...classes.map(c => {
                    const cls: Class<Paths, boolean> = classData.get(c);
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(cls.name)
                        .setValue(c);
                }),
                new StringSelectMenuOptionBuilder()
                    .setLabel(CANCEL)
                    .setValue(CANCEL)
            );
    
        // Check if the user pressing the button is the same user
        const menuCheck: CollectorFilter<[StringSelectMenuInteraction]> = (m: StringSelectMenuInteraction): boolean => m.user.id === ctx.user.id;

        // If the user can add a class, prompt them to add one
        if (canAddClass) {
            const classRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(classSelectMenu);
    
            const reply: string = "Which Class do you want to specialise in?";
    
            const prompt: InteractionResponse = await ctx.reply({
                content: reply,
                components: [classRow]
            });
    
            // Disable the buttons to signify that the interaction has ended
            classRow.components.forEach(c => c.setDisabled(true));
    
            // Wait for the Class selection
            let classSelection: StringSelectMenuInteraction;
            try {
                // Times out after 1 minute
                classSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                    filter: menuCheck,
                    time: SELECT_MENU_TIMEOUT
                });
    
                // End the interaction as soon as a button is pressed
                await classSelection.update({
                    components: [classRow]
                });
            } catch {
                // Action lock release the player
                player.release(now);

                // End the interaction upon timeout
                await prompt.edit({
                    components: [classRow]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending Class selection",
                });
                return;
            }
    
            const cls: string = classSelection.values[0];
    
            if (cls === CANCEL) {
                // Action lock release the player
                player.release(now);

                await ctx.followUp("Cancelled Class selection. Come back when you're ready!");
                return;
            }

            const success: boolean = await player.addClass(
                <PathClasses> cls,
                <GuildMember> ctx.member
            );

            // Check if the change was successful
            if (!success) {
                // Action lock release the player
                player.release(now);

                await ctx.followUp("Failed to add Class...");
                return;
            }

            await player.save();

            // Action lock release the player
            player.release(now);

            await ctx.followUp(
                `You're now specialising in the **${cls}** Class!`
            );
        } else if (canChangeClass) {
            // ----- CHOOSE CLASS TO REMOVE -----
            // If the user can change a class, prompt them to do so
            const classRemoveMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("class")
            .setPlaceholder("Choose a Class to remove")
            .addOptions(
                ...player.classes.map((c, i) => {
                    const cls: Class<Paths, boolean> = classData.get(c);
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(cls.name)
                        .setValue(`${i}`); // The index of the Class to remove
                }),
                new StringSelectMenuOptionBuilder()
                    .setLabel(CANCEL)
                    .setValue(CANCEL)
            );

            const classRemoveRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(classRemoveMenu);
    
            const removeReply: string = `Changing Classes will cost ${RECLASS_COST} Sushi Coins. ` +
                                        "Which Class do you want to change from?";
    
            const prompt: InteractionResponse = await ctx.reply({
                content: removeReply,
                components: [classRemoveRow]
            });
    
            // Disable the buttons to signify that the interaction has ended
            classRemoveRow.components.forEach(c => c.setDisabled(true));
    
            // Wait for the Class remove selection
            let classRemoveSelection: StringSelectMenuInteraction;
            try {
                // Times out after 1 minute
                classRemoveSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                    filter: menuCheck,
                    time: SELECT_MENU_TIMEOUT
                });
    
                // End the interaction as soon as a button is pressed
                await classRemoveSelection.update({
                    components: [classRemoveRow]
                });
            } catch {
                // Action lock release the player
                player.release(now);

                // End the interaction upon timeout
                await prompt.edit({
                    components: [classRemoveRow]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending Class selection",
                });
                return;
            }
    
            const rmvCls: string = classRemoveSelection.values[0];
    
            if (rmvCls === CANCEL) {
                // Action lock release the player
                player.release(now);

                await ctx.followUp("Cancelled Class change. Come back when you're ready!");
                return;
            }

            const index: number = Number.parseInt(rmvCls);

            // ----- !CHOOSE CLASS TO REMOVE -----


            // ----- CHOOSE CLASS TO ADD -----
            const classRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(classSelectMenu);

            const reply: string = "Which Class do you want to change to?";

            await prompt.edit({
                content: reply,
                components: [classRow]
            });

            // Disable the buttons to signify that the interaction has ended
            classRow.components.forEach(c => c.setDisabled(true));

            // Wait for the Class selection
            let classSelection: StringSelectMenuInteraction;
            try {
                // Times out after 1 minute
                classSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                    filter: menuCheck,
                    time: SELECT_MENU_TIMEOUT
                });

                // End the interaction as soon as a button is pressed
                await classSelection.update({
                    components: [classRow]
                });
            } catch {
                // Action lock release the player
                player.release(now);

                // End the interaction upon timeout
                await prompt.edit({
                    components: [classRow]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending Class selection",
                });
                return;
            }

            const cls: string = classSelection.values[0];

            if (cls === CANCEL) {
                // Action lock release the player
                player.release(now);

                await ctx.followUp("Cancelled Class change. Come back when you're ready!");
                return;
            }

            const success: boolean = await player.changeClass(
                <PathClasses> cls,
                // eslint-disable-next-line no-magic-numbers
                <0 | 1> index,
                <GuildMember> ctx.member
            );

            // Check if the change was successful
            if (!success) {
                // Action lock release the player
                player.release(now);

                await ctx.followUp("Failed to change Class...");
                return;
            }

            await player.save();

            // Action lock release the player
            player.release(now);

            await ctx.followUp(
                `You're now specialising in the **${cls}** Class!`
            );
        } else {
            // If the player can't add nor change Classes, they must not have
            // enough money to do so

            // Action lock release the player
            player.release(now);

            await ctx.reply(`You need ${RECLASS_COST} Sushi Coins to reclass!`);
        }
    },
    
    // Error handler
    error: defaultErrorHandler,
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Class")
        .setDescription(
            "Specialise in a Class to modify your growths and unlock Class Skills or " +
            "change Classes"
        )
        .addFields(
            { name: "Format", value: `\`/${name}\`` }
        )
};
