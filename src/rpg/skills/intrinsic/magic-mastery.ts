/* 
 * MIT License
 * 
 * Copyright (c) 2024-present Mirage Aegis
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

import { Stats } from "../../../schemas/player";
import { Skill, SkillTypes, IntrinsicSkills } from "../../types/skill";
import { Unit } from "../../types/unit";
import { WeaponClasses } from "../../types/weapon";

export const skill: Skill<SkillTypes.StatModifier, null, true> = {
    name: IntrinsicSkills.MagicMastery,
    description: "Hastens spell incantations",
    effect: null,
    intrinsic: true,
    wieldWeapon: false,
    boost(unit: Unit, stats: Stats): Stats {
        // Add 5 dexterity if unit is wielding a staff (casting magic)
        if (unit.weapon.class === WeaponClasses.Staff) {
            return {
                health: stats.health,
                guard: stats.guard,
                strength: stats.strength,
                magic: stats.magic,
                speed: stats.speed,
                defence: stats.defence,
                resistance: stats.resistance,
                // eslint-disable-next-line no-magic-numbers
                dexterity: stats.dexterity + 5,
                luck: stats.luck
            };
        }
        
        return stats;
    },
    attack: null,
    defend: null,
    reorder: null,
    multiply: null
};
