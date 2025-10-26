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

import { Avoidance } from "../util/calculations";
import { Effects } from "./effect";
import { Unit } from "./unit";

/**
 * The amount of attack speed a Unit must exceed its target to make a follow up attack.
 */
export const FOLLOW_UP_THRESHOLD: number = 5;

/**
 * The type of attacks that a Unit can perform.
 */
export enum AttackTypes {
    /**
     * Normal attacks will follow up after the opponent has made their first attack
     * if the opponent also has Normal attacks.
     */
    Normal = "Normal",

    /**
     * Priority attacks will always follow up immediately after the first attack that
     * a Unit makes.
     */
    Priority = "Priority",

    /**
     * Heavy attacks are always placed after Normal attacks.
     */
    Heavy = "Heavy"
}

/**
 * The different damage that can be dealt.
 */
export enum DamageTypes {
    /**
     * Physical attacks targets a Unit's defence stat.
     */
    Physical = "Physical",

    /**
     * Magical attacks target a Unit's resistance stat.
     */
    Magical = "Magical",

    /**
     * True attacks target the lower of a Unit's defence- and resistance stat.
     */
    True = "True"
}

/**
 * Damage with its augments.
 */
export type Damage = {
    /**
     * The base damage to multiply and add to.
     */
    base: number;

    /**
     * Number to multiply the damage or healing by, comes first.
     */
    multiply: number;

    /**
     * Number to add to the damage or healing, comes last.
     */
    add: number;
};

export const EMPTY_DAMAGE: Damage = { base: 0, multiply: 0, add: 0 };

/**
 * The attack forecast for an interaction.
 * The values are the raw values used to determine the actual damage output.
 */
export type AttackForecast = {
    /**
     * The Unit who's performing the attack.
     */
    attacker: Unit;

    /**
     * The might of an attack. Affects how much damage is dealt.
     */
    might: number;

    /**
     * The number of attacks that will be performed in the interaction.
     * This excludes follow ups from attack speed difference.
     */
    count: number;

    /**
     * The type of the attack. Dictates attack order and whether follow ups are possible.
     */
    type: AttackTypes;


    /**
     * Whether the attacker can perform follow-up attacks.
     */
    canFollowUp: boolean;

    /**
     * The type of damage of the attack. Determines whether Defence or Resistance will be used.
     */
    dmgType: DamageTypes;

    /**
     * The attack speed of the attack.
     * 
     * The Unit with greater attack speed will attack first, unless they use a heavy attack.
     * 
     * The Unit will perform a follow up attack if their attack speed is greater than the
     * opposing Unit's attack speed by 5 or more.
     */
    attackSpeed: number;

    /**
     * The hit stat used for the attack.
     */
    hit: number;

    /**
     * The critical hit stat used for the attack.
     */
    crit: number;

    /**
     * The avoidance stat used for the attack.
     */
    avo: Avoidance;

    /**
     * The critical hit avoidance stat used for the attack.
     */
    critAvo: number;

    /**
     * The attack effects applied to all the attacks.
     */
    effects: Effects[];

    /**
     * Calculate recoil damage for all attacks derived from the attack forecast, if applicable.
     */
    recoil: Damage;

    /**
     * Calculate heal on hit for all attacks derived from the attack forecast, if applicable.
     */
    heal: Damage;
};

/**
 * The damage output for an interaction.
 */
export type Attack = {
    /**
     * The Unit who's performing the attack.
     */
    attacker: Unit;

    /**
     * Whether the attack has been duplicated by a skill or not.
     */
    duplicated: boolean;

    /**
     * The might value used for the attack.
     */
    might: number;

    /**
     * The protection value used by the target.
     */
    protection: number;

    /**
     * The damage displayed in the attack forecast.
     */
    forecast: number;

    /**
     * The actual damage output, taking critical hits and skills into consideration.
     */
    damage: Damage;

    /**
     * The amount of damage the Unit takes as a result of the interaction.
     */
    recoil: Damage;

    /**
     * The amount of health the Unit recovers as a result of the interaction.
     */
    heal: Damage;

    /**
     * Effects applied by this attack.
     */
    effects: Effects[];

    /**
     * A message displayed before the actual message, used for skill activations.
     * Should be empty by default.
     */
    extraMessage: string;

    /**
     * The message displayed in the battle report.
     */
    message: string;
};

/**
 * Represents a turn in a battle with all attacks in order.
 */
export type BattleTurn = {
    message: string,
    attacks: Attack[]
};
