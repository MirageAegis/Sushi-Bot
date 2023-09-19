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

import { Activity, Snowflake } from "discord.js";

/*
 * This module has a string formatter for auto shout outs and go-live posts
 */

// ----- STRING FORMATTING -----

/**
 * The string that gets replaced with the streamer's Discord display name
 * in the formatted string.
 */
export const DISCORD_NAME: string = "{name}";
const DISCORD_NAME_RE: RegExp = /{name}/g;

/**
 * The string that gets replaced with the streamer's Twitch username 
 * in the formatted string.
 */
export const CHANNEL: string = "{channel}";
const CHANNEL_RE: RegExp = /{channel}/g;

/**
 * The string that gets replaced with the streamer's Twitch link
 * in the formatted string.
 */
export const LINK: string = "{link}";
const LINK_RE: RegExp = /{link}/g;

/**
 * The string that gets replaced with the streamer's current title
 * in the formatted string.
 */
export const TITLE: string = "{title}";
const TITLE_RE: RegExp = /{title}/g;

/**
 * The string that gets replaced with the streamer's current game
 * in the formatted string.
 */
export const GAME: string = "{game}";
const GAME_RE: RegExp = /{game}/g;

/**
 * The string that gets replaced with a new line character
 * in the formatted string.
 */
export const NEW_LINE: string = "{nl}";
export const NEW_LINE_RE: RegExp = /{nl}/g;

/**
 * Default go-live and shout out string used when none is in the configurations.
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
    // eslint-disable-next-line no-magic-numbers
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

    return template.replace(DISCORD_NAME_RE, displayName)
        .replace(CHANNEL_RE, channel)
        .replace(LINK_RE, link)
        .replace(TITLE_RE, title)
        .replace(GAME_RE, game)
        .replace(NEW_LINE_RE, "\n");
};

// ----- !STRING FORMATTING -----


// ----- COOLDOWNS -----

/**
 * The cooldown period in milliseconds.
 */
const TEN_MINUTES: number = 600_000;

/**
 * The cached shout out cooldowns.
 */
const cooldownCache: Map<Snowflake, NodeJS.Timeout> = new Map();

/**
 * Starts a cooldown for a user.
 * Users on cooldown will not be shouted out.
 * 
 * @param user the ID of the user to start a cooldown for
 */
export const startCooldown = (user: Snowflake): void => {
    // Get the existing cooldown if there is one
    const cooldown: NodeJS.Timeout = cooldownCache.get(user);

    // Remove the cooldown if it exists
    if (cooldown) {
        clearTimeout(cooldown);
    }

    // Set a new cooldown
    cooldownCache.set(
        user,
        setTimeout(() => {
            cooldownCache.delete(user);
        }, TEN_MINUTES)
    );
};

/**
 * Checks whether a user is on cooldown or not.
 * 
 * @param user the ID of the user to check
 */
export const onCooldown = (user: Snowflake): boolean => {
    // Get the existing cooldown if there is one
    const cooldown: NodeJS.Timeout = cooldownCache.get(user);

    return cooldown ? true : false;
};

// ----- COOLDOWNS -----
