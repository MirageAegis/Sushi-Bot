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
    EmbedBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder,
    InteractionResponse, CollectorFilter, StringSelectMenuInteraction, ComponentType,
    ButtonBuilder, ButtonStyle, MessageComponentInteraction, Message, MessageReaction,
    User, Snowflake, Collection, RoleSelectMenuBuilder, Emoji, RoleSelectMenuInteraction,
    Role, ButtonInteraction
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import {
    CONFIRM_RR, REGULAR_RR, ReactionRoleStyle, Server, UNIQUE_RR
} from "../../../schemas/server.js";
import {
    AZURE,
    BLUE, GREEN, GREY, MAGENTA, ORANGE, PINK, PURPLE, RED, TEAL, YELLOW
} from "../../../util/colours.js";

/*
 * Reaction role setup command for creating reaction roles.
 */

type MessageTypeMenu = "plain" | "embed";

const PLAIN: MessageTypeMenu = "plain";
const EMBED: MessageTypeMenu = "embed";

const SELECT_MENU_TIMEOUT: number = 60_000;
const PARAGRAPH_TIMEOUT: number = 300_000;
const REACTION_TIMEOUT: number = 60_000;

const BUTTONS_PER_ROW: number = 5;
const MIN_RR: number = 1;
const MAX_RR: number = 15;

const name: string = "reactionroles";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("Starts a reaction roles setup wizard"),

    // Command execution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // ----- STEP ONE: REACTION ROLE STYLE -----
        
        // Create a menu with the different reaction role styles
        const reactionRoleStyleMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("style")
            .setPlaceholder("Select a reaction role style")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Regular")
                    .setDescription(
                        "Can be paired with other roles which won't be exclusive to one another"
                    )
                    .setValue(REGULAR_RR),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Unique")
                    .setDescription(
                        "Can be paired with other roles which will be exclusive to one another"
                    )
                    .setValue(UNIQUE_RR),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Confirm")
                    .setDescription(
                        "Cannot be paired with other roles"
                    )
                    .setValue(CONFIRM_RR)
            );

        const styleRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(reactionRoleStyleMenu);

        const prompt: InteractionResponse = await ctx.reply({
            content: "Let's build a reaction role message!\n" +
                     "We'll start with which style of reaction roles to create",
            components: [styleRow]
        });

        // Check if the user pressing the button is the same user
        const menuCheck: CollectorFilter<[StringSelectMenuInteraction]> = (m: StringSelectMenuInteraction): boolean => m.user.id === ctx.user.id;

        // Disable the buttons to signify that the interaction has ended
        styleRow.components.forEach(c => c.setDisabled(true));

        // Wait for the style selection
        let styleSelection: StringSelectMenuInteraction;
        try {
            // Times out after 1 minute
            styleSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                filter: menuCheck,
                time: SELECT_MENU_TIMEOUT
            });

            // End the interaction as soon as a button is pressed
            await styleSelection.update({
                components: [styleRow]
            });
        } catch {
            // End the interaction upon timeout
            await prompt.edit({
                components: [styleRow]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp({
                content: "Interaction timed out, ending reaction role creation",
            });
            return;
        }

        // The reaction role style
        // Can be regular, unique, or confirm
        const style: ReactionRoleStyle = <ReactionRoleStyle> styleSelection.values[0];

        // ----- STEP ONE: REACTION ROLE STYLE -----


        // ----- STEP TWO: MESSAGE TYPE -----

        // Create a menu with the two message types
        const messageTypeMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("type")
            .setPlaceholder("Select a reaction role message type")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Plain")
                    .setDescription(
                        "A plain text message"
                    )
                    .setValue(PLAIN),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Embed")
                    .setDescription(
                        "A message with a rich embed"
                    )
                    .setValue(EMBED),
            );

        const typeRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(messageTypeMenu);

        await prompt.edit({
            content: `You've chosen the ${style} style, great!\n` +
                     "Next up is the type of message you'd like",
            components: [typeRow]
        });

        // Disable the buttons to signify that the interaction has ended
        typeRow.components.forEach(c => c.setDisabled(true));

        // Wait for the style selection
        let typeSelection: StringSelectMenuInteraction;
        try {
            // Times out after 1 minute
            typeSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                filter: menuCheck,
                time: SELECT_MENU_TIMEOUT
            });

            // End the interaction as soon as a button is pressed
            await typeSelection.update({
                components: [typeRow]
            });
        } catch {
            // End the interaction upon timeout
            await prompt.edit({
                components: [typeRow]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp({
                content: "Interaction timed out, ending reaction role creation",
            });
            return;
        }

        // The reaction role message type
        // Can be plain or embed
        const mType: MessageTypeMenu = <MessageTypeMenu> typeSelection.values[0];

        // ----- !STEP TWO: MESSAGE TYPE -----

        // Check if the user pressing the button is the same user
        const messageCheck: CollectorFilter<[Message]> = (m: Message): boolean => m.author.id === ctx.user.id;

        // ----- STEP THREE: FILL THE MESSAGE -----

        let content: string = null;
        let embed: EmbedBuilder = null;
        if (mType === PLAIN) {
            // Ask for the message content for the reaction role message
            await prompt.edit({
                content: "A plain message, eh? Sure thing!\n" +
                         "What would you want the message to say?\n" +
                         "(Send a message with what you'd like the reaction role message to say, times out after 5 minutes)",
                components: [] // Remove the action row
            });

            // Get the content from the message that the user sends
            try {
                // Times out after 5 minutes
                const message: Message = (await ctx.channel.awaitMessages({
                    filter: messageCheck,
                    max: 1,
                    time: PARAGRAPH_TIMEOUT,
                    errors: ["time"]
                })).first();

                // Set the message content to the reply's content
                content = message.content;

                // Clean up the message if possible
                if (message.deletable) {
                    await message.delete();
                }
            } catch {
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                    
                });
                return;
            }
        } else if (mType === EMBED) {
            embed = new EmbedBuilder();

            const EMBED_TITLE_MAX_LENGTH: number = 256;

            // ----- EMBED STEP ONE: TITLE -----

            // Ask for the embed title for the reaction role message
            await prompt.edit({
                content: "Oho! Feeling spicy, are we? An embed it shall be!\n" +
                         "What should the embed's title be?\n" +
                         "(Send a short message with what you'd like the embed's title to be, times out after 5 minutes)",
                components: [] // Remove the action row
            });

            // Get the content from the message that the user sends
            try {
                // Times out after 5 minutes
                const message: Message = (await ctx.channel.awaitMessages({
                    filter: messageCheck,
                    max: 1,
                    time: PARAGRAPH_TIMEOUT,
                    errors: ["time"]
                })).first();

                const messageContent: string = message.content;

                // Clean up the message if possible
                if (message.deletable) {
                    await message.delete();
                }

                if (messageContent.length > EMBED_TITLE_MAX_LENGTH) {
                    await ctx.followUp("That's too long for a title!");
                    return;
                }

                embed.setTitle(messageContent);
            } catch {
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                });
                return;
            }
            
            // ----- !EMBED STEP ONE: TITLE -----

            // ----- EMBED STEP TWO: DESCRIPTION -----

            // Ask for the embed title for the reaction role message
            await prompt.edit({
                content: "You'll need to describe the reaction roles, so that's next\n" +
                         "What should the embed's description be?\n" +
                         "(Send a message with what you'd like the embed's description to be, times out after 5 minutes)\n" +
                         "Here's a preview of what you have so far:",
                embeds: [embed],
                components: [] // Remove the action row
            });

            // Get the content from the message that the user sends
            try {
                // Times out after 5 minutes
                const message: Message = (await ctx.channel.awaitMessages({
                    filter: messageCheck,
                    max: 1,
                    time: PARAGRAPH_TIMEOUT,
                    errors: ["time"]
                })).first();

                const messageContent: string = message.content;

                // Clean up the message if possible
                if (message.deletable) {
                    await message.delete();
                }

                embed.setDescription(messageContent);
            } catch {
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                });
                return;
            }

            // ----- EMBED STEP THREE: COLOUR -----

            // Create a menu with the two message types
            const embedColourMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
                .setCustomId("colour")
                .setPlaceholder("Select a reaction role message type")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Red")
                        .setValue(`${RED}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Orange")
                        .setValue(`${ORANGE}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Yellow")
                        .setValue(`${YELLOW}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Green")
                        .setValue(`${GREEN}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Azure")
                        .setValue(`${AZURE}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Teal")
                        .setValue(`${TEAL}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Blue")
                        .setValue(`${BLUE}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Purple")
                        .setValue(`${PURPLE}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Magenta")
                        .setValue(`${MAGENTA}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Pink")
                        .setValue(`${PINK}`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Grey")
                        .setValue(`${GREY}`),
                );

            const colourRow: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(embedColourMenu);

            await prompt.edit({
                content: "Let's pick a colour for the embed now!\n" +
                         "Here's a preview of what you have so far:",
                embeds: [embed],
                components: [colourRow]
            });

            // Disable the buttons to signify that the interaction has ended
            colourRow.components.forEach(c => c.setDisabled(true));

            // Wait for the style selection
            let embedColourSelection: StringSelectMenuInteraction;
            try {
                // Times out after 1 minute
                embedColourSelection = await prompt.awaitMessageComponent<ComponentType.StringSelect>({
                    filter: menuCheck,
                    time: SELECT_MENU_TIMEOUT
                });

                // End the interaction as soon as a button is pressed
                await embedColourSelection.update({
                    components: [colourRow]
                });
            } catch {
                // End the interaction upon timeout
                await prompt.edit({
                    components: [colourRow]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                });
                return;
            }

            // Set the colour of the embed
            const colour: number = Number.parseInt(embedColourSelection.values[0]);
            embed.setColor(colour);

            // ----- !EMBED STEP THREE: COLOUR -----
        }

        // ----- !STEP THREE: FILL THE MESSAGE -----


        // Max amount of reaction roles
        // 1 if it's for confirmations, otherwise 15
        const maxReactionRoles: number = style === "confirm" ? MIN_RR : MAX_RR;

        const reactionRoles: [Emoji, Role][] = [];

        const emojis: Collection<Snowflake, Emoji> = await ctx.guild.emojis.fetch();
        const emojiCheck: CollectorFilter<[MessageReaction, User]> = (r: MessageReaction) => {
            const emojiID: string = r.emoji.id;
            const emoji: Emoji = emojis.get(emojiID);

            // Make sure that the emoji hasn't been added yet
            if (
                reactionRoles.map(rr => rr[0].id ?? rr[0].name)
                    .includes(emojiID ?? r.emoji.name)
            ) {
                return false;
            }

            // If the emoji doesn't have an ID, it's a default one
            if (!emojiID) {
                return true;
            }

            // Filter out emojis from other servers
            return emoji ? true : false;
        };

        
        // ----- STEP FOUR: CREATE REACTION ROLES -----

        const roleCheck: CollectorFilter<[RoleSelectMenuInteraction]> = (r: RoleSelectMenuInteraction) => {
            // Make sure that the user who used the command is the one who selected a role
            return r.user.id === ctx.user.id &&
                   // Make sure that the role isn't already in the reaction roles
                   !reactionRoles.map(rr => rr[1].id).includes(r.values[0]);
        };

        // The first reaction role selection is different from the rest!

        await prompt.edit({
            content: "Alright, next up is selecting emojis and roles!\n" +
                     `You can have up to ${maxReactionRoles} reaction role${maxReactionRoles === MIN_RR ? "" : "s"}\n` +
                     `Here's a preview of the message:\n${content ?? ""}`,
            embeds: embed ? [embed] : null,
            components: []
        });

        const emojiPrompt: Message = await ctx.followUp({
            content: "React with an emoji that you want to use for your reaction roles!\n" +
                     "(This interaction times out in 1 minute and only accepts default emojis or emojis from this server)",
        });

        // Get the emoji ID from the reaction
        let emoji: Emoji;
        try {
            // Times out after 1 minute
            const reaction: MessageReaction = (await emojiPrompt.awaitReactions({
                filter: emojiCheck,
                max: 1,
                time: REACTION_TIMEOUT,
                errors: ["time"]
            })).first();

            emoji = reaction.emoji;

            // Clean up the message
            await emojiPrompt.delete();
        } catch {
            // If the interaction timed out, abort as well
            await ctx.followUp({
                content: "Interaction timed out, ending reaction role creation",
            });
            return;
        }

        // Create a menu with the two message types
        const roleMenu: RoleSelectMenuBuilder = new RoleSelectMenuBuilder()
            .setCustomId("role")
            .setPlaceholder("Select a role to attach");

        const roleRow: ActionRowBuilder<RoleSelectMenuBuilder> = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents(roleMenu);

        await prompt.edit({
            content: `Alright, let's pick a role for ${emoji}!\n` +
                     "Keep in mind that my highest role must be above this role " +
                     "and that it can't be managed by an integration\n" +
                     `Here's the preview of the message:\n${content ?? ""}`,
            embeds: embed ? [embed] : null,
            components: [roleRow]
        });

        // Disable the buttons to signify that the interaction has ended
        roleRow.components.forEach(c => c.setDisabled(true));

        // Wait for the style selection
        let role: Role;
        try {
            // Times out after 1 minute
            const roleSelection = await prompt.awaitMessageComponent<ComponentType.RoleSelect>({
                filter: roleCheck,
                time: SELECT_MENU_TIMEOUT
            });

            role = <Role> roleSelection.roles.first();

            // End the interaction as soon as a button is pressed
            await roleSelection.update({
                components: [roleRow]
            });
        } catch {
            // End the interaction upon timeout
            await prompt.edit({
                components: [roleRow]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp({
                content: "Interaction timed out, ending reaction role creation",
                
            });
            return;
        }

        // Push the reaction role to the array
        reactionRoles.push([emoji, role]);


        // Check if the user pressing the button is the same user
        const buttonCheck: CollectorFilter<[ButtonInteraction]> = (m: ButtonInteraction): boolean => m.user.id === ctx.user.id;


        // ----- STEP FOUR, ONE: ADD MORE REACTION ROLES -----

        let reactionRolesPreview: string = "";
        while (reactionRoles.length < maxReactionRoles) {
            // Ask the user if they want to keep adding reaction roles

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

            reactionRolesPreview = "";
            reactionRoles.forEach(rr => {
                reactionRolesPreview += `${rr[0]} - ${rr[1]}\n`;
            });

            await prompt.edit({
                content: "Do you want to keep adding reaction roles?\n" +
                         `Here are the reaction roles you've added so far:\n${reactionRolesPreview}` +
                         `Here's the preview of the message:\n${content ?? ""}`,
                embeds: embed ? [embed] : null,
            });

            const continuePrompt: Message = await ctx.followUp({
                content: "Do you want to keep adding reaction roles?",
                components: [row]
            });

            // Disable the buttons to signify that the interaction has ended
            row.components.forEach(c => c.setDisabled(true));

            try {
                // Times out after 1 minute
                const confirmation: MessageComponentInteraction = await continuePrompt.awaitMessageComponent({
                    filter: buttonCheck,
                    time: SELECT_MENU_TIMEOUT
                });

                // If the user selected no, stop adding reaction roles
                if (confirmation.customId === "no") {
                    break;
                }
            } catch (e) {
                // End the interaction upon timeout
                await continuePrompt.edit({
                    components: [row]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp("Interaction timed out, ending reaction role creation");
                return;
            } finally {
                // Clean up the message
                await continuePrompt.delete();
            }

            await prompt.edit({
                content: "Well then, more emojis!\n" +
                         `Here are the reaction roles you've added so far:\n${reactionRolesPreview}` +
                         `Here's a preview of the message:\n${content ?? ""}`,
                components: [],
                embeds: embed ? [embed] : null
            });
    
            const emojiPrompt: Message = await ctx.followUp({
                content: "React with an emoji that you want to add to your reaction roles!\n" +
                         "(This interaction times out in 1 minute and only accepts default emojis or emojis from this server)",
            });
    
            // Get the emoji ID from the reaction
            let emoji: Emoji;
            try {
                // Times out after 1 minute
                const reaction: MessageReaction = (await emojiPrompt.awaitReactions({
                    filter: emojiCheck,
                    max: 1,
                    time: REACTION_TIMEOUT,
                    errors: ["time"]
                })).first();
    
                emoji = reaction.emoji;
    
                // Clean up the message if possible
                if (emojiPrompt.deletable) {
                    await emojiPrompt.delete();
                }
            } catch {
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                });
                return;
            }
    
            // Create a menu with the two message types
            const roleMenu: RoleSelectMenuBuilder = new RoleSelectMenuBuilder()
                .setCustomId("role")
                .setPlaceholder("Select a role to attach");
    
            const roleRow: ActionRowBuilder<RoleSelectMenuBuilder> = new ActionRowBuilder<RoleSelectMenuBuilder>()
                .addComponents(roleMenu);
    
            await prompt.edit({
                content: `Alright, let's pick a role for ${emoji}!\n` +
                         "Keep in mind that my highest role must be above this role and that it " +
                         "can't be managed by an integration or be a role you've already added\n" +
                         `Here's the preview of the message:\n${content ?? ""}`,
                embeds: embed ? [embed] : null,
                components: [roleRow]
            });
    
            // Disable the buttons to signify that the interaction has ended
            roleRow.components.forEach(c => c.setDisabled(true));
    
            // Wait for the style selection
            let role: Role;
            try {
                // Times out after 1 minute
                const roleSelection = await prompt.awaitMessageComponent<ComponentType.RoleSelect>({
                    filter: roleCheck,
                    time: SELECT_MENU_TIMEOUT
                });
    
                role = <Role> roleSelection.roles.first();
    
                // End the interaction as soon as a button is pressed
                await roleSelection.update({
                    components: [roleRow]
                });
            } catch {
                // End the interaction upon timeout
                await prompt.edit({
                    components: [roleRow]
                });
                // If the interaction timed out, abort as well
                await ctx.followUp({
                    content: "Interaction timed out, ending reaction role creation",
                    
                });
                return;
            }
    
            // Push the reaction role to the array
            reactionRoles.push([emoji, role]);
        }

        // ----- !STEP FOUR, ONE: ADD MORE REACTION ROLES -----


        // ----- STEP FIVE: FINAL PROMPT -----

        reactionRolesPreview = "";
        reactionRoles.forEach(rr => {
            reactionRolesPreview += `${rr[0]} - ${rr[1]}\n`;
        });
        
        await prompt.edit({
            content: "Alright! Here's a final preview of the reaction roles we've set up\n" +
                     `Here are the final reaction roles:\n${reactionRolesPreview}` +
                     `Here's a final preview of the message:\n${content ?? ""}`,
            embeds: embed ? [embed] : null,
            components: []
        });

        const yup: ButtonBuilder = new ButtonBuilder()
            .setCustomId("yup")
            .setLabel("Yup")
            .setStyle(ButtonStyle.Success);
        
        const nope: ButtonBuilder = new ButtonBuilder()
            .setCustomId("nope")
            .setLabel("Nope")
            .setStyle(ButtonStyle.Danger);

        const finalConfirmationRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yup, nope);

        const finalPrompt: Message = await ctx.followUp({
            content: "Are you satisfied with this?",
            components: [finalConfirmationRow]
        });

        // Disable the buttons to signify that the interaction has ended
        finalConfirmationRow.components.forEach(c => c.setDisabled(true));

        try {
            // Times out after 5 minutes
            const confirmation: MessageComponentInteraction = await prompt.awaitMessageComponent({
                filter: buttonCheck,
                time: PARAGRAPH_TIMEOUT
            });

            // Delete the final prompt
            await finalPrompt.delete();

            // If the user selected no, stop the command
            if (confirmation.customId === "nope") {
                await prompt.edit({
                    content: "Welp, pleasure working with ya!",
                    embeds: [],
                    components: []
                });
                return;
            }

            // Clean up the setup wizard
            await prompt.delete();
        } catch (e) {
            // End the interaction upon timeout
            await finalPrompt.edit({
                components: [finalConfirmationRow]
            });
            // If the interaction timed out, abort as well
            await ctx.followUp("Interaction timed out, ending reaction role creation");
            return;
        }

        // ----- !STEP FIVE: FINAL PROMPT -----


        // ----- STEP SIX: SEND THE REACTION ROLE MESSAGE -----

        const rowCount: number = Math.ceil(reactionRoles.length / BUTTONS_PER_ROW);

        const reactionRows: ActionRowBuilder<ButtonBuilder>[] = [];

        // Create the action rows for the reaction roles' message
        for (let i = 0; i < rowCount; i++) {
            // The buttons for this action row
            const buttons: ButtonBuilder[] = [];

            // Create up to five buttons or until we reach the last
            // reaction role
            for (
                let j = 0;
                j < BUTTONS_PER_ROW && 
                i * BUTTONS_PER_ROW + j < reactionRoles.length;
                j++
            ) {
                const [emoji, ] = reactionRoles[i * BUTTONS_PER_ROW + j];
                
                const button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(emoji.id ?? emoji.name)
                    .setEmoji(emoji.id ?? emoji.name)
                    .setStyle(ButtonStyle.Secondary);
                buttons.push(button);
            }

            // Add the buttons
            reactionRows.push(
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(...buttons)
            );
        }

        const reactionRoleMessage: Message = await ctx.channel.send({
            content: content,
            embeds: embed ? [embed] : null,
            components: reactionRows
        });

        // ----- STEP SIX: SEND THE REACTION ROLE MESSAGE -----


        // ----- STEP SEVEN: SAVE TO DATABASE -----

        const finalReactionRoles: Map<Snowflake, Snowflake> = new Map();

        // Populate the map of reaction roles
        reactionRoles.forEach(rr => {
            finalReactionRoles.set(rr[0].id ?? rr[0].name, rr[1].id);
        });

        // Set the reaction role data
        const server: Server = await Server.get(ctx.guildId);
        server.setReactionRoles(
            reactionRoleMessage.channelId,
            reactionRoleMessage.id,
            style,
            finalReactionRoles
        );
        await server.save();
        
        // ----- !STEP SEVEN: SAVE TO DATABASE -----
    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Reactionroles")
        .setDescription(
            "A server configuration command that starts a reaction role setup wizard"
        )
        .addFields(
            { name: "Format", value: `\`/config ${name}\`` }
        )
};
