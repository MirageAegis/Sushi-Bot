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

import { Player } from "../../schemas/player";
import { Class, Paths, WarriorClasses } from "../types/class";
import { WieldWeaponSkills } from "../types/skill";
import { weapon as ironShield } from "../weapons/shields/iron-shield";

export const cls: Class<Paths.Warrior> = {
    path: Paths.Warrior,
    name: WarriorClasses.Guardian,
    description: "A Warrior who specialises in defending their allies. Guardians " +
                 "are stoic knights that can take many hits before falling",
    growths: {
        health: 15,
        guard: 10,
        strength: 15,
        magic: 0,
        speed: -30,
        defence: 30,
        resistance: -10,
        dexterity: 0,
        luck: 0
    },
    unlock(player: Player): void {
        // Unlock iron shield
        player.unlockWeapon(ironShield);
    },
    wieldWeaponSkills: [
        WieldWeaponSkills.WieldShields
    ],
    intrinsicSkills: []
};
