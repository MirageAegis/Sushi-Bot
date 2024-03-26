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

import { Player } from "../../../schemas/player";
import { AttackForecast, AttackTypes, DamageTypes } from "../../types/attack";
import { Unit } from "../../types/unit";
import { Axes, Weapon, WeaponClasses } from "../../types/weapon";
import {
    calculateAttackSpeed, calculateAvoidance, calculateCritAvoidance, calculateCritStat,
    calculateHitStat
} from "../../util/calculations";

export const weapon: Weapon<WeaponClasses.Axe> = {
    name: Axes.Iron,
    description: "An iron axe. This axe is a standard for every new warrior",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unlock(player: Player): void {
        // Nothing further to unlock
        return;
    },
    class: WeaponClasses.Axe,
    type: AttackTypes.Normal,
    count: 1,
    damage: DamageTypes.Physical,
    might: 4,
    weight: 3,
    hit: 85,
    crit: 0,
    effects: [],
    use(attacker: Unit): AttackForecast {
        const attackSpeed: number = calculateAttackSpeed(this.damage, this.weight, attacker);
        return {
            attacker: attacker,
            might: attacker.stats.strength + this.might,
            count: this.count,
            type: this.type,
            attackSpeed: attackSpeed,
            hit: calculateHitStat(this.hit, this.damage, attacker),
            crit: calculateCritStat(this.crit, attacker),
            avo: calculateAvoidance(attackSpeed, attacker),
            critAvo: calculateCritAvoidance(attacker),
            effects: this.effects
        };
    }
};
