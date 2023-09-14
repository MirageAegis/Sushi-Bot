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
    ButtonInteraction, ChatInputCommandInteraction, DiscordAPIError, Guild, GuildMember,
    Interaction, InteractionReplyOptions, Message, User
} from "discord.js";
import { NoMemberFoundError, UserIsMemberError } from "./errors";
import { getAdminLogsChannel } from "./channels";

// ----- ERROR CODES -----

export const MISSING_PERMISSIONS: number = 50013;
export const UNKNOWN_MEMBER: number = 10007;
export const UNKNOWN_BAN: number = 10026;
export const MESSAGES_TOO_OLD_FOR_BULK_DELETION: number = 50034;
export const INT_OVER_100: number = 50035;

// ----- !ERROR CODES -----

export type ErrorHandler = { (ctx: Interaction, err: Error): Promise<void> };

export const defaultErrorHandler: ErrorHandler = async (ctx: ChatInputCommandInteraction, err: Error): Promise<void> => {
    console.log(err);

    // ----- COMMAND REPLY -----

    const reply: InteractionReplyOptions = {};

    switch (true) {
        case err instanceof NoMemberFoundError:
            reply.content = "Could not find the member. The user might not be in the server";
            break;
        case err instanceof UserIsMemberError:
            reply.content = "The user is already a member";
            break;
        case err instanceof DiscordAPIError:
            switch ((<DiscordAPIError> err).code) {
                case MISSING_PERMISSIONS:
                    reply.content = "I seem to be missing permissions for this action. Ask the server owner/administrators for help";
                    break;
                case UNKNOWN_BAN:
                    reply.content = "This user isn't banned from the server";
                    break;
                default:
                    reply.content = "Oops! Something seems to have gone wrong...";
                    break;
            }
            break;
        default:       
            reply.content = "Oops! Something seems to have gone wrong...";
            break;
    }

    reply.ephemeral = true;
    
    if (ctx.replied || ctx.deferred) {
        await ctx.followUp(reply);
    } else {
        await ctx.reply(reply);
    }

    // ----- !COMMAND REPLY -----

    // ----- ERROR LOG -----

    const user: User = ctx.user;

    const report: string = "```\n" +
                           "Command Error\n\n" +
                           `Server: ${ctx.guild.name}\n` +
                           `User: ${user.id} (${user.username})\n` +
                           `Command: ${ctx.commandName}\n` +
                           `Options: ${ctx.options.toString()}\n\n` +
                           // Error name, and error code if it's a Discord API error
                           `${err.name}${err instanceof DiscordAPIError ? `: ${err.code} (${err.message})` : ""}\n` +
                           "```";
    
    await getAdminLogsChannel().send(report);
    
    // ----- !ERROR LOG -----
};

export const reactionRolesErrorHandler: ErrorHandler = async (ctx: ButtonInteraction, err: Error): Promise<void> => {
    console.log(err);
    
    // ----- BUTTON INTERACTION REPLY -----

    const reply: InteractionReplyOptions = {};

    switch (true) {
        case err instanceof DiscordAPIError:
            switch ((<DiscordAPIError> err).code) {
                case MISSING_PERMISSIONS:
                    reply.content = "I seem to be missing permissions for this action. Ask the server owner/administrators for help";
                    break;
                default:
                    reply.content = "Oops! Something seems to have gone wrong...";
                    break;
            }
            break;
        default:       
            reply.content = "Oops! Something seems to have gone wrong...";
            break;
    }

    reply.ephemeral = true;
    
    if (ctx.replied || ctx.deferred) {
        await ctx.followUp(reply);
    } else {
        await ctx.reply(reply);
    }

    // ----- !COMMAND REPLY -----

    // ----- ERROR LOG -----

    const user: User = ctx.user;

    const report: string = "```\n" +
                           "Reaction Roles Error\n\n" +
                           `Server: ${ctx.guild.name}\n` +
                           `User: ${user.id} (${user.username})\n\n` +
                           // Error name, and error code if it's a Discord API error
                           `${err.name}${err instanceof DiscordAPIError ? `: ${err.code} (${err.message})` : ""}\n` +
                           "```";
    
    await getAdminLogsChannel().send(report);
    
    // ----- !ERROR LOG -----
};

/**
 * Actions related to the members logs category.
 */
export enum MemberLogsAction {
    MemberJoin = "Member Join",
    MemberLeave = "Member Leave",
    MemberBan = "Member Ban",
    MemberUnban = "Member Unban"
}

/**
 * Actions related to the profiles logs category.
 */
export enum ProfileLogsAction {
    MemberUpdate = "Member Update",
    UserUpdate = "User Update"
}

/**
 * Actions related to the messages logs category.
 */
export enum MessageLogsAction {
    MessageEdit = "Message Edit",
    MessageDelete = "Message Delete"
}

/**
 * All logs categories.
 */
type LogsAction = MemberLogsAction |
    ProfileLogsAction |
    MessageLogsAction;

/**
 * The trigger of a logs error.
 * A User if it's related to a user update, or a ban, or
 * a message.
 * otherwise a member.
 */
type Trigger<T extends LogsAction> = T extends ProfileLogsAction.UserUpdate |
    MemberLogsAction.MemberBan |
    MemberLogsAction.MemberUnban |
    MessageLogsAction ? User : GuildMember;

/**
 * The payload of a logs error.
 * The before and after states of a Message if it's a message edit action, or
 * a single message if it's a message delete action, or
 * the before and after states of a User if it's a user update action, or
 * the before and after states of a Member if it's a member update action.
 */
type Payload<T extends LogsAction> = T extends MessageLogsAction.MessageEdit ? [before: Message, after: Message] :
    T extends MessageLogsAction ? [message: Message] :
    T extends ProfileLogsAction.UserUpdate ? [before: User, after: User] :
    T extends ProfileLogsAction.MemberUpdate ? [before: GuildMember, after: GuildMember] :
    [];

/**
 * Handles errors related to moderation logs.
 * It logs the error along with any payload to the error logs channel.
 * 
 * @param action the logs action
 * @param server the server the error originated from
 * @param trigger the member or user who triggered the error
 * @param err the error that occurred
 * @param payload the error payload
 */
export const moderationLogsErrorHandler = async <T extends LogsAction>(
    action: T,
    server: Guild,
    trigger: Trigger<T>,
    err: Error,
    ...payload: Payload<T>
): Promise<void> => {
    console.log(err);
    
    const username: string = trigger instanceof User ? trigger.username : trigger.user.username;
    const uid: string = trigger instanceof User ? trigger.username : trigger.user.username;

    // The states from the payload
    let before: string = null;
    let after: string = null;

    /*eslint-disable no-magic-numbers*/
    if (payload.length === 1) {
        // Payload length of 1 means that a message was deleted
        // We're slicing it to avoid having the error log message
        // exceed the character limit
        before = payload[0].content.slice(0, 100);
    } else if (payload.length === 2) {
        // Payload length of 2 means that something has changed
        if (payload[0] instanceof Message) {
            // If it's a message update, take the content of them
            before = payload[0].content.slice(0, 100);
            after = (<Message> payload[1]).content.slice(0, 100);
        } else if (payload[0] instanceof User) {
            // If it's a user profile update, take the relevant data
            const beforeUser: User = payload[0];
            const afterUser: User = <User> payload[1];

            before = "user: {\n" +
                     `\tusername: ${beforeUser.username}\n` +
                     `\tisplay name: ${beforeUser.displayName}\n` +
                     `\tavatar: ${beforeUser.avatarURL()}\n` +
                     "}";
            after = "user: {\n" +
                    `\tusername: ${afterUser.username}\n` +
                    `\tdisplay name: ${afterUser.displayName}\n` +
                    `\tavatar: ${afterUser.avatarURL()}\n` +
                    "}";
        } else {
            // Do the same for member profile updates
            const beforeMember: GuildMember = payload[0];
            const afterMember: GuildMember = <GuildMember> payload[1];

            before = "member: {\n" +
                     `\tusername: ${beforeMember.user.username}\n` +
                     `\tnickname: ${beforeMember.nickname}\n` +
                     `\tavatar: ${beforeMember.avatarURL()}\n` +
                     "}";
            after = "user: {\n" +
                    `\tusername: ${afterMember.user.username}\n` +
                    `\tnickname: ${afterMember.nickname}\n` +
                    `\tavatar: ${afterMember.avatarURL()}\n` +
                    "}";
        }
    }
    /*eslint-enable no-magic-numbers*/

    const report: string = "```\n" +
                           `${action} Error\n\n` +
                           `Server: ${server?.name}\n` +
                           `Trigger: ${uid} (${username})\n\n` +
                           `${before ? "Payload\n\n" : ""}` +
                           `${before ? before + "\n": "" }${after ? after + "\n" : ""}` +
                           `${before ? "\n" : ""}` +
                           // Error name, and error code if it's a Discord API error
                           `${err.name}${err instanceof DiscordAPIError ? `: ${err.code} (${err.message})` : ""}\n` +
                           "```";
    
    await getAdminLogsChannel().send(report);
};
