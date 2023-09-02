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
    ButtonInteraction, Client, Collection, Guild, GuildMember, Message, Role, Snowflake, TextChannel
} from "discord.js";
import { ReactionRoleStyle, ReactionRoles, Server } from "../schemas/server";
import { getAdminLogsChannel } from "../util/channels";

/**
 * Handles button presses. Right now it only cares about reaction roles.
 * 
 * @param button the button interaction
 */
export const onButtonPressed = async (button: ButtonInteraction): Promise<void> => {
    // The message of the button interaction
    const message: Message = button.message;
    // The ID of the button, which shouls be shared with an emoji 
    const emoji: Snowflake = button.customId;
    
    // The discord server
    const guild: Guild = button.guild;

    // The server configurations for reaction roles
    const server: Server = await Server.get(button.guildId);
    const roles: ReactionRoles = server.getReactionRoles(message.id);

    // Do nothing if there aren't any reaction roles
    if (!roles) {
        return;
    }
    
    // The reaction role's ID
    const role: Snowflake = roles.reactionRoles.get(emoji);
    // The reaction role's style
    const style: ReactionRoleStyle = roles.mode;

    // The member who pressed the button
    const member: GuildMember = await guild.members.fetch({
        user: button.user.id
    });

    // The member's roles
    const memberRoles: Collection<Snowflake, Role> = member.roles.cache;

    if (style === "regular") {
        // The regular style just toggles the roles
        if (memberRoles.has(role)) {
            await member.roles.remove(
                role,
                "Reaction roles"
            );

            await button.reply({
                content: `Removed <@&${role}>`,
                ephemeral: true
            });
        } else {
            await member.roles.add(
                role,
                "Reaction roles"
            );

            await button.reply({
                content: `Added <@&${role}>`,
                ephemeral: true
            });
        }
    } else if (style === "unique") {
        // The unique style only allows users to have one of
        // the reaction roles, but also works as an off toggle
        if (memberRoles.has(role)) {
            await member.roles.remove(
                role,
                "Reaction roles"
            );

            await button.reply({
                content: `Removed <@&${role}>`,
                ephemeral: true
            });

            return;
        }

        const rolesArr: Snowflake[] = [];

        for (const [, roleId] of roles.reactionRoles) {
            rolesArr.push(roleId);
        }

        await member.roles.remove(
            rolesArr,
            "Reaction roles"
        );

        await member.roles.add(
            role,
            "Reaction roles"
        );

        await button.reply({
            content: `Added <@&${role}>`,
            ephemeral: true
        });
    } else {
        // The confirm style only allows users to get a role
        await member.roles.add(role);

            await button.reply({
                content: `Added <@&${role}>`,
                ephemeral: true
            });
    }
};

/**
 * Six hours in milliseconds. Used as interval for refreshing reaction roles.
 */
const SIX_HOURS: number = 21_600_000;

let refreshInitiated: boolean = false;

/**
 * Refreshes all reaction roles in the database, deleting ones that no longer exist.
 * 
 * @param client the Discord bot
 */
const refreshReactionRoles = async (client: Client): Promise<void> => {
    await getAdminLogsChannel().send("Refreshing reaction roles...");

    // For each server...
    for await (const [serverId, ] of client.guilds.cache) {
        const server: Server = await Server.get(serverId);

        const reactionMessages: ReadonlyMap<Snowflake, ReactionRoles> = server.reactionRoles;

        // Skip servers without reaction roles
        if (!reactionMessages) {
            continue;
        }

        // Check all reaction roles
        for await (const [messageId, reactionRoles] of reactionMessages) {
            const channelId: Snowflake = reactionRoles.channel;

            // Reaction role channels are always text channels
            const channel: TextChannel = <TextChannel> client.channels.cache.get(channelId);

            try {
                // Check if the message exists
                await channel.messages.fetch(messageId);
            } catch {
                // Delete the configuration if the message is gone
                server.deleteReactionRoles(messageId);
                await getAdminLogsChannel().send(
                    `Deleted reaction roles for **${messageId}** in **${channel.guild.name}**`
                );
            }
        }

        // Save to the database
        await server.save();
    }

    await getAdminLogsChannel().send("Reaction roles refreshed!");
};

/**
 * Initiates an interval that refreshes the reaction roles data in the database.
 *  
 * @param client the Discord bot
 */
export const initRefreshReactionRolesInterval = async (client: Client): Promise<void> => {
    // Do nothing if this has already been initiated
    if (refreshInitiated) {
        return;
    }

    // Otherwise initiate
    refreshInitiated = true;

    await refreshReactionRoles(client);

    // Create a co-routine that triggers every six hours
    setInterval(async (): Promise<void> => {
        await refreshReactionRoles(client);
    }, SIX_HOURS);
};
