/*
 * MIT License
 *
 * Copyright (c) 2022-present Mirage Aegis
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

/*
 * This module contains errors/exceptions that command executions may throw
 */

/**
 * An error thrown when trying to find a server member that doesn't exist.
 * Usually occurs when entering a valid user ID of a user who isn't in the
 * server a command is executed in
 */
export class NoMemberFoundError extends Error {
    public constructor() {
        super("No such server member found");
    }
}

/**
 * An error thrown when requesting a user that isn't a member of the server
 * in context, but a member is provided instead
 */
export class UserIsMemberError extends Error {
    public constructor() {
        super("The requested user is a member of the server this command was executed in");
    }
}

/**
 * An error thrown when a discord client object is required but none was provided
 */
export class NoClientProvidedError extends Error {
    public constructor() {
        super("No client object was provided when one is required");
    }
}

/**
 * An error thrown when a text channel is expected but another type os channel was
 * provided
 */
export class NotTextChannelError extends Error {
    public constructor() {
        super("Expected a text channel but got another type");
    }
}

export class TenorError extends Error {
    public constructor() {
        super("Tenor is unavailable or the request is malformed");
    }
}