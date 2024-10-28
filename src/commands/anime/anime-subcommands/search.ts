/*
 * MIT License
 * 
 * Copyright (c) 2024-present Fabian "Splitzy" Sales
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
    EmbedBuilder, ChatInputCommandInteraction, ChannelType, SlashCommandSubcommandBuilder, TextChannel
} from "discord.js";
import { Subcommand } from "../../../util/command-template.js";
import { defaultErrorHandler } from "../../../util/error-handler.js";
import Kitsu from "kitsu";

const api = new Kitsu()

/*
 * A server command for searching for anime
 */


const name: string = "search";

export const command: Subcommand = {
    // Command headers
    data: new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription("search for an anime")
        .addStringOption(o =>
            o.setName("query")
                .setDescription("The anime to search for")
                .setRequired(true)
        ),

    // Command exacution
    async execute(ctx: ChatInputCommandInteraction): Promise<void> {
        // Default values for parameters
        const query: string = ctx.options.getString("query");
        let animeEmbed: EmbedBuilder = new EmbedBuilder().setTitle(`Kitsu Search: ${query}`).setColor("Orange").setThumbnail("https://avatars.slack-edge.com/2017-07-16/213464927747_f1d4f9fb141ef6666442_512.png")
        await ctx.deferReply();

        // Search for the anime
        api.get('anime', { params: { filter: { text: query } } }).then((res: any) => {

            const results = res.data.map((anime: any) => {
                return {
                    title: anime.titles,
                    url: `https://kitsu.io/anime/${anime.id}`
                }
            });

            console.log(results);

            if (results.length === 0) {
                animeEmbed.setDescription("No results found");
            } else {

                //parse out the titles
                const titles = results.map((anime: any) => {
                    return anime.title
                }).map((title: any) => {
                    const firstKey = Object.keys(title)[0];
                    return title[firstKey];;
                }).join('\n');

                animeEmbed.setDescription("Here are the search results")
                    .addFields({ name: "Anime", value: titles });

            }
            ctx.followUp({ embeds: [animeEmbed] })
        });

    },

    // Error handler
    error: defaultErrorHandler,

    // Help command embed
    help: new EmbedBuilder()
        .setTitle("Search")
        .setDescription(
            "A command for searching for anime"
        )
        .addFields(
            { name: "Format", value: `\`/${name} [query]\`` },
            { name: "[query]", value: "required parameter. The name of the anime you want to search for" }
        )
};
