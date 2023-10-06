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
    SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder,
    ChatInputCommandInteraction, AutocompleteInteraction
} from "discord.js";
import { ErrorHandler } from "./error-handler.js";

/**
 * The maximum amount of choices an option can have
 */
export const MAX_CHOICES: number = 25;

export type Command = {
    /**
     * Metadata for the slash command.
     * Must include name, description, and DM permissions.
     * May also include command options
     */
    readonly data: SlashCommandBuilder;

    /**
     * Autocompleter for options with too many choices.
     * MUST be included in commands where a choice has autocomplete
     * set to true.
     */
    readonly autocomplete?: { (ctx: AutocompleteInteraction): Promise<void> }

    /**
     * The callback function to execute whenever a slash command is used
     * 
     * @param ctx the command context
     */
    readonly execute: { (ctx: ChatInputCommandInteraction): Promise<void> };


    readonly error: ErrorHandler;

    /**
     * The embed to display when help regarding the command is requested.
     * Must include title, description, and appropriate fields (such as format)
     */
    readonly help: EmbedBuilder;
};

export type Subcommand = {
    /**
     * Metadata for the slash command subcommand.
     * Must include name and description.
     * May also include command options
     */
    readonly data: SlashCommandSubcommandBuilder;

    /**
     * Autocompleter for options with too many choices.
     * MUST be included in commands where a choice has autocomplete
     * set to true.
     */
    readonly autocomplete?: { (ctx: AutocompleteInteraction): Promise<void> }

    /**
     * The callback function to execute whenever a slash command is used
     * 
     * @param ctx the command context
     */
    readonly execute: { (ctx: ChatInputCommandInteraction): Promise<void> };


    readonly error: ErrorHandler;

    /**
     * The embed to display when help regarding the command is requested.
     * Must include title, description, and appropriate fields (such as format)
     */
    readonly help: EmbedBuilder;
};
