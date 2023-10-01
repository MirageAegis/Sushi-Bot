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

export const MILLIS_PER_SEC: number = 1000;
export const SECS_PER_MIN: number = 60;
export const SECS_PER_HOUR: number = 3600;
export const SECS_PER_DAY: number = 86400;

/**
 * Generates a string representing the given time.
 * 
 * @param time the time represented in seconds
 * @returns a formatted string
 */
export const formatTime = (time: number): string => {
    // Total seconds translated to hours, minutes, seconds
    const days: number = Math.floor(time / SECS_PER_DAY);
    const hours: number = Math.floor(Math.floor(time % SECS_PER_DAY) / SECS_PER_HOUR);
    const minutes: number = Math.floor(Math.floor(time % SECS_PER_HOUR) / SECS_PER_MIN);
    const seconds: number = Math.floor(Math.floor(time % SECS_PER_HOUR) % SECS_PER_MIN);

    return `${days ? `${days} day(s), ` : ""}` +
           `${hours ? `${hours} hour(s), ` : ""}` +
           `${minutes ? `${minutes} minute(s), ` : ""}` +
           `${seconds ? `${seconds} second(s)` : ""}`;
};
