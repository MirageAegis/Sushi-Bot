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

import { GuildMember, PermissionsBitField, Snowflake } from "discord.js";
import { Schema, HydratedDocument, Model, model } from "mongoose";
import { 
    AdministratorClasses, CLASS_1_LEVEL, CLASS_2_LEVEL, CasterClasses, Class,
    CommonClasses,
    PATH_LEVEL, Path, PathClasses, Paths, RECLASS_COST, RangerClasses, WarriorClasses,
    getClasses, getPaths, pathNames 
} from "../rpg/types/class";
import { MILLIS_PER_SEC } from "../util/format";
import { verify, verifyAdmin } from "../util/verify";

const playerSchema: Schema = new Schema({
    _id: String,
    prestige: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    levelPing: { type: Boolean, default: false },
    classes: {
        path: String,
        subclasses: [String]
    },
    stats: {
        health: Number,
        guard: Number,
        strength: Number,
        magic: Number,
        speed: Number,
        defence: Number,
        resistance: Number,
        dexterity: Number,
        luck: Number
    },
    weapons: {
        unlocked: {
            type: Map,
            of: String
        },
        equipped: String
    },
    skills: {
        unlocked: [String],
        equipped: [String]
    },
    combatArts: {
        unlocked: {
            type: Map,
            of: [String]
        },
        equipped: [String]
    },
    inventory: {
        type: Map,
        of: Number,
        default: new Map()
    },
    balance: { type: Number, default: 500 },
    reputation: { type: Number, default: 1 },
    cooldowns: {
        experience: { type: Number, default: 0 },
        daily: { type: Number, default: 0 },
        reputation: { type: Number, default: 0 }
    },
    dailyStreak: { type: Number, default: 0 }
});

/**
 * The classes of a user.
 */
type Classes = {
    path: Paths;
    subclasses: [PathClasses?, PathClasses?]
};

/**
 * The stats of a user.
 */
export type Stats = {
    readonly health: number;
    readonly guard: number;
    readonly strength: number;
    readonly magic: number;
    readonly speed: number;
    readonly defence: number;
    readonly resistance: number;
    readonly dexterity: number;
    readonly luck: number;
};

/**
 * The weapons a user has, both unlocked and equipped
 */
type Weapons = {
    unlocked: Map<string, string>;
    equipped: string;
};

/**
 * The skills of a user, both unlocked and equipped.
 */
type Skills = {
    unlocked: string[];
    equipped: string[];
};

/**
 * The combat arts of a user, both unlocked and equipped.
 */
type CombatArts = {
    unlocked: Map<string, string>;
    equipped: string[];
};

/**
 * The cooldowns of a user.
 * Tells when a certain event can be triggered again.
 */
type Cooldowns = {
    experience: number;
    daily: number;
    reputation: number;
};

/**
 * The cooldowns of a user.
 * Tells when a certain event can be triggered again.
 */
export type ReadonlyCooldowns = {
    readonly experience: number;
    readonly daily: number;
    readonly reputation: number;
};

interface PlayerI {
    _id: Snowflake;
    prestige: number;
    level: number;
    experience: number;
    levelPing: boolean;
    classes: Classes;
    stats: Stats;
    weapons: Weapons;
    skills: Skills;
    combatArts: CombatArts;
    inventory: Map<string, number>;
    balance: number;
    reputation: number;
    cooldowns: Cooldowns;
    dailyStreak: number;
}

const BASE_STATS: Stats = {
    health: 30,
    guard: 15,
    strength: 7,
    magic: 7,
    speed: 7,
    defence: 7,
    resistance: 7,
    dexterity: 7,
    luck: 7,
};

/**
 * The minimum time a user object stays in the cache.
 * 20 minutes
 */
const playerLifetime: number = 1_200_000;

/**
 * The base amount of experience gained form chatting.
 */
const BASE_CHAT_EXP: number = 20;

/**
 * The base amount of experience gained from dailies.
 */
const BASE_DAILY_EXP: number = 200;

/**
 * Experience boost for VTubers every time they receive
 * experience form chatting.
 */
const VTUBER_EXP_BOOST: number = 10;

/**
 * Experience- and funds boost for VTubers every time they claim
 * their daily rewards.
 */
const VTUBER_DAILY_BOOST: number = 100;

/**
 * The multiplicative bonus for reputation points when
 * claiming dailies. The reputation bonus is added at the end
 */
const REPUTATION_DAILY_FACTOR: number = 2;

/**
 * The cooldown for experience gain in seconds.
 * 2 minutes.
 * FIXME: Change to 120
 */
const EXPERIENCE_COOLDOWN: number = 0;

/**
 * The cooldown for daily claims in seconds.
 * 1 day.
 * FIXME: Change to 86_400
 */
const DAILY_COOLDOWN: number = 0;

/**
 * The cooldown for giving out reputation points in seconds.
 * 1 week.
 * FIXME: Change to 604_800
 */
const REPUTATION_COOLDOWN: number = 5;

/**
 * The base amount of daily funds, affected by the streak.
 */
const BASE_DAILY_FUNDS: number = 100;

/**
 * The percentage to boost for each day in the streak.
 */
const DAILY_STREAK_BONUS: number = 0.2;

/**
 * The point at which the bonus will stop increasing.
 */
const DAILY_STREAK_BONUS_LIMIT: number = 15;

/**
 * The base level threshold that gets multiplied
 * with the user's prestige + 1.
 */
const LEVEL_THRESHOLD: number = 100;

export class Player {
    /**
     * The corresponding Mongo model used for reading and writing to the database.
     */
    private static readonly model: Model<PlayerI> = model<PlayerI>("Player", playerSchema);

    /**
     * The cached servers.
     * The servers are stored along with the ID for the timer responsible for
     * clearing the memory.
     */
    private static cache: Map<Snowflake, [Player, NodeJS.Timeout]> = new Map();

    /**
     * The instance data from the database.
     */
    declare private data: HydratedDocument<PlayerI>;

    /**
     * Creates a new document for a player.
     * 
     * @param id user ID for the new document
     */
    private constructor(id: Snowflake);

    /**
     * Inflates a player object using data from the database.
     * 
     * @param data player data from database
     */
    private constructor(data: HydratedDocument<PlayerI>);

    /**
     * Instantiates a server object that represents a server document.
     * 
     * @param arg the data passed
     */
    private constructor(arg: Snowflake | HydratedDocument<PlayerI>) {
        if (typeof arg === "string" || arg instanceof String) {
            // Create new server document if a Snowflake was passed
            this.data = new Player.model({
                _id: <string> arg,
                classes: {
                    path: Paths.Pathless,
                    classes: []
                },
                stats: BASE_STATS
            });
        } else {
            // Otherwise use the document from the database
            this.data = <HydratedDocument<PlayerI>> arg;
        }
    }

    /**
     * Gets a player document from the database.
     * 
     * @param id the player ID
     * @returns the requested player document or null if none was found
     */
    public static async get(id: Snowflake): Promise<Player> {
        // Try to get the server from the cache
        const s: [Player, NodeJS.Timeout] = Player.cache.get(id);
        let server: Player;

        if (s) {
            // If the server is found, clear the old timeout
            clearTimeout(s[1]);
            server = s[0];
        } else {
            // Otherwise, fetch from the database
            const data: HydratedDocument<PlayerI> = await Player.model.findById(id);
            
            // If the database didn't have the server,
            // create a new document
            server = data ? new Player(data) : new Player(id);
        }

        // Create a timeout that flushes the server from the cache
        // after a set period of time
        const timeout: NodeJS.Timeout = setTimeout(async (): Promise<void> => {
            await server.save();
            Player.cache.delete(id);
        }, playerLifetime);

        // Save to the cache
        Player.cache.set(id, [server, timeout]);

        return server;
    }

    /**
     * Saves the cached data to the database.
     */
    public async save(): Promise<void> {
        await this.data.save();
    }

    /**
     * Deletes the player configurations from the database.
     */
    public async delete(): Promise<void> {
        const [, timeout]: [Player, NodeJS.Timeout] = Player.cache.get(this.data._id);
        // Clear the server data from the cache
        clearTimeout(timeout);
        Player.cache.delete(this.data._id);
        // Delete from the database
        await Player.model.findByIdAndDelete(this.data._id);
    }

    /* eslint-disable no-magic-numbers */
    /**
     * Increases the experience of a player.
     * If the player has enough experience to level up, they do so.
     * 
     * @returns the player's level and stats before and after chatting.
     * If no level up occurred, after is set to null. Also returns the
     * amount of daily funds claimed and whether the player has unlocked
     * Paths, a Class slot, or Limitbreak
     */
    public async chat(): Promise<[
        before: [level: number, stats: Stats],
        after: [level: number, stats: Stats] | null,
        cooldown: number,
        pathUnlock: boolean,
        classUnlock: boolean,
        canLimitbreak: boolean
    ]> {
        // The current timestamp in seconds
        const now: number = Math.floor(Date.now() / MILLIS_PER_SEC);
        const stats: Stats = {
            health: this.stats.health,
            guard: this.stats.guard,
            strength: this.stats.strength,
            magic: this.stats.magic,
            speed: this.stats.speed,
            defence: this.stats.defence,
            resistance: this.stats.resistance,
            dexterity: this.stats.dexterity,
            luck: this.stats.luck
        };
        const level: number = this.data.level;

        // Do nothing if on cooldown
        if (now < this.data.cooldowns.experience) {
            return [
                [level, stats],
                null,
                this.data.cooldowns.experience - now,
                false,
                false,
                false
            ];
        }

        // The baseline exp gain
        let expGain: number = BASE_CHAT_EXP;

        // Add the VTuber boost if it's a VTuber
        if (await verify(this.data._id)) {
            expGain += VTUBER_EXP_BOOST;
        }

        // Add a reputation boost
        expGain += Math.floor(Math.log10(this.data.reputation));

        // Update the player's experience and cooldown
        this.data.experience += expGain;
        this.data.cooldowns.experience = now + EXPERIENCE_COOLDOWN;

        // Don't continue if the player doesn't have enough experience to level up
        if (this.experience < this.levelThreshold) {
            return [
                [level, stats],
                null,
                null,
                false,
                false,
                false
            ];
        }

        // Accumulated growths from levelling up
        const growths = {
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

        // Level up while there's enough enxperience,
        // or until the level threshold is reached
        while (
            this.experience >= this.levelThreshold &&
            !this.canLimitbreak
        ) {
            const increases: Stats = this.levelUp();

            // Update the growths
            growths.health += increases.health;
            growths.guard += increases.guard;
            growths.strength += increases.strength;
            growths.magic += increases.magic;
            growths.speed += increases.speed;
            growths.defence += increases.defence;
            growths.resistance += increases.resistance;
            growths.dexterity += increases.dexterity;
            growths.luck += increases.luck;

            // Increment the level
            this.data.level++;
        }

        // Update the stats
        this.data.stats = {
            health: stats.health + growths.health,
            guard: stats.guard + growths.guard,
            strength: stats.strength + growths.strength,
            magic: stats.magic + growths.magic,
            speed: stats.speed + growths.speed,
            defence: stats.defence + growths.defence,
            resistance: stats.resistance + growths.resistance,
            dexterity: stats.dexterity + growths.dexterity,
            luck: stats.luck + growths.luck
        };

        return [
            [level, stats],
            this.data.level !== level ? [this.data.level, this.data.stats] : null,
            null,
            // If the resulting level is past the Path requirement and
            // the player is pathless, then they have a Path unlock
            this.level >= PATH_LEVEL && this.path === Paths.Pathless ? true : false,
            // If the resulting level is past ano of the Class requirements and
            // the player is doesn't have the corresponding class, then they have a Class unlock
            this.level >= CLASS_1_LEVEL && !this.classes[0] ||
            this.level >= CLASS_2_LEVEL && !this.classes[1] ? true : false,
            this.canLimitbreak
        ];
    }

    /**
     * Increases the experience of a player through a daily claim.
     * If the player has enough experience to level up, they do so.
     * 
     * @returns the player's streak before and after the daily;
     * level, and stats before and after the daily.
     * If no level up occurred, after is set to null. Also returns the
     * amount of daily funds claimed and whether the player has unlocked
     * Paths, a Class slot, or Limitbreak
     */
    public async daily(): Promise<[
        streak: [before: number, after: number],
        before: [level: number, stats: Stats],
        after: [level: number, stats: Stats] | null,
        rewards: [experience: number, funds: number],
        cooldown: number,
        pathUnlock: boolean,
        classUnlock: boolean,
        canLimitbreak: boolean
    ]> {
        // The current timestamp in seconds
        const now: number = Math.floor(Date.now() / MILLIS_PER_SEC);
        const stats: Stats = {
            health: this.stats.health,
            guard: this.stats.guard,
            strength: this.stats.strength,
            magic: this.stats.magic,
            speed: this.stats.speed,
            defence: this.stats.defence,
            resistance: this.stats.resistance,
            dexterity: this.stats.dexterity,
            luck: this.stats.luck
        };
        const level: number = this.data.level;
        const streak: number = this.dailyStreak;

        // Do nothing if on cooldown
        if (now < this.data.cooldowns.daily) {
            return [
                [streak, streak],
                [level, stats],
                null,
                null,
                this.data.cooldowns.daily - now,
                false,
                false,
                false
            ];
        }

        // The baseline exp gain
        let expGain: number = BASE_DAILY_EXP;
        // The baseline daily funds
        let funds: number = BASE_DAILY_FUNDS;

        // Add the VTuber boost if it's a VTuber
        if (await verify(this.data._id)) {
            expGain += VTUBER_DAILY_BOOST;
            funds += VTUBER_DAILY_BOOST;
        }

        /*
         * FIXME: Uncomment after test phase
        // If the daily was missed, reset the streak
        if (now - this.data.cooldowns.daily > DAILY_COOLDOWN) {
            this.data.dailyStreak = 1;
        } else {
            // Otherwise increment the streak
            this.data.dailyStreak++;
        }
         */
        this.data.dailyStreak++;

        // If the streak exceeds the streak bonus limit, cap it
        if (this.dailyStreak > DAILY_STREAK_BONUS_LIMIT) {
            expGain += Math.floor(expGain * DAILY_STREAK_BONUS_LIMIT * DAILY_STREAK_BONUS);
            funds += Math.floor(funds * DAILY_STREAK_BONUS_LIMIT * DAILY_STREAK_BONUS);
        } else {
            // Otherwise use the streak to calculate the bonus
            // We remove 1 from the calculation to make up for the offset after incrementing
            expGain += Math.floor(expGain * (this.dailyStreak - 1) * DAILY_STREAK_BONUS);
            funds += Math.floor(funds * (this.dailyStreak - 1) * DAILY_STREAK_BONUS);
        }

        // Add a reputation boost
        expGain += Math.floor(Math.log10(this.data.reputation)) * REPUTATION_DAILY_FACTOR;

        // Update the player's experience, balance, and cooldown
        this.data.experience += expGain;
        this.data.balance += funds;
        this.data.cooldowns.daily = now + DAILY_COOLDOWN;

        // Don't continue if the player doesn't have enough experience to level up
        if (this.experience < this.levelThreshold) {
            return [
                [streak, this.dailyStreak],
                [level, stats],
                null,
                [expGain, funds],
                null,
                false,
                false,
                false
            ];
        }

        // Accumulated growths from levelling up
        const growths = {
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

        // Level up while there's enough enxperience,
        // or until the level threshold is reached
        while (
            this.experience >= this.levelThreshold &&
            !this.canLimitbreak
        ) {
            const increases: Stats = this.levelUp();

            // Update the growths
            growths.health += increases.health;
            growths.guard += increases.guard;
            growths.strength += increases.strength;
            growths.magic += increases.magic;
            growths.speed += increases.speed;
            growths.defence += increases.defence;
            growths.resistance += increases.resistance;
            growths.dexterity += increases.dexterity;
            growths.luck += increases.luck;

            // Increment the level
            this.data.level++;
        }

        // Update the stats
        this.data.stats = {
            health: stats.health + growths.health,
            guard: stats.guard + growths.guard,
            strength: stats.strength + growths.strength,
            magic: stats.magic + growths.magic,
            speed: stats.speed + growths.speed,
            defence: stats.defence + growths.defence,
            resistance: stats.resistance + growths.resistance,
            dexterity: stats.dexterity + growths.dexterity,
            luck: stats.luck + growths.luck
        };

        return [
            [streak, this.dailyStreak],
            [level, stats],
            this.data.level !== level ? [this.data.level, this.data.stats] : null,
            [expGain, funds],
            null,
            // If the resulting level is past the Path requirement and
            // the player is pathless, then they have a Path unlock
            this.level >= PATH_LEVEL && this.path === Paths.Pathless ? true : false,
            // If the resulting level is past ano of the Class requirements and
            // the player is doesn't have the corresponding class, then they have a Class unlock
            this.level >= CLASS_1_LEVEL && !this.classes[0] ||
            this.level >= CLASS_2_LEVEL && !this.classes[1] ? true : false,
            this.canLimitbreak
        ];
    }

    /**
     * The experience threshold the player must reach to level up
     */
    public get levelThreshold(): number {
        // All levels above 100 have a threshold of 2500
        if (this.data.level > 100) {
            return 2500;
        }

        // 500 exp for level 1 and then 20 more for each level, until level 101
        return 20 * this.data.level + 480;
    }

    /**
     * The player's experience on their current level
     */
    public get experience(): number {
        const level: number = this.data.level;

        // Don't question this maths, I don't even know
        // how it works
        // Please do explain if you do know
        // Formula: levelExp = 10 level^2 + 470 level - 480, level <= 100
        //          levelExp = 10 * 101^2 + 470 * 101 - 480 + (level - 101) * 2500, level > 100
        // This calculation gives the required total exp for any given level
        let levelExperience: number;
        if (level > 100) {
            levelExperience = 10 * (Math.pow(101, 2) + 47 * 101) - 480;
            levelExperience += (level - 101) * 2500;
        } else {
            levelExperience = 10 * (Math.pow(level, 2) + 47 * level) - 480;
        }

        // The experience needed to reach the player's current level
        return this.data.experience - levelExperience;
    }

    /**
     * Levels up a player and provides stat increases based on
     * the player's growth rates.
     * 
     * @returns the stat increases from the level up
     */
    private levelUp(): Stats {
        const growths: Stats = this.growths;

        // The rolls for each stat, ranges from 1~100
        const healthRoll: number = Math.ceil(Math.random() * 100);
        const guardRoll: number = Math.ceil(Math.random() * 100);
        const strengthRoll: number = Math.ceil(Math.random() * 100);
        const magicRoll: number = Math.ceil(Math.random() * 100);
        const speedRoll: number = Math.ceil(Math.random() * 100);
        const defenceRoll: number = Math.ceil(Math.random() * 100);
        const resistanceRoll: number = Math.ceil(Math.random() * 100);
        const dexterityRoll: number = Math.ceil(Math.random() * 100);
        const luckRoll: number = Math.ceil(Math.random() * 100);

        // if the roll falls within the growth rate, the stat gets increased
        return {
            health: healthRoll <= growths.health ? 1 : 0,
            guard: guardRoll <= growths.guard ? 1 : 0,
            strength: strengthRoll <= growths.strength ? 1 : 0,
            magic: magicRoll <= growths.magic ? 1 : 0,
            speed: speedRoll <= growths.speed ? 1 : 0,
            defence: defenceRoll <= growths.defence ? 1 : 0,
            resistance: resistanceRoll <= growths.resistance ? 1 : 0,
            dexterity: dexterityRoll <= growths.dexterity ? 1 : 0,
            luck: luckRoll <= growths.luck ? 1 : 0
        };
    }

    /**
     * Gets the classes that a player can spec into.
     * Depends on which Path the player is treading.
     * 
     * @returns an array with all the Paths that the player can change to
     */
    public getAvailablePaths(): readonly Paths[] {
        return pathNames.filter(p => p !== this.path);
    }

    /**
     * Whether a player can change Path or not.
     */
    public get canChangePath(): boolean {
        return this.level >= PATH_LEVEL && 
               (this.path === Paths.Pathless || this.balance >= RECLASS_COST);
    }

    /**
     * Changes the Path of the player.
     * Removes subclasses and deducts the reclass cost if the player
     * is already treading a Path.
     * 
     * @param path the Path to change to
     * @returns Whether it was a success and whether it was a reclass or not
     */
    public changePath(path: Paths): [
        success: boolean,
        reclass: boolean
    ] {
        // Disallow players form changing to Pathless
        // and to their current Path
        // The player myst also be able to change Path
        // The Path must also be in the list of available ones
        if (
            !this.canChangePath ||
            path === Paths.Pathless ||
            path === this.path ||
            !this.getAvailablePaths().includes(path)
        ) {
            return [false, false];
        }

        // If the player's Path is Pathless, change from it directly
        if (this.path === Paths.Pathless) {
            this.data.classes.path = path;
            return [true, false];
        }

        this.data.balance -= RECLASS_COST;
        this.data.classes.path = path;
        this.data.classes.subclasses = [];
        return [true, true];
    }

    /**
     * Gets the classes that a player can spec into.
     * Depends on which Path the player is treading, the Classes that the player
     * is currently specced into, and the type of administrator the player is.
     * 
     * @param member the player's member object
     * @returns an array with all the classes that the player can spec into
     */
    public async getAvailableClasses(member: GuildMember): Promise<readonly PathClasses[]> {
        let classes: PathClasses[];

        switch (this.path) {
            case Paths.Pathless:
                return [];
            case Paths.Warrior:
                classes = Object.values(WarriorClasses);
                break;
            case Paths.Caster:
                classes = Object.values(CasterClasses);
                break;
            case Paths.Ranger:
                classes = Object.values(RangerClasses);
                break;
        }

        classes.push(...Object.values(CommonClasses));

        let admin: "regular" | "owner" | "sushi";
        switch (true) {
            case await verifyAdmin(member.user.id):
                admin = "sushi";
                break;
            case await verify(member.user.id):
                admin = "owner";
                break;
            case member.permissions.has(PermissionsBitField.Flags.Administrator):
                admin = "regular";
                break;
            default:
                admin = null;
        }

        /* eslint-disable no-fallthrough */
        switch (admin) {
            case "sushi":
                classes.push(AdministratorClasses.Arbiter);
            case "owner":
                classes.push(AdministratorClasses.Idol);
            case "regular":
                classes.push(AdministratorClasses.Lord);
        }
        /* eslint-enable no-fallthrough */

        classes = classes.filter(c => !this.classes.includes(c));
        return classes;
    }

    /**
     * Whether a player can add a Class or not.
     */
    public get canAddClass(): boolean {
        if (
            // If the player is below the required level for the first class,
            this.level < CLASS_1_LEVEL ||
            // or if they have their first class but are below the requirement
            // for the second class,
            this.level < CLASS_2_LEVEL && this.classes[0] ||
            // or if they already have 2 classes;
            this.classes[1]
        ) {
            // they won't be able to add another class
            return false;
        }
        return true;
    }

    /**
     * Adds a class to a player, if the class is compatible.
     * 
     * @param cls the Class to add
     * @param member the player's member object
     * @returns Whether it was a success or not
     */
    public async addClass(cls: PathClasses, member: GuildMember): Promise<boolean> {
        // The player must be able to add a class
        if (!this.canAddClass) {
            return false;
        }

        const classes: readonly PathClasses[] = await this.getAvailableClasses(member);

        // Chaeck if the class is in the list of compatible classes
        if (!classes.includes(cls)) {
            return false;
        }

        // If the player is Classless
        if (this.classes[0]) {
            // Set the 2nd class to the provided class
            this.data.classes.subclasses[1] = cls;
            return true;
        }

        // Otherwise, set the 1st class to the provided class
        this.data.classes.subclasses[0] = cls;
        return true;
    }

    /**
     * Whether a player can change class or not.
     */
    public get canChangeClass(): boolean {
        // The player must have 2 classes and enough money to reclass
        return this.classes[1] && this.balance >= RECLASS_COST;
    }

    /**
     * Changes a Class of the player and deducts the reclass cost.
     * 
     * @param cls the Class to change to
     * @param position the position of the Class to change from
     * @param member the player's member object
     * @returns Whether it was a success or not
     */
    public async changeClass(
        cls: PathClasses,
        position: 0 | 1,
        member: GuildMember
    ): Promise<boolean> {
        // The player must be able to reclass
        if (!this.canChangeClass) {
            return false;
        }

        const classes: readonly PathClasses[] = await this.getAvailableClasses(member);

        // Chaeck if the class is in the list of compatible classes
        if (classes.includes(cls)) {
            return false;
        }

        // Change the class at the requested position
        this.data.classes.subclasses[position] = cls;
        return true;
    }

    /**
     * Whether a player can break their limits and return to level 1.
     * The player must reach their level cap to limit break.
     * Max level = 100 + 100 for every limit break.
     */
    public get canLimitbreak(): boolean {
        return this.level >= this.maxLevel;
    }

    /**
     * Breaks the limits of a player.
     * Increases prestige and level cap but resets classes, level, and stats.
     * 
     * @returns whether the limitbreak was successful or not
     */
    public limitbreak(): boolean {
        // Check if the player can limitbreak
        if (!this.canLimitbreak) {
            return false;
        }

        // Reset the player's experience
        this.data.experience = 0;
        // Reset the player's level
        this.data.level = 1;
        // Reset the player's Path and Classes
        this.data.classes = {
            path: Paths.Pathless,
            subclasses: []
        };
        // Reset the player's stats
        this.data.stats = BASE_STATS;
        // Increment the player's prestige
        this.data.prestige++;
        return true;
    }

    /**
     * The growth rates of a player
     */
    public get growths(): Stats {
        const path: Path = getPaths().get(this.data.classes.path);
        const allClasses: ReadonlyMap<PathClasses, Class<Paths, boolean>> = getClasses();

        // Start with the path growths
        const growths = {
            health: path.growths.health,
            guard: path.growths.guard,
            strength: path.growths.strength,
            magic: path.growths.magic,
            speed: path.growths.speed,
            defence: path.growths.defence,
            resistance: path.growths.resistance,
            dexterity: path.growths.dexterity,
            luck: path.growths.luck
        };

        // Add the growth rate modifiers from subclasses
        for (const className of this.data.classes.subclasses) {
            // Get the class data
            const cls: Class<Paths> = allClasses.get(className);

            // If there is no subclass, skip
            if (!cls) {
                continue;
            }

            growths.health += cls.growths.health ?? 0;
            growths.guard += cls.growths.guard ?? 0;
            growths.strength += cls.growths.strength ?? 0;
            growths.magic += cls.growths.magic ?? 0;
            growths.speed += cls.growths.speed ?? 0;
            growths.defence += cls.growths.defence ?? 0;
            growths.resistance += cls.growths.resistance ?? 0;
            growths.dexterity += cls.growths.dexterity ?? 0;
            growths.luck += cls.growths.luck ?? 0;
        }

        return growths;
    }
    /* eslint-enable no-magic-numbers */

    /**
     * Gives reputation to another player. Only works on other players.
     * Does not check the blacklist nor the frozen player list.
     * 
     * @param target the player to give a reputation point to
     * @returns whether the player tried to give reputation to themselves,
     * and the remaining cooldown iff the command isn't ready.
     * [false, null] indicates success
     */
    public giveReputation(target: Player): [
        selfRep: boolean,
        cooldown: number
    ] {
        // Players cannot give reputation to themselves
        if (this === target) {
            return [true, null];
        }
        
        // The current timestamp in seconds
        const now: number = Math.floor(Date.now() / MILLIS_PER_SEC);

        // Do nothing if on cooldown
        if (now < this.cooldowns.reputation) {
            return [false, this.cooldowns.reputation - now];
        }

        // Increment the target's reputation, and update the cooldown
        target.data.reputation++;
        this.data.cooldowns.reputation = now + REPUTATION_COOLDOWN;

        return [false, null];
    }

    /**
     * The path of a player.
     */
    public get path(): Paths {
        return this.data.classes.path;
    }

    /**
     * The classes of a player.
     */
    public get classes(): readonly [PathClasses?, PathClasses?] {
        return this.data.classes.subclasses;
    }

    /**
     * The stats of a player.
     */
    public get stats(): Stats {
        // Return a copy of the stats
        return {
            health: this.data.stats.health,
            guard: this.data.stats.guard,
            strength: this.data.stats.strength,
            magic: this.data.stats.magic,
            speed: this.data.stats.speed,
            defence: this.data.stats.defence,
            resistance: this.data.stats.resistance,
            dexterity: this.data.stats.dexterity,
            luck: this.data.stats.luck
        };
    }

    /**
     * The level of a player. A natural number.
     */
    public get level(): number {
        return this.data.level;
    }

    /**
     * The max level that a player can reach.
     * Max level = 100 + 100 for every limit break.
     */
    public get maxLevel(): number {
        // eslint-disable-next-line no-magic-numbers
        return LEVEL_THRESHOLD * (this.prestige + 1);
    }

    /**
     * Whether a player wants to be pinged when levelling up or not.
     */
    public get levelPing(): boolean {
        return this.data.levelPing;
    }

    public set levelPing(levelPing: boolean) {
        this.data.levelPing = levelPing;
    }

    /**
     * The prestige of a player. An integer >= 0.
     */
    public get prestige(): number {
        return this.data.prestige;
    }

    /**
     * The amount of money a player has. An integer >= 0.
     */
    public get balance(): number {
        return this.data.balance;
    }

    /**
     * The player's reputation. A natural number.
     */
    public get reputation(): number {
        return this.data.reputation;
    }

    /**
     * The player's daily streak. An integer >= 0.
     */
    public get dailyStreak(): number {
        return this.data.dailyStreak;
    }

    /**
     * The player's cooldowns.
     */
    public get cooldowns(): ReadonlyCooldowns {
        return this.data.cooldowns;
    }
}
