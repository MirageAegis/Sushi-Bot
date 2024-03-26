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
import { CasterClasses, Class, Paths } from "../types/class";
import { WieldWeaponSkills } from "../types/skill";

export const cls: Class<Paths.Caster> = {
    path: Paths.Caster,
    name: CasterClasses.Priest,
    description: "A Caster who specialises in support spells. Priests " +
                 "wield Holy Magic which can heal and buff allies",
    growths: {
        health: 0,
        guard: 0,
        strength: 0,
        magic: 10,
        speed: 0,
        defence: -10,
        resistance: 30,
        dexterity: 0,
        luck: 0
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unlock(player: Player): void {
        // Nothing further to unlock
        return;
    },
    wieldWeaponSkills: [
        WieldWeaponSkills.HolyArts
    ],
    intrinsicSkills: []
};
