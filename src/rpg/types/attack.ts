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
    Heavy = "Heavy",

    /**
     * Attacks without follow ups will never attack more than once a turn.
     */
    Single = "Single"
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
 * The attack forecast for an interaction.
 * The values are the raw values used to determine the actual damage output.
 */
export type AttackForecast = {
    /**
     * The Unit who's performing the attack.
     */
    readonly attacker: Unit;

    /**
     * The might of an attack. Affects how much damage is dealt.
     */
    readonly might: number;

    /**
     * The number of attacks that will be performed in the interaction.
     * This excludes follow ups from attack speed difference.
     */
    readonly count: number;

    /**
     * The type of the attack. Dictates attack order and whether follow ups are possible.
     */
    readonly type: AttackTypes;

    /**
     * The attack speed of the attack.
     * 
     * The Unit with greater attack speed will attack first, unless they use a heavy attack.
     * 
     * The Unit will perform a follow up attack if their attack speed is greater than the
     * opposing Unit's attack speed by 5 or more.
     */
    readonly attackSpeed: number;

    /**
     * The hit stat used for the attack.
     */
    readonly hit: number;

    /**
     * The critical hit stat used for the attack.
     */
    readonly crit: number;

    /**
     * The avoidance stat used for the attack.
     */
    readonly avo: Avoidance;

    /**
     * The critical hit avoidance stat used for the attack.
     */
    readonly critAvo: number;

    /**
     * The attack effects applied to the attack.
     */
    readonly effects: readonly string[];
};

/**
 * The damage output for an interaction.
 */
export type Attack = {
    /**
     * The Unit who's performing the attack.
     */
    readonly attacker: Unit;

    /**
     * Whether the attack has been duplicated by a skill or not.
     */
    readonly duplicated: boolean;

    /**
     * The damage displayed in the attack forecast
     */
    readonly forecast: number;

    /**
     * The actual damage output, taking critical hits and skills into consideration.
     */
    readonly damage: number;

    /**
     * The amount of damage the Unit takes as a result of the interaction.
     */
    readonly recoil: number;

    /**
     * The amount of health the Unit recovers as a result of the interaction.
     */
    readonly heal: number;

    /**
     * The message displayed in the battle report.
     */
    readonly message: string;
};

/**
 * Represents a turn in a battle with all attacks in order.
 */
export type BattleTurn = Attack[];
