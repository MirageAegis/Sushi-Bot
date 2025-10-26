/* 
 * MIT License
 * 
 * Copyright (c) 2024-present Mirage Aegis
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
/* eslint-disable no-magic-numbers */

import { CombatArt } from "../types/art";
import { Attack, AttackForecast, AttackTypes, BattleTurn } from "../types/attack";
import { Spell, SpellTypes } from "../types/spell";
import { Unit } from "../types/unit";
import { WeaponClasses } from "../types/weapon";
import { getProtectionAndAvo } from "./calculations";

type GenericArtOrSpell = CombatArt<WeaponClasses> | Spell<SpellTypes>;

/**
 * A class for managing battles. It takes care of battle ordering and damage reports.
 */
export class BattleManager {
    /**
     * The player of the battle.
     */
    private player: Unit;

    /**
     * The enemy of the battle.
     */
    private enemy: Unit;

    public constructor(player: Unit, enemy: Unit) {
        // Set the battling units
        this.player = player;
        this.enemy = enemy;
    }

    /**
     * Get the attack forecasts of the units in battle. The forecasts are in attack
     * order and have the final damage values.
     * 
     * @returns the forecast of the battle
     */
    public getBattleForecast(playerArtOrSpell?: GenericArtOrSpell): BattleTurn {
        const forecast: BattleTurn = this.getAttackOrder(playerArtOrSpell);
        return forecast;
    }

    private getAttackOrder(playerArtOrSpell?: GenericArtOrSpell): BattleTurn {
        const player: Unit = this.player;
        const enemy: Unit = this.enemy;
        let playerForecast: AttackForecast = player.attack();
        const enemyForecast: AttackForecast = enemy.attack();
        const attackTypes: [player: AttackTypes, enemy: AttackTypes] = [playerForecast.type, enemyForecast.type];

        if (playerArtOrSpell) {
            playerForecast = playerArtOrSpell.use(player, enemy, playerForecast);
        }

        // The array of the order of attacks that will be performed in battle.
        const atkOrder: BattleTurn = {
            message: "",
            attacks: []
        };

        // Whether there are priority attacks or not
        let priority: boolean = false;

        const randomLimit: number = 0.5;
        // Set first and last unit to attack
        let first: Unit;
        let last: Unit;
        let firstAtkCount: number;
        let lastAtkCount: number;
        let forecastOrder: [AttackForecast, AttackForecast];
        switch (attackTypes) {
            // Same attack priority
            case [AttackTypes.Normal, AttackTypes.Normal]:
            case [AttackTypes.Priority, AttackTypes.Priority]:
            case [AttackTypes.Heavy, AttackTypes.Heavy]:
                // First attack goes to the unit with higher speed
                first = player.attackSpeed > enemy.attackSpeed ? player :
                    enemy.attackSpeed > player.attackSpeed ? enemy :
                        Math.random() < randomLimit ? player : enemy;
                last = first === player ? enemy : player;

                forecastOrder = [
                    first === player ? playerForecast : enemyForecast,
                    last === player ? playerForecast : enemyForecast,
                ];

                firstAtkCount = first.attackSpeed - last.attackSpeed > 4 ? 2 : 1;
                lastAtkCount = 1;
                break;

            // Player has priority
            case [AttackTypes.Normal, AttackTypes.Heavy]:
            case [AttackTypes.Priority, AttackTypes.Normal]:
            case [AttackTypes.Priority, AttackTypes.Heavy]:
                priority = true;
                first = player;
                last = enemy;

                forecastOrder = [playerForecast, enemyForecast];

                firstAtkCount = first.attackSpeed - last.attackSpeed > 4 ? 2 : 1;
                lastAtkCount = last.attackSpeed - first.attackSpeed > 4 ? 2 : 1;
                break;

            // Enemy has priority
            case [AttackTypes.Normal, AttackTypes.Priority]:
            case [AttackTypes.Heavy, AttackTypes.Normal]:
            case [AttackTypes.Heavy, AttackTypes.Priority]:
                priority = true;
                first = enemy;
                last = player;

                forecastOrder = [enemyForecast, playerForecast];

                firstAtkCount = first.attackSpeed - last.attackSpeed > 4 ? 2 : 1;
                lastAtkCount = last.attackSpeed - first.attackSpeed > 4 ? 2 : 1;
                break;
        }

        // Check if the units can follow up
        if (!forecastOrder[0].canFollowUp) {
            firstAtkCount = 1;
        }
        if (!forecastOrder[1].canFollowUp) {
            lastAtkCount = 1;
        }

        const atkCount: [number, number] = [firstAtkCount, lastAtkCount];

        // If a unit has priority, add all of its attacks before adding the other unit's attacks
        if (priority) {
            for (let i = 0; i < firstAtkCount; i++) {
                atkOrder.attacks.push(...this.calculateAttack(forecastOrder[0], forecastOrder[1]));
            }

            for (let i = 0; i < lastAtkCount; i++) {
                atkOrder.attacks.push(...this.calculateAttack(forecastOrder[1], forecastOrder[0]));
            }
        } else {
            // Keep adding attacks until depleted
            let currUnit: number = 0;
            while (atkCount[0] || atkCount[1]) {
                if (!atkCount[currUnit]) {
                    continue;
                }
                atkCount[currUnit]--;

                // Add attack
                // currUnit ^ 1 grabs the other unit from the unit order
                atkOrder.attacks.push(...this.calculateAttack(forecastOrder[currUnit], forecastOrder[currUnit ^ 1]));

                // Swap unit
                currUnit ^= 1;
            }
        }

        // Player's attack order skills' effects will take priority
        enemy.applyOrderAttackSkills(atkOrder);
        player.applyOrderAttackSkills(atkOrder);

        return atkOrder;
    }

    private calculateAttack(forecast: AttackForecast, targetForecast: AttackForecast): Attack[] {
        const attacker: Unit = forecast.attacker;
        const target: Unit = targetForecast.attacker;
        const attacks: Attack[] = [];

        const attackerHit: number = forecast.hit;
        const attackerCrit: number = forecast.crit;
        const targetCritAvo: number = targetForecast.critAvo;

        const [targetProtection, targetAvo] = getProtectionAndAvo(target, targetForecast.avo, forecast.dmgType);

        const dmgForecast: number = forecast.might - targetProtection;

        const hitStat: number = attackerHit - targetAvo;
        const critStat: number = attackerCrit - targetCritAvo;

        const baseAttack: Attack = {
            attacker: attacker,
            duplicated: false,
            might: forecast.might,
            protection: targetProtection,
            forecast: dmgForecast,
            damage: {
                base: dmgForecast,
                multiply: 1,
                add: 0
            },
            recoil: forecast.recoil,
            heal: forecast.heal,
            effects: forecast.effects,
            extraMessage: "",
            message: ""

        };

        /*
         * For each attack:
         * - apply attack duplicators
         * - apply attack modifiers
         *   - multiplicative -> additive
         * - apply defence modifiers
         * - calculate hit and crit
         * - apply status modifiers
         */
        for (let i = 0; i < forecast.count; i++) {
            const duplicatedAttacks: Attack[] = attacker.applyDuplicativeSkills(baseAttack);

            for (let attack of duplicatedAttacks) {
                attack = attacker.applyMultiplicativeAttackSkills(target, attack);
                attack = attacker.applyAdditiveAttackSkills(target, attack);
                attack = target.applyAdditiveDefenceSkills(attacker, attack);
                attack = target.applyMultiplicativeDefenceSkills(attacker, attack);
                const hit: boolean = Math.floor(100 * Math.random()) < hitStat;
                const crit: boolean = Math.floor(100 * Math.random()) < critStat;

                if (!hit) {
                    attack.damage = {
                        base: 0,
                        multiply: 0,
                        add: 0
                    };
                    attack.heal = {
                        base: 0,
                        multiply: 0,
                        add: 0
                    };
                }
                if (crit) {
                    attack.damage.multiply *= 3;
                }

                attack = attacker.applyStatusAttackSkills(target, attack);
                attack = target.applyStatusDefenceSkills(attacker, attack);

                const damage: number = Math.floor(attack.damage.base * attack.damage.multiply + attack.damage.add);
                attack.message = hit ? `${crit ? "***CRITICAL HIT!!***\n" : ""}${forecast.attacker.name} dealt ${damage} damage!` :
                    `***${crit ? "CRITICAL " : ""}MISS!!***`;
            }
        }
        return attacks;
    }
}