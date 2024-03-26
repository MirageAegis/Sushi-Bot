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
import { AttackForecast, AttackTypes, DamageTypes } from "./attack";
import { WieldWeaponSkills } from "./skill";
import { Unit } from "./unit";

export enum WeaponClasses {
    Sword = "Sword",
    Axe = "Axe",
    Shield = "Shield",
    Dagger = "Dagger",
    Staff = "Staff",
    Bow = "Bow"
}

export enum Swords {
    Wooden = "Wooden Sword",
    Iron = "Iron Sword"
}

export enum Axes {
    Iron = "Iron Axe"
}

export enum Shields {
    Iron = "Iron Shield"
}

export enum Daggers {
    Iron = "Iron Dagger"
}

export enum Staves {
    Oak = "Oak Staff"
}

export enum Bows {
    Short = "Short Bow"
}

export type WeaponNames = Swords |
    Axes |
    Shields |
    Daggers |
    Staves |
    Bows;

/**
 * A Weapon that a player can obtain; be it through Path- or Class unlocks, or
 * other means.
 * 
 * @template T the weapon's class
 */
export type Weapon<T extends WeaponClasses> = {
    /**
     * The weapon's name.
     */
    readonly name: T extends WeaponClasses.Sword ? Swords :
                   T extends WeaponClasses.Axe ? Axes :
                   T extends WeaponClasses.Shield ? Shields :
                   T extends WeaponClasses.Dagger ? Daggers :
                   T extends WeaponClasses.Staff ? Staves :
                   T extends WeaponClasses.Bow ? Bows :
                   never;

    /**
     * The weapon's description.
     */
    readonly description: string;

    /**
     * Executed every time a player unlocks a weapon.
     * May include Arts and/or Spells.
     */
    readonly unlock: { (player: Player): void }

    /**
     * The weapon's class.
     */
    readonly class: T;

    /**
     * The weapon's attack type.
     * Affects the attack order.
     */
    readonly type: AttackTypes;

    /**
     * The number of attacks a single use yields.
     * Follow ups double the amount of attacks.
     */
    readonly count: number;

    /**
     * The weapon's damage type.
     * Determines whether attacks target defence or resistance.
     */
    readonly damage: DamageTypes.Physical | DamageTypes.Magical;

    /**
     * The weapon's might.
     * Doubles as Heal for healing Spells, and Def/Res for Shields
     */
    readonly might: number;

    /**
     * The weapon's weight.
     * Weighs down the user.
     */
    readonly weight: number;

    /**
     * The weapon's base HIT stat.
     */
    readonly hit: number;

    /**
     * The weapon's base CRIT stat.
     */
    readonly crit: number;

    /**
     * The effects that the weapon has.
     */
    readonly effects: string[];

    /**
     * Lets a Unit use the weapon.
     * 
     * @param attacker the Unit who's using the weapon
     * @returns the base attack forecast for the attack(s) performed
     *          by the unit
     */
    readonly use: { (attacker: Unit): AttackForecast };
};

/**
 * Gets all the WeaponClasses that a Player can use depending on
 * which skills they have.
 * 
 * @param skills the wield weapon skills
 * @returns a set with all WeaponClasses available to the set of skills
 */
export const getWeaponClasses = (
    ...skills: WieldWeaponSkills[]
): ReadonlySet<WeaponClasses> => {
    const weaponClasses: Set<WeaponClasses> = new Set();
    for (const skill of skills) {
        switch (skill) {
            case WieldWeaponSkills.WieldSwords:
                weaponClasses.add(WeaponClasses.Sword);
                break;
            case WieldWeaponSkills.WieldAxes:
                weaponClasses.add(WeaponClasses.Axe);
                break;
            case WieldWeaponSkills.WieldShields:
                weaponClasses.add(WeaponClasses.Shield);
                break;
            case WieldWeaponSkills.WieldDaggers:
                weaponClasses.add(WeaponClasses.Dagger);
                break;
            case WieldWeaponSkills.WieldBows:
                weaponClasses.add(WeaponClasses.Bow);
                break;
            case WieldWeaponSkills.CastMagic:
                weaponClasses.add(WeaponClasses.Staff);
                break;
            case WieldWeaponSkills.Omnipotent:
                weaponClasses.add(WeaponClasses.Sword);
                weaponClasses.add(WeaponClasses.Axe);
                weaponClasses.add(WeaponClasses.Shield);
                weaponClasses.add(WeaponClasses.Dagger);
                weaponClasses.add(WeaponClasses.Bow);
                weaponClasses.add(WeaponClasses.Staff);
                return weaponClasses;
        }
    }
    return weaponClasses;
};
