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

/* eslint-disable no-magic-numbers */

import { Attack } from "../../types/attack";
import { Skill, SkillTypes, IntrinsicSkills, AttackAugmentEffects } from "../../types/skill";
import { Unit } from "../../types/unit";

export const skill: Skill<SkillTypes.AttackAugment, true, AttackAugmentEffects.Multiplicative, true> = {
    name: IntrinsicSkills.Silencer,
    description: "Gain +20 CRIT in combat and a small chance to triple damage dealt on hit depending on dexterity",
    effect: AttackAugmentEffects.Multiplicative,
    intrinsic: true,
    wieldWeapon: false,
    boost: null,
    attack(unit: Unit, target: Unit, attack: Attack): [Attack, boolean] {
        const roll = Math.ceil(Math.random() * 100);
        if (roll > unit.stats.dexterity / 8) {
            attack.damage.multiply *= 3;
            attack.heal.multiply *= 3;
            attack.extraMessage += `${unit.name}'s [${IntrinsicSkills.Silencer}]\n`;
            return [attack, true];
        }
        return [attack, false];
    },
    defend: null,
    reorder: null,
    multiply: null
};
