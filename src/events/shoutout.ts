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

import { Activity } from "discord.js";

/*
 * This module has string formatters for auto shout outs and go-live posts
 */

/**
 * The string that gets replaced with the streamer's Discord display name
 * in the formatted string.
 */
export const DISCORD_NAME: string = "{name}";

/**
 * The string that gets replaced with the streamer's Twitch username 
 * in the formatted string.
 */
export const CHANNEL: string = "{channel}";

/**
 * The string that gets replaced with the streamer's Twitch link
 * in the formatted string.
 */
export const LINK: string = "{link}";

/**
 * The string that gets replaced with the streamer's current title
 * in the formatted string.
 */
export const TITLE: string = "{title}";

/**
 * The string that gets replaced with the streamer's current game
 * in the formatted string.
 */
export const GAME: string = "{game}";

/**
 * The string that gets replaced with a new line character
 * in the formatted string.
 */
export const NEW_LINE: string = "{nl}";

/**
 * Default go-live and shout out stringused when none is in the configurations.
 */
const DEFAULT_POST: string = `${DISCORD_NAME} is live now! Go watch the stream at ${LINK}`;

/**
 * Gets the Twitch username from a Twitch link.
 * 
 * @param link the Discord user's Twitch link
 * @returns the Discord user's Twitch username
 */
const getTwitchUsername = (link: string): string | null => {
    // Twitch stream links are formatted https://twitch.tv/{username}
    const tokens: string[] = link.split("/");
    // Return {username}
    return tokens[tokens.length - 1];
};

/**
 * Formats a go-live post or shout out for Twitch streamers using a configured template.
 * 
 * @param activity the streaming activity
 * @param template the template to use for the post
 * @returns a formatted post
 */
export const formatGoLivePost = (activity: Activity, template: string): string | null => {
    // Use the default template if none was provided
    template = template || DEFAULT_POST;
    const displayName: string = activity.presence.member.displayName;
    const link: string = activity.url;
    const channel: string = getTwitchUsername(link);
    const title: string = activity.details;
    const game: string = activity.state;

    return template.replace(DISCORD_NAME, displayName)
        .replace(CHANNEL, channel)
        .replace(LINK, link)
        .replace(TITLE, title)
        .replace(GAME, game)
        .replace(NEW_LINE, "\n");
};
