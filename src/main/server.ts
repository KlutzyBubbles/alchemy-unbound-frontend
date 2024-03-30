import logger from 'electron-log/main';
import { CombineOuput, ErrorCode, Recipe, TokenHolder } from '../common/types';
import { getPlaceholderOrder, getRecipe, insertRecipeRow, save, setDiscovered, traverseAndFill } from './database';
import { isPackaged } from './generic';
import { getSettings } from './settings';
import { getSteamGameLanguage, getWebAuthTicket } from './steam';
import fetch, { Response } from 'electron-fetch';

export type RequestErrorResult = {
  code: number,
  message: string
}

let endpoint = 'http://localhost:5001';
// let endpoint = 'https://api.alchemyunbound.net';
if (isPackaged()) {
    // Production
    endpoint = 'https://api.alchemyunbound.net';
}

let token: TokenHolder | undefined = undefined;

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
            let response: Response | undefined = undefined;
            try {
                console.log('token request url', `${endpoint}/session?token=${token.token}`);
                response = await fetch(`${endpoint}/session?token=${token.token}`, {
                    method: 'GET',
                });
            } catch(e) {
                logger.error('Failed to make token API request', e);
                throw(e);
            }
            if (response === undefined) {
                logger.error('Failed to make token API request (undefined)');
                throw(new Error('Failed to make token API request (undefined)'));
            }
            if (response.ok) {
                try {
                    const body: TokenHolder = (await response.json()) as TokenHolder;
                    console.log('token response body', body);
                    token = body;
                    return body;
                } catch(e) {
                    logger.error('Failed to format token response data', e);
                    throw(e);
                }
            } else {
                const json = (await response.json()) as RequestErrorResult;
                if (json.code === ErrorCode.QUERY_INVALID || json.code === ErrorCode.QUERY_UNDEFINED || json.code === ErrorCode.QUERY_MISSING) {
                    throw(`Issue with input token or language: ${json.code}`);
                } else if (json.code === ErrorCode.STEAM_TICKET_INVALID) {
                    throw('Issue with steam ticket');
                } else if (json.code === ErrorCode.STEAM_SERVERS_DOWN) {
                    throw('Steam servers are down');
                } else if (json.code === ErrorCode.STEAM_ERROR) {
                    throw('Issue validating ticket');
                }
                throw(`Unknown error: ${json.code}`);
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
    let response: Response | undefined = undefined;
    try {
        response = await fetch(`${endpoint}/session?steamToken=${ticket.getBytes().toString('hex')}&steamLanguage=${getSteamGameLanguage()}`, {
            method: 'POST',
        });
    } catch(e) {
        logger.error('Failed to make steam token API request', e);
        throw(e);
    }
    if (response === undefined) {
        logger.error('Failed to make steam token API request (undefined)');
        throw(new Error('Failed to make steam token API request (undefined)'));
    }
    if (response.ok) {
        try {
            const body: TokenHolder = (await response.json()) as TokenHolder;
            console.log('token response body', body);
            token = body;
            return body;
        } catch(e) {
            logger.error('Failed to format steam token response data', e);
            throw(e);
        }
    } else {
        const json = (await response.json()) as RequestErrorResult;
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

export async function combine(a: string, b: string): Promise<CombineOuput | undefined> {
    let exists: Recipe | undefined = undefined;
    try {
        exists = await getRecipe(a, b);
    } catch(e) {
        logger.error('Cannot get recipe', e);
        exists = undefined;
    }
    let newDiscovery = false;
    let firstDiscovery = false;
    if (exists !== undefined) {
        setDiscovered(exists.a.name, exists.b.name, true);
        if (!exists.discovered)
            newDiscovery = true;
        exists.discovered = 1;
        await save();
        return {
            newDiscovery,
            firstDiscovery,
            recipe: exists
        };
    } else {
        if (!(await getSettings(false)).offline) {
            let tokenResponse: TokenHolder | undefined = undefined;
            try {
                tokenResponse = await getToken();
            } catch (e) {
                logger.error('Failed to get token response', e);
            }
            let url = `${endpoint}/api?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
            if (tokenResponse !== undefined) {
                url += `&token=${tokenResponse.token}`;
            }
            console.log('combine url: ', url);
            const response = await fetch(url);
            if (response.ok) {
                try {
                    const body: Recipe = (await response.json()) as Recipe;
                    console.log('combine response body', body);
                    newDiscovery = true;
                    firstDiscovery = body.first ? true : false;
                    try {
                        const recipeRow = await insertRecipeRow({
                            a: a,
                            b: b,
                            result: body.result,
                            discovered: 1,
                            display: body.display,
                            emoji: body.emoji,
                            depth: body.depth,
                            first: body.first ? 1 : 0,
                            who_discovered: body.who_discovered,
                            base: body.base ? 1 : 0
                        });
                        await save();
                        return {
                            newDiscovery,
                            firstDiscovery,
                            recipe: traverseAndFill(recipeRow)
                        };
                    } catch(e) {
                        logger.error('Failed to insert recipe', e);
                        return {
                            newDiscovery,
                            firstDiscovery,
                            recipe: traverseAndFill({
                                order: getPlaceholderOrder(),
                                a: a,
                                b: b,
                                result: body.result,
                                discovered: 1,
                                display: body.display,
                                emoji: body.emoji,
                                depth: body.depth,
                                first: body.first ? 1 : 0,
                                who_discovered: body.who_discovered,
                                base: body.base ? 1 : 0
                            })
                        };
                    }
                } catch(e) {
                    logger.error('Failed to make api request', e);
                    throw(e);
                }
            } else {
                const json = (await response.json()) as RequestErrorResult;
                if (json.code === ErrorCode.QUERY_INVALID || json.code === ErrorCode.QUERY_UNDEFINED) {
                    throw('Unknown issue with input a/b');
                } else if (json.code === ErrorCode.AB_NOT_KNOWN) {
                    throw('Items are not known, have these been synced with the server?');
                }
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}
