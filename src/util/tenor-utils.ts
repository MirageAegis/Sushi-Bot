/*
 * MIT License
 *
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

/*
 * This is a library file that allows interacting with the Google Tenor API,
 * giving the bot the ability to fetch gifs for later uses in embeds
 */

import axios from "axios";
import { TenorError } from "./errors";

// Content safety filter level for the GIFs

type filterType = "off" | "low" | "medium" | "high";

/*
 * Aspect ratio settings for the GIFs
 * standard : 0,56 <= x <= 1.78
 * wide : 0.42<= x <= 2.36
 */

type aspectRatio = "all" | "wide" | "standard";

// The content formats allowed by TENOR

type contentFormat =
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
    contentfilter?: filterType;
    media_filter?: contentFormat;
    ar_range?: aspectRatio;
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
    media_formats: Record<contentFormat, tenorMediaObject>;
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

type tenorMediaObject = {
    url: string;
    dims: number[];
    duration: number;
    size: number;
};

//

const DEFAULT_RESPONSE_LIMIT = 100;
const TWELVE_HOURS = 43_200_000;

// Exported Singleton class that will later be used in the program.

export class TenorSingleton {
    private static instance: TenorSingleton | null | undefined;
    private client: axios.AxiosInstance;
    private static cache: Map<string, string[]>;

    private constructor() {
        this.client = axios.create({
            baseURL: "https://tenor.googleapis.com/v2",
        });
        return this;
    }

    public static getInstance(): TenorSingleton {
        if (!this.instance) {
            this.instance = new TenorSingleton();
            this.cache = new Map();
            setInterval(() => {
                this.cache.clear();
            }, TWELVE_HOURS);
        }
        return this.instance;
    }
    /**
     * This function gets GIFs from the Tenor API, caching them in the process.
     * @param topic specifies the topic of the gif search
     * @returns  
     */
    public async getGifs(
        topic: string,
    ): Promise<string> {

        /*
        * Getting the gifs from the topic
        * If the cache is full -> get a random one from cache
        */
        const gifArray: string[] = TenorSingleton.cache.get(topic);

        //TODO: why the fuck should i compare stuff with !== and not !=, how strict is that?
        // eslint-disable-next-line no-magic-numbers
        if (gifArray.length !== 0) {
            return (gifArray[Math.floor(Math.random() * DEFAULT_RESPONSE_LIMIT)]);
        }

        /*
         * If there are no gifs in the cache for the specified topic -- fetch some 
         * from Tenor
         */

        /*eslint-disable*/
        const requestParams: TenorRequestParameters = {
            q: topic,
            key: process.env.TENOR_KEY,
            client_key: "sushi-bot",
            contentfilter: "low",
            media_filter: "gif",
            ar_range: "standard",
            random: true,
            limit: DEFAULT_RESPONSE_LIMIT,
        };
        /*eslint-enable*/
        try {
            const gifObjects: TenorResponseObject[] = (await this.client.get<TenorResponse>("/search")).data.results;

            // Populate the Gif array with the data from the response
            for (let i = 0; i < DEFAULT_RESPONSE_LIMIT; i++) {
                // get a GIF's URL from response
                const gifURL = gifObjects[i].media_formats.gif.url;
                gifArray[i] = gifURL;
            }
            TenorSingleton.cache.set(topic, gifArray);
            return (gifArray[Math.floor(Math.random() * DEFAULT_RESPONSE_LIMIT)]);
        } catch {
            throw new TenorError;
        }
    }
}

