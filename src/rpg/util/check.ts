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
import { Blacklist } from "../../schemas/blacklist";
import { FrozenPlayerList } from "../../schemas/frozen-player-list";

/**
 * Checks whether a specified user can access the RPG commands or not.
 * Blacklisted users and users who have terminated their profile cannot
 * access the commands.
 * 
 * @param user the ID of the user to check
 * @returns whether the user can access RPG commands or not
 */
export const checkValid = async (user: Snowflake): Promise<boolean> => {
    // Check the blacklist
    const blacklist: Blacklist = await Blacklist.get();
    if (blacklist.users.has(user)) {
        return false;
    }

    // Check the frozen player list
    const frozenList: FrozenPlayerList = await FrozenPlayerList.get();
    if (frozenList.users.has(user)) {
        return false;
    }

    // If the user is in neither of the lists, it's a valid user
    return true;
};