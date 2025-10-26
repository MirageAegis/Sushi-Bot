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
/* eslint-disable no-magic-numbers */

import { Damage, DamageTypes } from "../types/attack";
import { Unit } from "../types/unit";

export type Avoidance = {
    readonly physical: number;
    readonly magical: number;
};

export const calculateAttackSpeed = (
    damageType: DamageTypes.Physical | DamageTypes.Magical,
    weight: number,
    unit: Unit
): number => {
    let attackSpeed: number;
    switch (damageType) {
        case DamageTypes.Physical:
            // spd - max(wt - floor(str / 5), 0)
            attackSpeed = unit.stats.speed;
            attackSpeed -= Math.max(weight - Math.floor(unit.stats.strength / 5), 0);
            break;
        case DamageTypes.Magical:
            // dex - max(wt - floor(mag / 5), 0)
            attackSpeed = unit.stats.dexterity;
            attackSpeed -= Math.max(weight - Math.floor(unit.stats.magic / 5), 0);
            break;
    }

    attackSpeed = Math.max(attackSpeed, 0);
    return attackSpeed;
};

export const calculateAvoidance = (
    attackSpeed: number,
    unit: Unit
): Avoidance => {
    return {
        physical: attackSpeed,
        magical: unit.stats.luck
    };
};

export const calculateHitStat = (
    weaponHit: number,
    attacker: Unit
): number => {
    // weapon.hit + dex + lck / 2
    let hit: number = weaponHit;
    hit += attacker.stats.dexterity;
    hit += Math.floor(attacker.stats.luck / 2);

    return hit;
};

export const calculateCritStat = (
    weaponCrit: number,
    attacker: Unit
): number => {
    // weapon.crit + (dex + lck) / 2
    let crit: number = weaponCrit;
    crit += Math.floor((attacker.stats.dexterity + attacker.stats.luck) / 2);

    return crit;
};

export const calculateCritAvoidance = (unit: Unit): number => {
    return unit.stats.luck;
};

export const getProtectionValue = (unit: Unit, dmgType: DamageTypes): number => {
    switch (dmgType) {
        case DamageTypes.Physical:
            return unit.combatStats.defence;
        case DamageTypes.Magical:
            return unit.combatStats.resistance;
        case DamageTypes.True:
            return Math.min(
                unit.combatStats.defence,
                unit.combatStats.resistance
            );
    }
};

/**
 * Augments a raw might value so that the damage output of the might fulfill the augments.
 * 
 * @param rawMight the raw might value from an attack forecast
 * @param targetProtection the target's protection value
 * @param augments the augments to fulfill in the final might value
 * @returns the augmented might value
 */
export const augmentMight = (rawMight: number, targetProtection: number, augments: Damage): number => {
    return targetProtection + (rawMight - targetProtection + augments.base) * augments.multiply + augments.add;
};

/**
 * Gets a unit's protection value and avoidance value depending on what type
 * of damage they're being attacked by.
 * 
 * @param unit the unit whose protection and avoidance to get
 * @param unitAvo the unit's avoidance values
 * @param dmgType the damage type being used
 * @returns the protection and avoidance to use for the given damage type
 */
export const getProtectionAndAvo = (unit: Unit, unitAvo: Avoidance, dmgType: DamageTypes): [prt: number, avo: number] => {
    let prt: number;
    let avo: number;
    switch (dmgType) {
        case DamageTypes.Physical:
            prt = unit.combatStats.defence;
            avo = unitAvo.physical;
            break;
        case DamageTypes.Magical:
            prt = unit.combatStats.resistance;
            avo = unitAvo.magical;
            break;
        case DamageTypes.True:
            prt = Math.min(
                unit.combatStats.defence,
                unit.combatStats.resistance
            );
            avo = Math.min(
                unitAvo.physical,
                unitAvo.magical,
            );
            break;
    }

    return [prt, avo];
};