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

import { Snowflake } from "discord.js";
import { Stats } from "../../schemas/player";
import { Skill, SkillTypes } from "./skill";
import { AttackForecast, DamageTypes } from "./attack";
import { Weapon, WeaponClasses } from "./weapon";
import { calculateAttackSpeed } from "../util/calculations";

export type CombatStats = {
    readonly maxHealth: number;
    readonly health: number;
    readonly damageType: DamageTypes;
    readonly might: number;
    readonly defence: number;
    readonly resistance: number;
};

export class Unit {
    private _id: Snowflake;
    public readonly name: string;
    private _stats: Stats;
    private _health: number;
    public readonly weapon: Weapon<WeaponClasses>;
    public readonly skills: readonly Skill<SkillTypes>[];
    public readonly arts: readonly string[];
    public readonly buffs: Stats;
    private _modifiers: Stats;

    public constructor(data: {
        id: Snowflake,
        name: string,
        stats: Stats,
        weapon: Weapon<WeaponClasses>,
        skills: Skill<SkillTypes>[],
        arts: string[],
    }) {
        this._id = data.id;
        this.name = data.name;
        this._stats = data.stats;
        this.weapon = data.weapon;
        this.skills = data.skills;
        this.arts = data.arts;

        const modifierSkills: Skill<SkillTypes.StatModifier>[] =
            this.skills.filter(
                s => s.boost
            ) as Skill<SkillTypes.StatModifier>[];

        let modifiers: Stats = {
            health: 0,
            guard: 0,
            strength: 0,
            magic: 0,
            speed: 0,
            defence: 0,
            resistance: 0,
            dexterity: 0,
            luck: 0
        };
        for (const modifier of modifierSkills) {
            modifiers = modifier.boost(this, modifiers);
        }

        this._modifiers = modifiers;
        this._health = this.stats.health + this._modifiers.health;
    }

    public attack(): AttackForecast {
        return this.weapon.use(this);
    }

    public get stats(): Stats {
        return {
            health: this._stats.health + this._modifiers.health,
            guard: this._stats.guard + this._modifiers.guard,
            strength: this._stats.strength + this._modifiers.strength,
            magic: this._stats.magic + this._modifiers.magic,
            speed: this._stats.speed + this._modifiers.speed,
            defence: this._stats.defence + this._modifiers.defence,
            resistance: this._stats.resistance + this._modifiers.resistance,
            dexterity: this._stats.dexterity + this._modifiers.dexterity,
            luck: this._stats.luck + this._modifiers.luck
        };
    }

    public get health(): number {
        return this._health;
    }

    public get combatStats(): CombatStats {
        return {
            maxHealth: this.stats.health + this._modifiers.health,
            health: this.health,
            damageType: this.weapon.damage,
            might: this.weapon.might +
                   (this.weapon.damage === DamageTypes.Physical ? this.stats.strength :
                    this.stats.resistance),
            defence: this.stats.defence,
            resistance: this.stats.resistance
        };
    }

    public get attackSpeed(): number {
        return calculateAttackSpeed(this.weapon.damage, this.weapon.weight, this);
    }
}
