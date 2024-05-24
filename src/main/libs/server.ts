import logger from 'electron-log/main';
import { CombineOutput, ServerErrorCode, Recipe, TokenHolder, TokenHolderResponse, PurchaseOutput, PurchaseSuccess, ValidateOutput, UserOutput, RedeemSuccess, GenericSuccess, GenericOutput } from '../../common/types';
import { getPlaceholderOrder, getRecipe, insertRecipeRow, serverVersion, setDiscovered, traverseAndFill } from './database/recipeStore';
import { getAppVersion, isPackaged } from './generic';
import { getSettings } from './settings';
import { getSteamGameLanguage, getSteamworksClient, getWebAuthTicket } from './steam';
import fetch, { HeadersInit, Response } from 'electron-fetch';
import { TxnItems } from '../../common/server';
import { addTheme, removeTheme } from './info';

export type RequestErrorResult = {
  code: number,
  message: string
}

const TIMEOUT = 30000;

type EndpointVersion = 'development' | 'prerelease' | 'release'

const ENDPOINT_VERSIONS = ['development', 'prerelease', 'release', 'custom'];

const ENDPOINTS = {
    development: 'http://localhost:5001',
    prerelease: 'https://alchemy-unbound-prerelease-b687af701d77.herokuapp.com',
    release: 'https://api.alchemyunbound.net'
};

let endpointVersion: EndpointVersion | 'custom' = 'custom'; // 'release';

let endpoint = 'http://localhost:5001';
// endpoint = 'https://api.alchemyunbound.net';
// endpoint = 'https://alchemy-unbound-prerelease-b687af701d77.herokuapp.com';
if (isPackaged()) {
    // Production
    endpoint = 'https://api.alchemyunbound.net';
}

export function setEndpointVersion(version: EndpointVersion | 'custom') {
    if (ENDPOINT_VERSIONS.includes(version.toLocaleLowerCase())) {
        endpointVersion = version;
        return;
    }
    logger.warn('Invalid endpoint version, setting to release', version);
    endpointVersion = 'release';
}

export function setEndpoint(newEndpoint: string) {
    endpointVersion = 'custom';
    endpoint = newEndpoint;
}

function getEndpointUri() {
    try {
        if (endpointVersion === 'custom') {
            return endpoint;
        }
        return ENDPOINTS[endpointVersion];
    } catch (error) {
        logger.error('Failed getting endpoint, reverting to release', error);
        return ENDPOINTS.release;
    }
}

let token: TokenHolder | undefined = undefined;

export async function getToken(): Promise<TokenHolderResponse> {
    if (token === undefined) {
        return await createToken();
    } else {
        return await refreshToken();
    }
}

export function getVersion(): number {
    return serverVersion;
}

export function getEndpoint(): string {
    if (endpointVersion === 'custom') {
        return endpoint;
    }
    return endpointVersion;
}

async function refreshToken(): Promise<TokenHolderResponse> {
    logger.silly('refreshToken');
    if (token === undefined) {
        return await createToken();
    } else {
        logger.debug('Expiry dates', token.expiryDate, ((new Date()).getTime() + 600000) / 1000);
        if (token.expiryDate < ((new Date()).getTime() + 600000) / 1000) {
            let response: Response | undefined = undefined;
            try {
                const url = `${getEndpointUri()}/v${serverVersion}/session?version=${getAppVersion()}`;
                logger.debug('token request url', url, token.token);
                response = await fetch(url, {
                    method: 'GET',
                    headers: new Headers({
                        'Authorization': `Bearer ${token.token}`, 
                        'Content-Type': 'application/json'
                    }),
                    timeout: TIMEOUT
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
                    logger.debug('token response body', body);
                    token = body;
                    return {
                        tokenHolder: body,
                        deprecated: response.headers.has('Api-Deprecated')
                    };
                } catch(e) {
                    logger.error('Failed to format token response data', e);
                    throw(e);
                }
            } else {
                const json = (await response.json()) as RequestErrorResult;
                if (json.code === ServerErrorCode.QUERY_INVALID || json.code === ServerErrorCode.QUERY_UNDEFINED || json.code === ServerErrorCode.QUERY_MISSING) {
                    throw(`Issue with input token or language: ${json.code}`);
                } else if (json.code === ServerErrorCode.STEAM_TICKET_INVALID) {
                    throw('Issue with steam ticket');
                } else if (json.code === ServerErrorCode.STEAM_SERVERS_DOWN) {
                    throw('Steam servers are down');
                } else if (json.code === ServerErrorCode.STEAM_ERROR) {
                    throw('Issue validating ticket');
                } else if (json.code === ServerErrorCode.TOKEN_EXPIRED) {
                    return await createToken();
                }
                throw(`Unknown error: ${json.code}`);
            }
        } else {
            return {
                tokenHolder: token,
                deprecated: false
            };
        }
    }
}

async function createToken(): Promise<TokenHolderResponse> {
    logger.silly('createToken');
    const ticket = await getWebAuthTicket();
    let response: Response | undefined = undefined;
    try {
        const url = `${getEndpointUri()}/v${serverVersion}/session?version=${getAppVersion()}&steamToken=${ticket.getBytes().toString('hex')}&steamLanguage=${getSteamGameLanguage()}`;
        logger.debug('trying to get token', url);
        response = await fetch(url, {
            method: 'POST',
            timeout: TIMEOUT
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
            logger.debug('token response body', body);
            token = body;
            return {
                tokenHolder: body,
                deprecated: response.headers.has('Api-Deprecated')
            };
        } catch(e) {
            logger.error('Failed to format steam token response data', e);
            throw(e);
        }
    } else {
        const json = (await response.json()) as RequestErrorResult;
        if (json.code === ServerErrorCode.QUERY_INVALID || json.code === ServerErrorCode.QUERY_UNDEFINED || json.code === ServerErrorCode.QUERY_MISSING) {
            throw('Unknown issue with input token');
        } else if (json.code === ServerErrorCode.STEAM_TICKET_INVALID) {
            throw('Issue with steam ticket');
        } else if (json.code === ServerErrorCode.STEAM_SERVERS_DOWN) {
            throw('Steam servers are down');
        } else if (json.code === ServerErrorCode.STEAM_ERROR) {
            throw('Unknown steam auth error');
        }
        logger.error('Unknown code ', json.code);
        throw('Unknown error');
    }
}

export async function redeemItem(item: string): Promise<GenericOutput> {
    logger.silly('redeemItem', item);
    if (!Object.keys(TxnItems).includes(item)) {
        logger.error('Cannot find item in txn items', item);
        return {
            type: 'error',
            result: {
                code: ServerErrorCode.ITEM_UNKNOWN,
                deprecated: false,
                responseCode: 400
            }
        };
    }
    if (TxnItems[item].singleUse) {
        const result = await apiRequest(
            'PATCH',
            '/v2/purchase',
            {
                item
            },
            undefined,
            true
        );
        if (result.type === 'success') {
            const body: RedeemSuccess = result.result as RedeemSuccess;
            if (body.success) {
                return result;
            } else {
                return {
                    type: 'error',
                    result: {
                        code: ServerErrorCode.QUERY_INVALID,
                        deprecated: false,
                        responseCode: 500
                    }
                };
            }
        } else {
            return result;
        }
    }
}

export async function checkAndRedeem(item: string) {
    logger.silly('checkAndRedeem', item);
    const result = await apiRequest(
        'GET',
        '/v2/purchase',
        {
            item
        },
        undefined,
        true
    );
    if (result.type === 'success') {
        const body: RedeemSuccess = result.result as RedeemSuccess;
        if (body.success) {
            logger.log('inside success');
            if (!body.redeemed) {
                const redeem = await redeemItem(item);
                if (redeem.type === 'error') {
                    return redeem;
                }
            }
            return {
                type: 'success',
                result: {
                    success: true,
                    softError: false
                }
            };
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

export async function initTransaction(item: string): Promise<PurchaseOutput> {
    logger.silly('initTransaction', item);
    if (!Object.keys(TxnItems).includes(item)) {
        logger.error('Cannot find item in txn items', item);
        return {
            type: 'error',
            result: {
                code: ServerErrorCode.ITEM_UNKNOWN,
                deprecated: false,
                responseCode: 400
            }
        };
    }
    return new Promise<PurchaseOutput>((resolve, reject) => {
        (async () => {
            if (TxnItems[item].singleUse) {
                const check = await checkAndRedeem(item);
                if (check !== undefined) {
                    return check;
                }
            }
            const client = getSteamworksClient();
            new Promise<PurchaseOutput>((resolve, reject) => {
                logger.log('inside pormise');
                client.callback.register(client.callback.SteamCallback.MicroTxnAuthorizationResponse, (value) => {
                    console.log('value', value);
                    if (!value.authorized) {
                        return resolve({
                            type: 'error',
                            result: {
                                code: ServerErrorCode.STEAM_ERROR,
                                deprecated: false,
                                responseCode: 0
                            }
                        });
                    }
                    (async() => {
                        return await apiRequest(
                            'GET',
                            '/v2/purchase/finalize',
                            {
                                orderid: parseInt(`${value.order_id}`)
                            },
                            undefined,
                            true
                        );
                    })().then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
                });
            }).then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
            const result = await apiRequest(
                'POST',
                '/v2/purchase',
                {
                    item
                },
                undefined,
                true
            );
            if (result.type === 'success') {
                const body: PurchaseSuccess = result.result as PurchaseSuccess;
                if (!body.success) {
                    return {
                        type: 'error',
                        result: {
                            code: ServerErrorCode.QUERY_INVALID,
                            deprecated: false,
                            responseCode: 500
                        }
                    };
                }
                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
                await delay(10 * 60 * 60 * 1000);
                return {
                    type: 'error',
                    result: {
                        responseCode: ServerErrorCode.QUERY_UNDEFINED,
                        deprecated: false,
                        code: -1
                    }
                };
            } else {
                return result;
            }
        })().then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
    });
}

// Returns undefined if in offline mode.
export async function combine(a: string, b: string): Promise<CombineOutput | undefined> {
    logger.silly('combine', a, b);
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
        const hintAdded = await setDiscovered(exists.a.name, exists.b.name, true);
        if (!exists.discovered)
            newDiscovery = true;
        exists.discovered = 1;
        return {
            type: 'success',
            result: {
                responseCode: 200,
                deprecated: false,
                hintAdded,
                newDiscovery,
                firstDiscovery,
                recipe: exists
            }
        };
    } else {
        if ((await getSettings(false)).offline) {
            return undefined;
        }
        const result = await apiRequest(
            'GET',
            `/v${serverVersion}/api`,
            {
                a,
                b
            },
            undefined,
            false
        );
        if (result.type === 'success') {
            const body: Recipe = result.result as unknown as Recipe;
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
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery,
                        firstDiscovery,
                        recipe: traverseAndFill(recipeRow)
                    }
                };
            } catch(e) {
                logger.error('Failed to insert recipe', e);
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery,
                        firstDiscovery,
                        recipe: traverseAndFill({
                            order: getPlaceholderOrder(),
                            a: a,
                            b: b,
                            result: body.result,
                            discovered: 1,
                            depth: body.depth,
                            first: body.first ? 1 : 0,
                            who_discovered: body.who_discovered,
                            base: body.base ? 1 : 0
                        })
                    }
                };
            }
        } else {
            if (result.result.code === ServerErrorCode.AB_NOT_KNOWN) {
                throw('Items are not known, have these been synced with the server?');
            } else {
                return result;
            }
        }
    }
}

export async function validateItems(items: string[]): Promise<ValidateOutput> {
    logger.silly('validateItems', items);
    if (items.length > 100) {
        return {
            type: 'error',
            result: {
                code: ServerErrorCode.QUERY_INVALID,
                deprecated: false,
                responseCode: 400
            }
        };
    }
    return await apiRequest(
        'POST',
        `/v${serverVersion}/validate`,
        undefined,
        {
            items: items,
            includeLanguage: 'true'
        },
        false
    ) as ValidateOutput;
}

export async function getUserDetails(): Promise<UserOutput> {
    logger.silly('getUserDetails');
    return await apiRequest(
        'GET',
        '/v2/session/user',
        undefined,
        undefined,
        false
    ) as UserOutput;
}

export async function checkDLC(): Promise<UserOutput> {
    logger.silly('getUserDetails');
    return await apiRequest(
        'GET',
        '/v2/session/dlc',
        undefined,
        undefined,
        false
    ) as UserOutput;
}

async function apiRequest(
    method: string,
    path: string,
    queryParams?: Record<string, string | number | boolean>,
    body?: Record<string, unknown>,
    tokenRequired: boolean = false
): Promise<GenericOutput> {
    logger.debug('apiRequest', method, path, queryParams, body, tokenRequired);
    logger.warn('wapiRequest', method, path, queryParams, body, tokenRequired);
    let tokenResponse: TokenHolderResponse | undefined = undefined;
    try {
        tokenResponse = await getToken();
    } catch (e) {
        logger.error('Failed to get token response', e);
    }
    if (tokenResponse === undefined) {
        logger.error('Cannot find token response');
        if (tokenRequired) {
            return {
                type: 'error',
                result: {
                    code: ServerErrorCode.NO_TOKEN,
                    deprecated: false,
                    responseCode: 400
                }
            };
        }
    }
    let url = `${getEndpointUri()}${path}?version=${getAppVersion()}`;
    if (queryParams !== undefined) {
        for (const param of Object.keys(queryParams)) {
            url += `&${param}=${encodeURIComponent(queryParams[param])}`;
        }
    }
    const hasDeprecated = tokenResponse === undefined ? false : tokenResponse.deprecated;
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    if (tokenResponse !== undefined && tokenResponse.tokenHolder !== undefined) {
        headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
    }
    try {
        logger.debug('Final URL', url, headers.Authorization);
        const response = await fetch(url, {
            method: method,
            headers: headers,
            timeout: TIMEOUT,
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        if (response.ok) {
            const body: GenericSuccess = (await response.json()) as GenericSuccess;
            logger.debug('Response body', body);
            logger.warn('wResponse body', body);
            return {
                type: 'success',
                result: body
            };
        } else {
            logger.warn('Error making request', response.status, response.body);
            const json = (await response.json()) as RequestErrorResult;
            if ([ServerErrorCode.QUERY_MISSING, ServerErrorCode.QUERY_INVALID, ServerErrorCode.QUERY_UNDEFINED].includes(json.code)) {
                throw('Unknown issue with input parameters');
            }
            if (json.code === undefined) {
                throw('Unknown error occurred');
            }
            return {
                type: 'error',
                result: {
                    responseCode: response.status,
                    deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                    code: json.code
                }
            };
        }
    } catch(e) {
        logger.error('Failed to make api request', e);
        throw(e);
    }
}

export async function restorePurchases() {
    logger.silly('restorePurchases');
    for (const theme of ['themeOrange', 'themePurple', 'themeSand']) {
        try {
            const result = await checkAndRedeem(theme);
            if (result === undefined) {
                logger.info('Removing theme', theme);
                await removeTheme(theme);
            } else {
                if (result.type === 'success') {
                    if (!result.result.success) {
                        logger.info('Removing theme', theme);
                        await removeTheme(theme);
                    } else {
                        logger.info('Adding theme', theme);
                        await addTheme(theme);
                    }
                } else {
                    logger.error('Unable to get purchase, leaving alone', theme);
                }
            }
        } catch (error) {
            logger.error('Unable to check purchases, leaving alone', theme, error);
        }
    }
}
