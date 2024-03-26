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
import { weapon as oakStaff } from "../weapons/staves/oak-staff";


export const path: Path = {
    name: Paths.Caster,
    description: "The Path of the Caster is one that blesses those who tread it " +
                 "with a great magical prowess fit for magical combat. This comes at the " +
                 "cost of being vulnerable to physical attacks",
    growths: {
        health: 60,
        guard: 15,
        strength: 10,
        magic: 55,
        speed: 30,
        defence: 20,
        resistance: 50,
        dexterity: 25,
        luck: 35
    },
    unlock(player: Player): void {
        // Unlock oak staff
        player.unlockWeapon(oakStaff);
    },
    wieldWeaponSkills: [
        WieldWeaponSkills.CastMagic
    ],
    intrinsicSkills: []
};
