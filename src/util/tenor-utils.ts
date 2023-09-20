/*
 * MIT License
 *
 * Copyright (c) 2023-present Zahatikoff, Mirage Aegis
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

/*
 * This is a library file that allows interacting with the Google Tenor API,
 * giving the bot the ability to fetch gifs for later uses in embeds
 */

import axios from "axios";
import { TenorError } from "./errors";

// Content safety filter level for the GIFs
type FilterType = "off" | "low" | "medium" | "high";

/*
 * Aspect ratio settings for the GIFs
 * standard : 0,56 <= x <= 1.78
 * wide : 0.42<= x <= 2.36
 */

type AspectRatio = "all" | "wide" | "standard";

// The content formats allowed by TENOR

type ContentFormat =
    | "preview"
    | "gif"
    | "mediumgif"
    | "tinygif"
    | "nanogif"
    | "mp4"
    | "loopedmp4"
    | "tinymp4"
    | "nanomp4"
    | "webm"
    | "tinywebm"
    | "nanowebm"
    | "webp_transparent"
    | "tinywebp_transparent"
    | "nanowebp_transparent"
    | "gif_transparent"
    | "tinygif_transparent"
    | "nanogif_transparent";

/*
 * The request string structure featuring all the available parameters, both
 * optional and required.
 * The "pos" parameter can be used in conjunction with the NEXT field of
 * the response object.
 */

type TenorRequestParameters = {
    q: string;
    key: string;
    client_key: string;
    searchfilter?: string;
    country?: string;
    locale?: string;
    contentfilter?: FilterType;
    media_filter?: ContentFormat;
    ar_range?: AspectRatio;
    random?: boolean;
    limit?: number;
    pos?: string;
};

/*
 * The structure of the Tenor API response, which consists of an array of
 * response objects, as well as the "next" key to be used in the next request
 */

type TenorResponse = {
    results: TenorResponseObject[];
    next: string;
};

/*
 * The structure of the response object itself.
 * Most of the fields are metadata, only "media_formats" contains the URL.
 */

type TenorResponseObject = {
    created: number;
    hasaudio: boolean;
    id: string;
    media_formats: Record<ContentFormat, TenorMediaObject>;
    tags: string[];
    title: string;
    content_description: string;
    itemurl: string;
    hascaptions: string;
    flags: string;
    bg_color: string;
    url: string;
};

/*
 * GIF metadata. The only useful part for the project is the URL field that is
 * used for embeds.
 */

type TenorMediaObject = {
    url: string;
    dims: number[];
    duration: number;
    size: number;
};

//

const DEFAULT_RESPONSE_LIMIT: number = 20;
const TWELVE_HOURS: number = 43_200_000;

// Exported Singleton class that will later be used in the program.

export class TenorSingleton {
    private static instance: TenorSingleton | null | undefined;
    private client: axios.AxiosInstance;
    private readonly cache: Map<string, string[]>;

    private constructor() {
        this.client = axios.create({
            baseURL: "https://tenor.googleapis.com/v2",
        });
        this.cache = new Map();

        setInterval(() => {
            this.cache.clear();
        }, TWELVE_HOURS);
    }

    public static getInstance(): TenorSingleton {
        if (!this.instance) {
            this.instance = new TenorSingleton();
        }

        return this.instance;
    }

    /**
     * Gets the URL of a gif. Queries the Tenor API and caches the
     * URLs if none are found.
     * 
     * @param topic the topic of the gif search
     * @returns a gif URL
     */
    public async getGifs(
        topic: string,
    ): Promise<string> {
        /*
        * Getting the gifs from the topic
        * If the cache is full -> get a random one from cache
        */
        const cachedGifs: string[] = this.cache.get(topic);

        if (cachedGifs?.length) {
            return cachedGifs[Math.floor(Math.random() * DEFAULT_RESPONSE_LIMIT)];
        }

        /*
         * If there are no gifs in the cache for the specified topic -- fetch some 
         * from Tenor
         */

        /*eslint-disable camelcase*/
        const requestParams: TenorRequestParameters = {
            q: "anime " + topic, // Prepend every query with "anime " to only receive anime gifs
            key: process.env.TENOR_API_KEY,
            client_key: "sushi-bot",
            contentfilter: "low",
            media_filter: "gif",
            ar_range: "standard",
            random: true,
            limit: DEFAULT_RESPONSE_LIMIT,
        };
        /*eslint-enable camelcase*/

        let gifObjects: TenorResponseObject[];
        try {
            gifObjects = (await this.client.get<TenorResponse>("/search", {
                params:requestParams
            })).data.results;
        } catch {
            throw new TenorError();
        }

        // All gif URLs from the gif objects
        const gifUrls: string[] = gifObjects.map(g => g.media_formats.gif.url);

        this.cache.set(topic, gifUrls);        
        return gifUrls[Math.floor(Math.random() * DEFAULT_RESPONSE_LIMIT)];
    }
}

