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

import { Guild, GuildMember, PermissionsBitField, Snowflake, User } from "discord.js";
import { getAdminServer } from "./channels";

/**
 * Checks whether a user is eligible to have Sushi Bot in their server.
 * 
 * @param user the user to check
 * @returns whether the user is eligible or not
 */
export const verify = async (user: User | Snowflake): Promise<boolean> => {
    // The official server
    const adminServer: Guild = await getAdminServer();

    // The member object tied to the user, if they're a member
    let member: GuildMember;
    try {
        // Try fetching the member
        member = await adminServer.members.fetch(user);
    } catch (e) {
        // Any error is probably an unknown member error, aka. the user
        // isn't a member
        return false;
    }
    
    // If they have the VTuber role, they're eligible, else they're not
    return member.roles.cache.get(process.env.VTUBER_ROLE_ID) ? true : false;
};

/**
 * Checks whether a user is a Sushi Hub admin or not.
 * 
 * @param user the user to check
 * @returns whether the user is eligible or not
 */
export const verifyAdmin = async (user: User | Snowflake): Promise<boolean> => {
    // The official server
    const adminServer: Guild = await getAdminServer();

    // The member object tied to the user, if they're a member
    let member: GuildMember;
    try {
        // Try fetching the member
        member = await adminServer.members.fetch(user);
    } catch (e) {
        // Any error is probably an unknown member error, aka. the user
        // isn't a member
        return false;
    }
    
    // Check if the member has admin permissions
    return member.permissions.has(PermissionsBitField.Flags.Administrator) ? true : false;
};