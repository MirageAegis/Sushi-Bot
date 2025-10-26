/* 
 * MIT License
 * 
 * Copyright (c) 2025-present Mirage Aegis
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

import { AttackForecast, AttackTypes, Damage } from "./attack";
import { Effects } from "./effect";
import { Unit } from "./unit";

export enum SpellTypes {
    Holy = "Holy",
    Black = "Black",
    Dark = "Dark"
}

// Black magic

export enum NonElementalSpells {
    Splash = "Splash",
    SecretOfTheWorld = "Secret of the World"
}

export enum FireSpells {
    Flare = "Flare",
    Blaze = "Blaze",
    Inferno = "Inferno",
    Agni = "Agni"
}

export enum WindSpells {
    Gust = "Gust",
    Galewind = "Galewind",
    Tempest = "Tempest",
    Zephyrus = "Zephyrus"
}

export enum LightningSpells {
    Spark = "Spark",
    Surge = "Surge",
    Lightning = "Lightning",
    Jupiter = "Jupiter"
}

export type BlackSpells = NonElementalSpells | FireSpells | WindSpells | LightningSpells;

// Holy magic

export enum HealSpells {
    HealSoothe = "Heal: Soothe",
    HealMend = "Heal: Mend",
    HealRestore = "Heal: Restore"
}

export enum WhiteSpells {
    Sol = "Sol",
    Amaterasu = "Amaterasu"
}

export enum EnhanceSpells {
    EnhanceEyesight = "Enhance: Eyesight",
    EnhanceFinesse = "Enhance: Finesse",
    EnhancePower = "Enhance: Power",
    EnhanceEnchantment = "Enhance: Enchantment",
    EnhanceProtection = "Enhance: Protection",
    EnhanceWard = "Enhance: Ward"
}

export type HolySpells = HealSpells | WhiteSpells | EnhanceSpells;

// Dark magic

export enum ArcaneSpells {
    Force = "Force Γ",
    Gravity = "Gravity Π",
    Chronos = "Chronos Δ",
    Thanatos = "Thanatos Σ"
}

export enum ForbiddenSpells {
    Petrify = "Petrify Ψ",
    Blight = "Blight Ξ",
    Erode = "Erode Χ",
    Blind = "Blind Θ"
}

export type DarkSpells = ArcaneSpells | ForbiddenSpells;

export type Spell<T extends SpellTypes> = {
    /**
     * The type of spell, usable depending on skills.
     */
    readonly spellType: T;

    /**
     * The spell's name.
     */
    readonly name: T extends SpellTypes.Holy ? HolySpells :
    T extends SpellTypes.Black ? BlackSpells :
    T extends SpellTypes.Dark ? DarkSpells :
    never;

    /**
     * The spell's description.
     */
    readonly description: string;

    /**
     * The type of attack that the spell will result in.
     */
    type: AttackTypes;

    /**
     * Might modifier applied by the spell.
     */
    readonly might: Damage;

    /**
     * Hit modifier applied by the spell.
     */
    readonly hit: number;

    /**
     * Crit modifier applied by the spell.
     */
    readonly crit: number;

    /**
     * The HP cost of activating the spell.
     */
    readonly cost: number;

    /**
     * The number of attacks this spell yields.
     */
    readonly attackCount: number;

    /**
     * The effects applied by this spell.
     */
    readonly effects: Effects[];

    /**
     * Lets a Unit use the spell.
     * 
     * @param unit the Unit using the spell
     * @param target the target of the spell
     * @param forecast the underlying attack forecast of the spell
     * @returns the resulting attacks from using the spell
     */
    readonly use: { (unit: Unit, target: Unit, forecast: AttackForecast): AttackForecast }
};
