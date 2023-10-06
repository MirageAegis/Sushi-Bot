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

import { EmbedBuilder, Guild, User } from "discord.js";
import { Player, Stats } from "../schemas/player";
import { AZURE, GREEN, MAGENTA } from "./colours";
import { Paths } from "../rpg/types/class";

/**
 * Generates an embed representing a user's profile.
 * 
 * @param user the server member
 * @param player the player document
 * @param stats the stats to display
 * @returns an embed with the player's level, experience, and stats
 */
export const genProfileEmbed = (user: User, server: Guild, player: Player): EmbedBuilder => {
    const stats: Stats = player.stats;

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(user.username)
        .setDescription(
            `**Path:** ${player.path}${player.prestige ? `\n**Limit Breaker ${player.prestige}**`: ""}`
        )
        .setColor(AZURE)
        .setAuthor({
            name: "Profile",
            iconURL: server.iconURL()
        })
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            {
                name: "Classes",
                value: `${player.classes[0] ?? "none"}\n${player.classes[1] ?? ""}`,
                inline: false
            },
            {
                name: "Level",
                value: `${player.level}`,
                inline: false
            },
            {
                name: "Experience",
                value: `${player.experience}/${player.levelThreshold}`,
                inline: false
            },
            {
                name: "HP",
                value: `${stats.health}`,
                inline: true
            },
            {
                name: "GP",
                value: `${stats.guard}`,
                inline: true
            },
            {
                name: "Speed",
                value: `${stats.speed}`,
                inline: true
            },
            {
                name: "Strength",
                value: `${stats.strength}`,
                inline: true
            },
            {
                name: "Defence",
                value: `${stats.defence}`,
                inline: true
            },
            {
                name: "Dexterity",
                value: `${stats.dexterity}`,
                inline: true
            },
            {
                name: "Magic",
                value: `${stats.magic}`,
                inline: true
            },
            {
                name: "Resistance",
                value: `${stats.resistance}`,
                inline: true
            },
            {
                name: "Luck",
                value: `${stats.luck}`,
                inline: true
            },
            {
                name: "Balance",
                value: `${player.balance} Sushi Coins`,
                inline: true
            },
            {
                name: "Reputation",
                value: `${player.reputation}`,
                inline: true
            }
        );

    return embed;
};

/**
 * Generates an embed representing a user's level up.
 * 
 * @param user the server member
 * @param player the player document
 * @param stats the stats to display
 * @param before the level and stats before the level up
 * @param after the level and stats after the level up
 * @returns an embed representing the player's level up
 */
export const genLevelUpEmbed = (
    user: User,
    server: Guild,
    player: Player,
    before: [level: number, stats: Stats],
    after: [level: number, stats: Stats]
): EmbedBuilder => {
    const beforeStats: Stats = before[1];
    const afterStats: Stats = after[1];

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(user.username)
        .setDescription(
            `**Path:** ${player.path}${player.prestige ? `\n**Limit Breaker ${player.prestige}**`: ""}`
        )
        .setColor(GREEN)
        .setAuthor({
            name: "Level up!",
            iconURL: server.iconURL()
        })
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            {
                name: "Classes",
                value: `${player.classes[0] ?? "none"}\n${player.classes[1] ?? ""}`,
                inline: false
            },
            {
                name: "Level",
                value: `${before[0]} ➟ **${after[0]}**`,
                inline: false
            },
            {
                name: "HP",
                value: `${beforeStats.health}${afterStats.health !== beforeStats.health ? ` ➟ **${afterStats.health}**` : ""}`,
                inline: true
            },
            {
                name: "GP",
                value: `${beforeStats.guard}${afterStats.guard !== beforeStats.guard ? ` ➟ **${afterStats.guard}**` : ""}`,
                inline: true
            },
            {
                name: "Speed",
                value: `${beforeStats.speed}${afterStats.speed !== beforeStats.speed ? ` ➟ **${afterStats.speed}**` : ""}`,
                inline: true
            },
            {
                name: "Strength",
                value: `${beforeStats.strength}${afterStats.strength !== beforeStats.strength ? ` ➟ **${afterStats.strength}**` : ""}`,
                inline: true
            },
            {
                name: "Defence",
                value: `${beforeStats.defence}${afterStats.defence !== beforeStats.defence ? ` ➟ **${afterStats.defence}**` : ""}`,
                inline: true
            },
            {
                name: "Dexterity",
                value: `${beforeStats.dexterity}${afterStats.dexterity !== beforeStats.dexterity ? ` ➟ **${afterStats.dexterity}**` : ""}`,
                inline: true
            },
            {
                name: "Magic",
                value: `${beforeStats.magic}${afterStats.magic !== beforeStats.magic ? ` ➟ **${afterStats.magic}**` : ""}`,
                inline: true
            },
            {
                name: "Resistance",
                value: `${beforeStats.resistance}${afterStats.resistance !== beforeStats.resistance ? ` ➟ **${afterStats.resistance}**` : ""}`,
                inline: true
            },
            {
                name: "Luck",
                value: `${beforeStats.luck}${afterStats.luck !== beforeStats.luck ? ` ➟ **${afterStats.luck}**` : ""}`,
                inline: true
            }
        );

    return embed;
};

/**
 * Generates an embed representing a user's limitbreak.
 * 
 * @param user the server member
 * @param player the player document
 * @param stats the stats to display
 * @param before the level, stats, and prestige before the limitbreak
 * @param after the level, stats, and prestige after the limitbreak
 * @returns an embed representing the player's limitbreak
 */
export const genLimitbreakEmbed = (
    user: User,
    server: Guild,
    before: [level: number, stats: Stats, prestige: number],
    after: [level: number, stats: Stats, prestige: number]
): EmbedBuilder => {
    const beforeStats: Stats = before[1];
    const afterStats: Stats = after[1];

    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(user.username)
        .setDescription(
            `**Path:** ${Paths.Pathless}\n**Limit Breaker ${before[2]}** ➟ **${after[2]}**`
        )
        .setColor(MAGENTA)
        .setAuthor({
            name: "Limitbreak!",
            iconURL: server.iconURL()
        })
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            {
                name: "Classes",
                value: "none",
                inline: false
            },
            {
                name: "Level",
                value: `${before[0]} ➟ **${after[0]}**`,
                inline: false
            },
            {
                name: "HP",
                value: `${beforeStats.health}${afterStats.health !== beforeStats.health ? ` ➟ **${afterStats.health}**` : ""}`,
                inline: true
            },
            {
                name: "GP",
                value: `${beforeStats.guard}${afterStats.guard !== beforeStats.guard ? ` ➟ **${afterStats.guard}**` : ""}`,
                inline: true
            },
            {
                name: "Speed",
                value: `${beforeStats.speed}${afterStats.speed !== beforeStats.speed ? ` ➟ **${afterStats.speed}**` : ""}`,
                inline: true
            },
            {
                name: "Strength",
                value: `${beforeStats.strength}${afterStats.strength !== beforeStats.strength ? ` ➟ **${afterStats.strength}**` : ""}`,
                inline: true
            },
            {
                name: "Defence",
                value: `${beforeStats.defence}${afterStats.defence !== beforeStats.defence ? ` ➟ **${afterStats.defence}**` : ""}`,
                inline: true
            },
            {
                name: "Dexterity",
                value: `${beforeStats.dexterity}${afterStats.dexterity !== beforeStats.dexterity ? ` ➟ **${afterStats.dexterity}**` : ""}`,
                inline: true
            },
            {
                name: "Magic",
                value: `${beforeStats.magic}${afterStats.magic !== beforeStats.magic ? ` ➟ **${afterStats.magic}**` : ""}`,
                inline: true
            },
            {
                name: "Resistance",
                value: `${beforeStats.resistance}${afterStats.resistance !== beforeStats.resistance ? ` ➟ **${afterStats.resistance}**` : ""}`,
                inline: true
            },
            {
                name: "Luck",
                value: `${beforeStats.luck}${afterStats.luck !== beforeStats.luck ? ` ➟ **${afterStats.luck}**` : ""}`,
                inline: true
            }
        );

    return embed;
};
