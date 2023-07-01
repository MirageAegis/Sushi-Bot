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

import { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";

export type ErrorHandler = { (ctx: ChatInputCommandInteraction, err: Error): Promise<void> };

export const defaultErrorHandler: ErrorHandler = async (ctx: ChatInputCommandInteraction, err: Error): Promise<void> => {
    // TODO: Implement default error handler
    console.log(err);

    let reply: InteractionReplyOptions;
    // eslint-disable-next-line prefer-const
    reply = {
        content: "Oops! Something seems to have gone wrong...",
        ephemeral: true 
    };
    
    if (ctx.replied || ctx.deferred) {
        await ctx.followUp(reply);
    } else {
        await ctx.reply(reply);
    }
};
