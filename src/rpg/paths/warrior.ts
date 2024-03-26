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
import { Path, Paths } from "../types/class";
import { WieldWeaponSkills } from "../types/skill";
import { weapon as ironSword } from "../weapons/swords/iron-sword";
import { weapon as ironAxe } from "../weapons/axes/iron-axe";

export const path: Path = {
    name: Paths.Warrior,
    description: "The Path of the Warrior is one that blesses those who tread it " +
                 "with a strong physique fit for physical combat. This comes at the " +
                 "cost of being vulnerable to magical attacks",
    growths: {
        health: 75,
        guard: 15,
        strength: 50,
        magic: 10,
        speed: 40,
        defence: 40,
        resistance: 20,
        dexterity: 30,
        luck: 20
    },
    unlock(player: Player): void {
        // Unlock iron sword
        player.unlockWeapon(ironSword);
        // Unlock iron axe
        player.unlockWeapon(ironAxe);
    },
    wieldWeaponSkills: [
        WieldWeaponSkills.WieldSwords,
        WieldWeaponSkills.WieldAxes
    ],
    intrinsicSkills: []
};
