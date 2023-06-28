import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../command-template.js";

export default {
    // Command headers
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the bot's response time")
        .setDMPermission(false),
    
    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Retrieves the avarage ping from the websocket
        await ctx.reply(`:ping_pong: ${ctx.client.ws.ping} ms`);
    },
    
    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Ping")
        .setDescription("A command that displays the current latency of the bot in milliseconds")
        .addFields(
            { name: "Format", value: "`/ping`" }
        )
} as Command;
