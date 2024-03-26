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

import path from "node:path";
import fs from "node:fs";
import { Stats } from "../../schemas/player";
import { Attack, AttackForecast, BattleTurn } from "./attack";
import { Unit } from "./unit";

/**
 * Skill types. Determines when a skill is activated.
 */
export enum SkillTypes {
    WieldWeapon = "Wield Weapon",
    StatModifier = "Stat Modifier",
    AttackAugment = "Attack Augment",
    DefenceAugment = "Defence Augment"
}

/**
 * Attack augment effects. Determines when an attack augment
 * is activated.
 */
export enum AttackAugmentEffects {
    AttackOrder = "Attack Order",
    DuplicativeNormal = "Duplicative (Normal)",
    DuplicativeArts = "Duplicative (Arts)",
    Multiplicative = "Multiplicative",
    Additive = "Additive",
    Status = "Status"
}

/**
 * Skills that allow players to wield certain weapon classes.
 */
export enum WieldWeaponSkills {
    WieldSwords = "Wield Swords",
    WieldAxes = "Wield Axes",
    WieldShields = "Wield Shields",
    WieldDaggers = "Wield Daggers",
    WieldBows = "Wield Bows",
    CastMagic = "Cast Magic",
    HolyArts = "Holy Arts",
    ArcaneArts = "Arcane Arts",
    Omnipotent = "Omnipotent"
}

/**
 * Skills tied to Paths and Classes.
 */
export enum IntrinsicSkills {
    SwordMastery = "Sword Mastery",
    Fortress = "Fortress",
    Silencer = "Silencer",
    Blessed = "Blessed",
    TippedArrows = "Tipped Arrows",
    PowerShot = "Power Shot",
    SixthSense = "Sixth Sense",
    Mounted = "Mounted",
    Encore = "Encore",
    Commander = "Commander"
}

/**
 * Skills unlocked through items or other means.
 */
export enum UnlockableSkills {
    AfterImage = "After Image",
    LastStand = "Last Stand",
    CullTheWeak = "Cull the Weak",
    Bravery = "Bravery",
    Patience = "Patience",
    Endurance = "Endurance",
    Resilience = "Resilience",
    Heroic = "Heroic",
    AgnisBlessing = "Agni's Blessing",
    ZephyrussBlessing = "Zephyrus's Blessing",
    JupitersBlessing = "Jupiter's Blessing",
    AmaterasusBlessing = "Amaterasu's Blessing",
    ThanatossBlessing = "Thanatos's Blessing"
}

export type SkillNames = WieldWeaponSkills |
    IntrinsicSkills |
    UnlockableSkills;

/**
 * A Skill that a player can unlock; be it an intrinsic Path- or Class Skill, or
 * by other means.
 * 
 * @template T the type of Skill this is
 * @template E the augment effect, if applicable
 * @template I whether the Skill is an intrinsic one or not
 */
export type Skill<
    T extends SkillTypes,
    E extends AttackAugmentEffects = null,
    I extends boolean = false
> = {
    /**
     * The Skill's name.
     */
    readonly name: E extends SkillTypes.WieldWeapon ? WieldWeaponSkills :
                   I extends true ? IntrinsicSkills :
                   UnlockableSkills;

    /**
     * The Skill's description.
     */
    readonly description: string;

    /**
     * The type of effect the skill has if it's an attack- or defence augment.
     * Determines when the skill is activated.
     */
    readonly effect: T extends SkillTypes.AttackAugment ?
                     E :
                     T extends SkillTypes.DefenceAugment ?
                     E :
                     null;

    /**
     * Whether the Skill is an intrinsic Path- or Class Skill or not.
     */
    readonly intrinsic: I;

    /**
     * Whether the skill is a wield weapon skill or not.
     */
    readonly wieldWeapon: T extends SkillTypes.WieldWeapon ?
                          true : false;

    /**
     * The use of a stat modifier skill.
     * `null` if not a stat modifier.
     * 
     * Takes a Stats object and returns a modified Stats object
     * 
     * @param stats the unit's Stats with potential modifiers
     * @returns the unit's Stats with this modifier applied
     */
    readonly boost: T extends SkillTypes.StatModifier ?
                    { (stats: Stats): Stats } :
                    null;

    /**
     * The use of an attack augment Skill.
     * `null` if not an attack augment.
     * 
     * Takes the unit's AttackForecast and returns a modified AttackForecast.
     * 
     * @param unit the unit who triggered the skill
     * @param attack an AttackForecast to be augmented
     * @returns the modified AttackForecast
     */
    readonly attack: T extends SkillTypes.AttackAugment ?
                     { (unit: Unit, attack: AttackForecast): AttackForecast } :
                     null;

    /**
     * The use of a defence augment Skill.
     * `null` if not a defence augment.
     * 
     * Takes the opponent's AttackForecast and returns a modified AttackForecast.
     * 
     * @param unit the unit who triggered the skill
     * @param attack an AttackForecast to be augmented
     * @returns the modified AttackForecast
     */
    readonly defend: T extends SkillTypes.DefenceAugment ?
                     { (unit: Unit, attack: AttackForecast): AttackForecast } :
                     null;

    /**
     * The use of an attack order augment skill.
     * `null` if not an attack order augment.
     * 
     * Takes a BattleTurn and modifies it.
     * 
     * @param unit the unit who triggered the skill
     * @param battleTurn the BattleTurn to be reorderd
     * @returns the reordered BattleTurn
     */
    readonly reorder: E extends AttackAugmentEffects.AttackOrder ?
                      { (unit: Unit, battleTurn: BattleTurn): BattleTurn } :
                      null;

    /**
     * The use of an attack duplication skill.
     * Duplication of normal attacks and Arts are separated.
     */
    readonly multiply: E extends AttackAugmentEffects.DuplicativeNormal |
                       AttackAugmentEffects.DuplicativeArts ?
                       { (attack: Attack): Attack[] } :
                       null;
};

const intrinsicSkills: Map<IntrinsicSkills, Skill<SkillTypes, AttackAugmentEffects, true>> = new Map();
const wieldWeaponSkills: Map<WieldWeaponSkills, Skill<SkillTypes.WieldWeapon, null, true>> = new Map();

{
    const intrinsicSkillsFolder: string = path.join(__dirname, "../skills/intrinsic");
    const intrinsicSkillFiles: string[] = fs.readdirSync(intrinsicSkillsFolder).filter(f => f.endsWith(".js"));

    // Load data from all intrinsic skills
    for (const file of intrinsicSkillFiles) {
        const skillPath: string = path.join(intrinsicSkillsFolder, file);
        const s: Skill<SkillTypes, AttackAugmentEffects, true> = require(skillPath).skill;

        const name: IntrinsicSkills = s.name;

        intrinsicSkills.set(name, s);
    }

    
    const wieldWeaponSkillsFolder: string = path.join(__dirname, "../skills/wield-weapon");
    const wieldWeaponSkillFiles: string[] = fs.readdirSync(wieldWeaponSkillsFolder).filter(f => f.endsWith(".js"));

    // Load data from all classes
    for (const file of wieldWeaponSkillFiles) {
        const skillPath: string = path.join(wieldWeaponSkillsFolder, file);
        const s: Skill<SkillTypes.WieldWeapon, null, true> = require(skillPath).skill;

        const name: WieldWeaponSkills = s.name;

        wieldWeaponSkills.set(name, s);
    }
}

/**
 * Gets all the non-wield-weapon intrinsic skills.
 * 
 * @returns a map with all the intrinsic skills
 */
export const getIntrinsicSkills = (): ReadonlyMap<IntrinsicSkills, Skill<SkillTypes, AttackAugmentEffects, true>> => {
    return intrinsicSkills;
};

export const intrinsicSkillNames: IntrinsicSkills[] = Object.values(IntrinsicSkills);

/**
 * Gets all the wield weapon skills.
 * 
 * @returns a map with all the wield weapon skills
 */
export const getWieldWeaponSkills = (): ReadonlyMap<WieldWeaponSkills, Skill<SkillTypes.WieldWeapon, null, true>> => {
    return wieldWeaponSkills;
};

export const wieldWeaponSkillNames: WieldWeaponSkills[] = Object.values(WieldWeaponSkills);
