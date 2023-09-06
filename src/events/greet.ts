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

import { Guild, GuildMember } from "discord.js";

/*
 * This module has string formatters for welcome- and goodbye messages
 */

/**
 * The action of welcoming or saying goodbye to a member.
 */
export enum Action {
    /**
     * Welcoming new members.
     */
    Welcome,

    /**
     * Saying goodbye to members leaving.
     */
    Goodbye
}

/**
 * The string that gets replaced with the member's Discord display name
 * in the formatted string.
 */
export const NAME: string = "{name}";
const NAME_RE: RegExp = /{name}/g;

/**
 * The string that gets replaced with a mention to the member
 * in the formatted string.
 */
export const PING: string = "{ping}";
const PING_RE: RegExp = /{ping}/g;

/**
 * The string that gets replaced with the server's name
 * in the formatted string.
 */
export const SERVER: string = "{server}";
const SERVER_RE: RegExp = /{server}/g;

/**
 * The string that gets replaced with the server owner's name
 * in the formatted string.
 */
export const OWNER: string = "{owner}";
const OWNER_RE: RegExp = /{owner}/g;

/**
 * The string that gets replaced with a new line character
 * in the formatted string.
 */
export const NEW_LINE: string = "{nl}";
const NEW_LINE_RE: RegExp = /{nl}/g;

/**
 * Default greeting when none is in the configurations.
 */
const DEFAULT_GREETING: string = `Welcome to ${SERVER}, ${NAME}!`;

/**
 * Default greeting when none is in the configurations.
 */
const DEFAULT_GOODBYE: string = `${NAME} has left ${SERVER} :(`;

/**
 * Formats a greetings ar farewells using a configured template.
 * 
 * @param action the action, either greeting or goodbye
 * @param template the template to use for the post
 * @returns a formatted post
 */
export const formatGreeting = async (member: GuildMember, action: Action, template: string): Promise<string | null> => {
    // Use the default template if none was provided
    switch (action) {
        case Action.Welcome:
            template = template || DEFAULT_GREETING;
            break;
        case Action.Goodbye:
            template = template || DEFAULT_GOODBYE;
            break;
    }
    const displayName: string = member.displayName;
    const server: Guild = member.guild;
    const owner: string = (await server.fetchOwner()).displayName;

    return template.replace(NAME_RE, displayName)
        .replace(PING_RE, `${member}`)
        .replace(SERVER_RE, server.name)
        .replace(OWNER_RE, owner)
        .replace(NEW_LINE_RE, "\n");
};
