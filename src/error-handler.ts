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
