/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
 * Copyright (c) 2023-present Zahatikoff
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

import { TextChannel, Client, Channel, ChannelType } from "discord.js";
import { NoClientProvidedError, NotTextChannelError } from "./errors";

// The sincgleton representing the user reports channel in the admin/official server
let userReportChannel: TextChannel = null;

/**
 * Gets the channel for user reports.
 * Used to log reports from `/blacklist`
 * 
 * @param client the client to fetch the channel from if uninitialised
 * @returns the user reports channel
 */
export const getUserReportsChannel = (client: Client = null): TextChannel => {
    // If the channel has been instantiated, return it
    if (userReportChannel) {
        return userReportChannel;
    }

    // If there's no client and no channel, the channel can't be fetched
    if (!client) {
        throw new NoClientProvidedError();
    }

    const channel: Channel = client.channels
        .cache.get(process.env.USER_REPORTS_CHANNEL_ID);

    if (channel.type !== ChannelType.GuildText) {
        throw new NotTextChannelError();
    }

    return userReportChannel = <TextChannel> channel;
};