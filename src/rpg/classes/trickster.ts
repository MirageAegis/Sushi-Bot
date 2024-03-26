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
import { Class, Paths, RangerClasses } from "../types/class";

export const cls: Class<Paths.Ranger> = {
    path: Paths.Ranger,
    name: RangerClasses.Trickster,
    description: "A Ranger who specialises in disrupting enemies. Tricksters " +
                 "can apply various debuffs to enemies to soften them up",
    growths: {
        health: 0,
        guard: 0,
        strength: -10,
        magic: 0,
        speed: 10,
        defence: 0,
        resistance: 0,
        dexterity: 5,
        luck: 25
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unlock(player: Player): void {
        // Nothing further to unlock
        return;
    },
    wieldWeaponSkills: [],
    intrinsicSkills: []
};
