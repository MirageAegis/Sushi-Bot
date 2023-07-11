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

import { ChatInputCommandInteraction, DiscordAPIError, InteractionReplyOptions } from "discord.js";
import { NoMemberFoundError, UserIsMemberError } from "./errors";

// ----- ERROR CODES -----

export const MISSING_PERMISSIONS: number = 50013;
export const UNKNOWN_BAN: number = 10026;

// ----- !ERROR CODES -----

export type ErrorHandler = { (ctx: ChatInputCommandInteraction, err: Error): Promise<void> };

export const defaultErrorHandler: ErrorHandler = async (ctx: ChatInputCommandInteraction, err: Error): Promise<void> => {
    // TODO: Implement default error handler
    console.log(err);

    const reply: InteractionReplyOptions = {};
    // eslint-disable-next-line prefer-const

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
};
