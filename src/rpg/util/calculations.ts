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

import { Stats } from "../../schemas/player";
import { DamageTypes } from "../types/attack";
import { Unit } from "../types/unit";

export type Avoidance = {
    readonly physical: number;
    readonly magical: number;
};

// TODO: Implement battle calculations
export const calculateAttackSpeed = (
    damageType: DamageTypes.Physical | DamageTypes.Magical,
    weight: number,
    unit: Unit
): number => {
    return 0;
};

export const calculateAvoidance = (
    attackSpeed: number,
    unit: Unit
): Avoidance => {
    return {
        physical: 0,
        magical: 0
    };
};

export const calculateHitStat = (
    weaponHit: number,
    damageType: DamageTypes.Physical | DamageTypes.Magical,
    attacker: Unit
): number => {
    return 0;
};

export const calculateCritStat = (
    weaponCrit: number,
    attacker: Unit
): number => {
    return 0;
};

export const calculateCritAvoidance = (unit: Unit): number => {
    return 0;
};

export const calculateDamage = (
    damageType: DamageTypes,
    might: number,
    target: Unit
): number => {
    return 0;
};
