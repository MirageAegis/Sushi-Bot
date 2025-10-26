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
import { Attack, BattleTurn } from "./attack";
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
    Duplicative = "Duplicative",
    Multiplicative = "Multiplicative",
    Additive = "Additive",
    Status = "Status"
}

export enum DefenceAugmentEffects {
    Multiplicative = "Multiplicative",
    Additive = "Additive",
    Status = "Status"
}

/**
 * Skills that allow players to wield certain weapon classes.
 */
export enum WieldWeaponSkills {
    WieldSwords = "Wield Swords",  // Pathless, Warrior
    WieldAxes = "Wield Axes",  // Warrior
    WieldShields = "Wield Shields",  // Guardian
    WieldDaggers = "Wield Daggers",  // Assassin
    WieldBows = "Wield Bows",  // Ranger
    CastMagic = "Cast Magic",  // Caster
    HolyArts = "Holy Arts",  // Priest
    ArcaneArts = "Arcane Arts",  // Arcanist
    Omnipotent = "Omnipotent"  // Arbiter
}

/**
 * Skills tied to Paths and Classes.
 */
export enum IntrinsicSkills {
    SwordMastery = "Sword Mastery",  // Swordmaster
    MagicMastery = "Magic Mastery",  // Sage
    Fortress = "Fortress",  // Guardian
    Silencer = "Silencer",  // Assassin
    Blessed = "Blessed",  // Priest
    TippedArrows = "Tipped Arrows",  // Trickster
    PowerShot = "Power Shot",  // Sniper
    SixthSense = "Sixth Sense",  // Adventurer
    Mounted = "Mounted",  // Cavalier
    Encore = "Encore",  // Idol
    Commander = "Commander"  // Lord
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
    AgnisFlame = "Agni's Flame",
    ZephyrussBreeze = "Zephyrus's Breeze",
    JupitersSpark = "Jupiter's Spark",
    AmaterasusBlessing = "Amaterasu's Blessing",
    ThanatossHex = "Thanatos's Hex"
}

/**
 * Skills that only enemies can have.
 */
export enum EnemyOnlySkills {
    Untouchable = "Untouchable"
}

export type SkillNames = WieldWeaponSkills |
    IntrinsicSkills |
    UnlockableSkills;

/**
 * A Skill that a player can unlock; be it an intrinsic Path- or Class Skill, or
 * by other means.
 * 
 * @template T the type of Skill this is
 * @template Player whether players can have the skill
 * @template E the augment effect, if applicable
 * @template I whether the Skill is an intrinsic one or not
 */
export type Skill<
    T extends SkillTypes,
    Player extends boolean = true,
    E extends (
        T extends SkillTypes.AttackAugment ? AttackAugmentEffects :
        T extends SkillTypes.DefenceAugment ? DefenceAugmentEffects :
        null
    ) = null,
    I extends boolean = false
> = {
    /**
     * The Skill's name.
     */
    readonly name: Player extends false ? EnemyOnlySkills :
    T extends SkillTypes.WieldWeapon ? WieldWeaponSkills :
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
    readonly effect: E;

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
     * @param unit the unit with potential stat modifiers
     * @param stats the unit's stat modifiers
     * @returns the unit's Stats with this modifier applied
     */
    readonly boost: T extends SkillTypes.StatModifier ?
    { (unit: Unit, stats: Stats): Stats } :
    null;

    /**
     * The use of an attack augment Skill.
     * `null` if not an attack augment.
     * Should also be null if the augment is a reorder
     * 
     * Takes the unit's Attack and returns a modified Attack.
     * 
     * @param unit the unit who triggered the skill
     * @param attack the Attack to be augmented
     * @param target the attack's target
     * @returns the modified Attack and whether it was modified or not
     */
    readonly attack: E extends AttackAugmentEffects.AttackOrder ? null :  // AttackOrder uses reorder
    T extends SkillTypes.AttackAugment ?
    { (unit: Unit, target: Unit, attack: Attack): [Attack, boolean] } :
    null;

    /**
     * The use of a defence augment Skill.
     * `null` if not a defence augment.
     * 
     * Takes the opponent's Attack and returns a modified Attack.
     * 
     * @param unit the unit who triggered the skill
     * @param attack the Attack to be augmented
     * @param attacker the attacker
     * @returns the modified Attack and whether it was modified or not
     */
    readonly defend: T extends SkillTypes.DefenceAugment ?
    { (unit: Unit, attacker: Unit, attack: Attack): [Attack, boolean] } :
    null;

    /**
     * The use of an attack order augment skill.
     * `null` if not an attack order augment.
     * 
     * Takes a BattleTurn and modifies it.
     * 
     * @param unit the unit who triggered the skill
     * @param battleTurn the BattleTurn to be reorderd
     * @returns the reordered BattleTurn and whether it was actually reordered
     */
    readonly reorder: E extends AttackAugmentEffects.AttackOrder ?
    { (unit: Unit, battleTurn: BattleTurn): [BattleTurn, boolean] } :
    null;

    /**
     * The use of an attack duplication skill.
     * `null` if not an attack duplication skill
     * 
     * Takes the unit's Attack and returns an array of modified Attack.
     * 
     * @param unit the unit who triggered the skill
     * @param attack an Attack to be augmented
     * @returns the modified Attacks and whether it was modified or not
     */
    readonly multiply: E extends AttackAugmentEffects.Duplicative ?
    { (attack: Attack): [Attack[], boolean] } :
    null;
};

const intrinsicSkills: Map<IntrinsicSkills, Skill<SkillTypes, true, AttackAugmentEffects, true>> = new Map();
const wieldWeaponSkills: Map<WieldWeaponSkills, Skill<SkillTypes.WieldWeapon, true, null, true>> = new Map();

{
    const intrinsicSkillsFolder: string = path.join(__dirname, "../skills/intrinsic");
    const intrinsicSkillFiles: string[] = fs.readdirSync(intrinsicSkillsFolder).filter(f => f.endsWith(".js"));

    // Load data from all intrinsic skills
    for (const file of intrinsicSkillFiles) {
        const skillPath: string = path.join(intrinsicSkillsFolder, file);
        const s: Skill<SkillTypes, true, AttackAugmentEffects, true> = require(skillPath).skill;

        const name: IntrinsicSkills = <IntrinsicSkills>s.name;

        intrinsicSkills.set(name, s);
    }


    const wieldWeaponSkillsFolder: string = path.join(__dirname, "../skills/wield-weapon");
    const wieldWeaponSkillFiles: string[] = fs.readdirSync(wieldWeaponSkillsFolder).filter(f => f.endsWith(".js"));

    // Load data from all classes
    for (const file of wieldWeaponSkillFiles) {
        const skillPath: string = path.join(wieldWeaponSkillsFolder, file);
        const s: Skill<SkillTypes.WieldWeapon, true, null, true> = require(skillPath).skill;

        const name: WieldWeaponSkills = s.name;

        wieldWeaponSkills.set(name, s);
    }
}

/**
 * Gets all the non-wield-weapon intrinsic skills.
 * 
 * @returns a map with all the intrinsic skills
 */
export const getIntrinsicSkills = (): ReadonlyMap<IntrinsicSkills, Skill<SkillTypes, true, AttackAugmentEffects, true>> => {
    return intrinsicSkills;
};

export const intrinsicSkillNames: IntrinsicSkills[] = Object.values(IntrinsicSkills);

/**
 * Gets all the wield weapon skills.
 * 
 * @returns a map with all the wield weapon skills
 */
export const getWieldWeaponSkills = (): ReadonlyMap<WieldWeaponSkills, Skill<SkillTypes.WieldWeapon, true, null, true>> => {
    return wieldWeaponSkills;
};

export const wieldWeaponSkillNames: WieldWeaponSkills[] = Object.values(WieldWeaponSkills);
