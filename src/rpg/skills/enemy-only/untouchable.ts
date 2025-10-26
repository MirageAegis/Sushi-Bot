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

import { BattleTurn } from "../../types/attack";
import { Skill, SkillTypes, AttackAugmentEffects, EnemyOnlySkills } from "../../types/skill";
import { Unit } from "../../types/unit";

export const skill: Skill<SkillTypes.AttackAugment, false, AttackAugmentEffects.AttackOrder, true> = {
    name: EnemyOnlySkills.Untouchable,
    description: "Chance to negate incoming attacks",
    effect: AttackAugmentEffects.AttackOrder,
    intrinsic: true,
    wieldWeapon: false,
    boost: null,
    attack: null,
    defend: null,
    reorder(unit: Unit, battleTurn: BattleTurn): [BattleTurn, boolean] {
        const roll = Math.ceil(Math.random() * 100);

        // Flat 15% chance to activate
        if (roll <= 15) {
            battleTurn.message += `__***${unit.name}'s [${EnemyOnlySkills.Untouchable}]!!***__\n`;
            battleTurn.attacks.forEach(a => {
                if (a.attacker === unit) {
                    return;
                }

                const dealDmg: boolean = a.damage.base > 0 || a.damage.add > 0;
                a.damage = {
                    base: 0,
                    multiply: 0,
                    add: 0
                };

                // Negate healing if the attack would've dealt damage
                if (dealDmg) {
                    a.heal = {
                        base: 0,
                        multiply: 0,
                        add: 0
                    };
                }
            });
            return [battleTurn, true];
        }
        return [battleTurn, false];
    },
    multiply: null
};
