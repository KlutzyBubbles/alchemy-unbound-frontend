// import { net } from 'electron';
import { ErrorCode, Recipe, TokenHolder } from '../common/types';
import { getPlaceholderOrder, getRecipe, insertRecipeRow, save, traverseAndFill } from './database';
import { isPackaged } from './generic';
import { getWebAuthTicket } from './steam';
import fetch from 'electron-fetch';

export type RequestErrorResult = {
  code: number,
  message: string
}

let endpoint = 'http://localhost:5001';
if (isPackaged()) {
    // Production
    endpoint = 'https://alchemyunbound.net';
}

const token: TokenHolder | undefined = undefined;

export async function getToken(): Promise<TokenHolder> {
    if (token === undefined) {
        return await createToken();
    } else {
        return await refreshToken();
    }
}

async function refreshToken(): Promise<TokenHolder> {
    if (token === undefined) {
        return await createToken();
    } else {
        if (token.expiryDate < (new Date()).getTime() + 600000) {
            const response = await fetch(`${endpoint}/session?${token.token}`, {
                method: 'GET',
            });
            if (response.ok) {
                try {
                    const body: TokenHolder = (await response.json()) as TokenHolder;
                    return body;
                } catch(e) {
                    console.error('Failed to make api request');
                    console.error(e);
                    throw(e);
                }
            } else {
                console.error(`response error code ${response.status}`);
                const json = (await response.json()) as RequestErrorResult;
                console.error(json);
                if (json.code === ErrorCode.QUERY_INVALID || json.code === ErrorCode.QUERY_UNDEFINED || json.code === ErrorCode.QUERY_MISSING) {
                    throw('Unknown issue with input token');
                } else if (json.code === ErrorCode.STEAM_TICKET_INVALID) {
                    throw('Issue with steam ticket');
                } else if (json.code === ErrorCode.STEAM_SERVERS_DOWN) {
                    throw('Steam servers are down');
                }
                throw('Unknown error');
            }
        } else {
            return token;
        }
    }
}

async function createToken(): Promise<TokenHolder> {
    const ticket = await getWebAuthTicket();
    console.log('trying to get token');
    console.log(`${endpoint}/session?steamToken=${ticket.getBytes().toString('hex')}`);
    const response = await fetch(`${endpoint}/session?steamToken=${ticket.getBytes().toString('hex')}`, {
        method: 'POST',
    });
    if (response.ok) {
        try {
            const body: TokenHolder = (await response.json()) as TokenHolder;
            return body;
        } catch(e) {
            console.error('Failed to make api request');
            console.error(e);
            throw(e);
        }
    } else {
        console.error(`response error code ${response.status}`);
        const json = (await response.json()) as RequestErrorResult;
        console.error(json);
        if (json.code === ErrorCode.QUERY_INVALID || json.code === ErrorCode.QUERY_UNDEFINED || json.code === ErrorCode.QUERY_MISSING) {
            throw('Unknown issue with input token');
        } else if (json.code === ErrorCode.STEAM_TICKET_INVALID) {
            throw('Issue with steam ticket');
        } else if (json.code === ErrorCode.STEAM_SERVERS_DOWN) {
            throw('Steam servers are down');
        }
        throw('Unknown error');
    }
}

export async function combine(a: string, b: string): Promise<Recipe | undefined> {
    let exists: Recipe | undefined = undefined;
    try {
        exists = await getRecipe(a, b);
    } catch(e) {
        console.error('Cannot get recipe');
        console.error(e);
        exists = undefined;
    }
    if (exists !== undefined) {
        return exists;
    } else {
        let tokenResponse: TokenHolder | undefined = undefined;
        try {
            tokenResponse = await getToken();
        } catch (e) {
            console.error('Failed to get token response', e);
        }
        let url = `${endpoint}/api?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
        if (tokenResponse !== undefined) {
            url += `&token=${tokenResponse.token}`;
        }
        console.log(url);
        const response = await fetch(url);
        if (response.ok) {
            try {
                const body: Recipe = (await response.json()) as Recipe;
                try {
                    const recipeRow = await insertRecipeRow({
                        a: a,
                        b: b,
                        result: body.result,
                        display: body.display,
                        emoji: body.emoji,
                        depth: body.depth,
                        first: body.first ? 1 : 0,
                        who_discovered: body.who_discovered,
                        base: body.base ? 1 : 0
                    });
                    await save();
                    return traverseAndFill(recipeRow);
                } catch(e) {
                    console.error('Failed to insert recipe');
                    console.error(e);
                    return traverseAndFill({
                        order: getPlaceholderOrder(),
                        a: a,
                        b: b,
                        result: body.result,
                        display: body.display,
                        emoji: body.emoji,
                        depth: body.depth,
                        first: body.first ? 1 : 0,
                        who_discovered: body.who_discovered,
                        base: body.base ? 1 : 0
                    });
                }
            } catch(e) {
                console.error('Failed to make api request');
                console.error(e);
                throw(e);
            }
        } else {
            console.error(`response error code ${response.status}`);
            const json = (await response.json()) as RequestErrorResult;
            console.error(json);
            if (json.code === ErrorCode.QUERY_INVALID || json.code === ErrorCode.QUERY_UNDEFINED) {
                throw('Unknown issue with input a/b');
            } else if (json.code === ErrorCode.AB_NOT_KNOWN) {
                throw('Items are not known, have these been synced with the server?');
            }
            return undefined;
        }
    }
}
