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

/**
 * The Paths that a player can tread.
 */
export enum Paths {
    Pathless = "Pathless",
    Warrior = "Warrior",
    Caster = "Caster",
    Ranger = "Ranger"
}

/**
 * Classes for players who tread the Path of the Warrior.
 */
export enum WarriorClasses {
    Swordmaster = "Swordmaster",
    Guardian = "Guardian",
    Assassin = "Assassin"
}

/**
 * Classes for players who tread the Path of the Caster.
 */
export enum CasterClasses {
    Priest = "Priest",
    Arcanist = "Arcanist",
    Sage = "Sage"
}

/**
 * Classes for players who tread the Path of the Ranger.
 */
export enum RangerClasses {
    Trickster = "Trickster",
    Sniper = "Sniper",
    Adventurer = "Adventurer"
}

/**
 * Classes for players who tread any Path.
 */
export enum CommonClasses {
    Cavalier = "Cavalier"
}

/**
 * Classes for players who are administrators.
 */
export enum AdministratorClasses {
    Arbiter = "Arbiter",
    Idol = "Idol",
    Lord = "Lord"
}

/**
 * All classes that exist in the RPG.
 */
export type PathClasses = WarriorClasses |
    CasterClasses |
    RangerClasses |
    CommonClasses |
    AdministratorClasses;

/**
 * A Path that that a player can tread.
 * Contains the Path's name, description, base growth rates,
 * and intrinsic skills.
 * 
 * @param name the Path's name
 * @param description the Path's description
 * @param growths the Path's base growth rates
 * @param skills the Path's intrinsic skills
 */
export type Path = {
    readonly name: Paths;
    readonly description: string;
    readonly growths: Stats;
    readonly skills: readonly string[];
};

/**
 * A Class that a player can specialise in.
 * Contains the Class's Path, name, description, growth rate modifiers,
 * and intrinsic skills.
 * 
 * @param T the Path that the Class belongs to
 * @param A whether the Class is limited to administrators or not
 * @param path the Path that the Class belongs to
 * @param name the Class's name
 * @param description the Class's description
 * @param growths the Class's growth rate modifiers
 * @param skills the Class's intrinsic skills
 */
export type Class<T extends Paths, A extends boolean = false> = {
    readonly path: T;
    readonly name: (A extends true ? AdministratorClasses :
                    T extends null ? CommonClasses :
                    T extends Paths.Warrior ? WarriorClasses :
                    T extends Paths.Caster ? CasterClasses :
                    RangerClasses);
    readonly description: string;
    readonly growths: Stats;
    readonly skills: readonly string[];
};

const paths: Map<Paths, Path> = new Map();
const classes: Map<PathClasses, Class<Paths, boolean>> = new Map();

{
    const pathsFolder: string = path.join(__dirname, "../paths");
    const pathFiles: string[] = fs.readdirSync(pathsFolder).filter(f => f.endsWith(".js"));

    // Load data from all paths
    for (const file of pathFiles) {
        const pathPath: string = path.join(pathsFolder, file);
        const p: Path = require(pathPath).path;

        const name: Paths = p.name;

        paths.set(name, p);
    }

    
    const classesFolder: string = path.join(__dirname, "../classes");
    const classFiles: string[] = fs.readdirSync(classesFolder).filter(f => f.endsWith(".js"));

    // Load data from all classes
    for (const file of classFiles) {
        const classPath: string = path.join(classesFolder, file);
        const cls: Class<Paths> = require(classPath).cls;

        const name: PathClasses = cls.name;

        classes.set(name, cls);
    }
}

/**
 * Gets all the paths with Path name mapped to the Path.
 * 
 * @returns a map with all the Paths
 */
export const getPaths = (): ReadonlyMap<Paths, Path> => {
    return paths;
};

/**
 * The names of each Path excluding Pathless.
 */
export const pathNames: readonly Paths[] = Object.values(Paths)
    .filter(c => c !== Paths.Pathless);

/**
 * Gets all the classes with Class name mapped to the Class.
 * 
 * @returns a map with all the Classes
 */
export const getClasses = (): ReadonlyMap<PathClasses, Class<Paths, boolean>> => {
    return classes;
};

/**
 * The level requirement for a player to unlock Paths.
 */
export const PATH_LEVEL: number = 10;

/**
 * The level requirement for a player to unlock their first class.
 */
export const CLASS_1_LEVEL: number = 30;

/**
 * The level requirement for a player to unlock their second class.
 */
export const CLASS_2_LEVEL: number = 50;

/**
 * The cost to change Path or Class
 */
export const RECLASS_COST: number = 10_000;
