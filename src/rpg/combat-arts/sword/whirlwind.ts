/* eslint-disable no-magic-numbers */
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

import { CombatArt, SwordArts } from "../../types/art";
import { AttackForecast, AttackTypes, Damage } from "../../types/attack";
import { Effects } from "../../types/effect";
import { Unit } from "../../types/unit";
import { WeaponClasses } from "../../types/weapon";
import { augmentMight, getProtectionValue } from "../../util/calculations";

// Combat art fields are declared before the art itself so that the fields can be used in 
// the use method

const weaponClass: WeaponClasses = WeaponClasses.Sword;
const name: SwordArts = SwordArts.Whirlwind;
const description: string = "A flurry of attacks that are hard to avoid";
const type: AttackTypes = AttackTypes.Priority;
const might: Damage = {
    base: 0,
    multiply: 0.5,
    add: 0
};
const hit: number = 15;
const crit: number = 5;
const cost: number = 5;
const attackCount: number = 3;
const effects: Effects[] = [];
const use = (unit: Unit, target: Unit, forecast: AttackForecast): AttackForecast => {
    /* Unused */ unit;

    const targetProtection = getProtectionValue(target, forecast.dmgType);

    // Combat arts are always single type attacks, i.e., no follow-ups
    forecast.type = type;
    forecast.hit += hit;
    forecast.crit += crit;
    forecast.recoil = {
        base: cost,
        multiply: 1,
        add: 0
    };
    forecast.count = attackCount;

    // Deal at least 1 damage
    if (forecast.might <= targetProtection) {
        forecast.might = targetProtection + 1;
        return forecast;
    }

    forecast.might = augmentMight(forecast.might, targetProtection, might);
    return forecast;
};

export const art: CombatArt<WeaponClasses.Sword> = {
    weaponClass,
    name,
    description,
    type,
    might,
    hit,
    crit,
    cost,
    attackCount,
    effects,
    use,
};
