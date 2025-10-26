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

import { AttackForecast, AttackTypes, Damage } from "./attack";
import { Effects } from "./effect";
import { Unit } from "./unit";
import { WeaponClasses } from "./weapon";

export enum SwordArts {
    Whirlwind = "Whirlwind",
    Zornhau = "Zornhau"
}
export enum AxeArts {
    HeavensFall = "Heaven's Fall"
}
export enum ShieldArts {
    Origin = "Origin"
}
export enum DaggerArts { }
export enum BowArts {
    VioletArc = "Violet Arc",
    Starfall = "Starfall"
}

export type CombatArt<C extends WeaponClasses> = {
    /**
     * The weapon class that the combat art is tied to.
     */
    readonly weaponClass: C;

    /**
     * The combat art's name.
     */
    readonly name: C extends WeaponClasses.Sword ? SwordArts :
    C extends WeaponClasses.Axe ? AxeArts :
    C extends WeaponClasses.Shield ? ShieldArts :
    C extends WeaponClasses.Dagger ? DaggerArts :
    C extends WeaponClasses.Bow ? BowArts :
    never;

    /**
     * The combat art's description.
     */
    readonly description: string;

    /**
     * The type of attack that the combat art will result in.
     */
    type: AttackTypes;

    /**
     * Might modifier applied by the combat art.
     */
    readonly might: Damage;

    /**
     * Hit modifier applied by the combat art.
     */
    readonly hit: number;

    /**
     * Crit modifier applied by the combat art.
     */
    readonly crit: number;

    /**
     * The HP cost of activating the combat art.
     */
    readonly cost: number;

    /**
     * The number of attacks this combat art yields.
     */
    readonly attackCount: number;

    /**
     * The effects applied by this combat art.
     */
    readonly effects: Effects[];

    /**
     * Lets a Unit use the combat art.
     * 
     * @param unit the Unit using the combat art
     * @param target the target of the combat art
     * @param forecast the underlying attack forecast of the combat art
     * @returns the resulting attacks from using the combat art
     */
    readonly use: { (unit: Unit, target: Unit, forecast: AttackForecast): AttackForecast }
};
