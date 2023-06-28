import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

export interface Command {
    /**
     * Metadata for the slash command.
     * Must include name, description, and DM permissions.
     * May also include command options
     */
    data: SlashCommandBuilder;

    /**
     * The callback function to execute whenever a slash command is used.
     * 
     * @param ctx the command context
     */
    execute(ctx: ChatInputCommandInteraction): Promise<void>;

    /**
     * The embed to display when help regarding the command is requested.
     * Must include title, description, and appropriate fields (such as format)
     */
    help: EmbedBuilder;
}
