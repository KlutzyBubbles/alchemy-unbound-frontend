import logger from 'electron-log/main';
import { CombineOutput, ServerErrorCode, Recipe, TokenHolder, TokenHolderResponse, PurchaseOutput, PurchaseSuccess, ValidateOutput, ValidateSuccess } from '../../common/types';
import { getPlaceholderOrder, getRecipe, insertRecipeRow, serverVersion, setDiscovered, traverseAndFill } from './database/recipeStore';
import { getAppVersion, isPackaged } from './generic';
import { getSettings } from './settings';
import { getSteamGameLanguage, getSteamworksClient, getWebAuthTicket } from './steam';
import fetch, { HeadersInit, Response } from 'electron-fetch';

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
    if (token === undefined) {
        return await createToken();
    } else {
        logger.debug('Expiry dates', token.expiryDate, ((new Date()).getTime() + 600000) / 1000);
        if (token.expiryDate < ((new Date()).getTime() + 600000) / 1000) {
            let response: Response | undefined = undefined;
            try {
                logger.debug('token request url', `${getEndpointUri()}/session/v${serverVersion}?version=${getAppVersion()}`, token.token);
                response = await fetch(`${getEndpointUri()}/session/v${serverVersion}?version=${getAppVersion()}`, {
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

export async function initTransaction(item: string): Promise<PurchaseOutput | undefined> {
    if (!(await getSettings(false)).offline) {
        return new Promise<PurchaseOutput>((resolve, reject) => {
            (async () => {
                let tokenResponse: TokenHolderResponse | undefined = undefined;
                try {
                    tokenResponse = await getToken();
                } catch (e) {
                    logger.error('Failed to get token response', e);
                }
                if (tokenResponse === undefined) {
                    // Cant initiate transaction without steam token
                    logger.error('Cannot find token response');
                    return {
                        type: 'error',
                        result: {
                            code: ServerErrorCode.NO_TOKEN,
                            deprecated: false,
                            responseCode: 400
                        }
                    };
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
                            let tokenResponse: TokenHolderResponse | undefined = undefined;
                            try {
                                tokenResponse = await getToken();
                            } catch (e) {
                                logger.error('Failed to get token response', e);
                            }
                            if (tokenResponse === undefined) {
                                // Cant initiate transaction without steam token
                                logger.error('Cannot find token response');
                                return {
                                    type: 'error',
                                    result: {
                                        code: ServerErrorCode.NO_TOKEN,
                                        deprecated: false,
                                        responseCode: 400
                                    }
                                };
                            }
                            const url = `${getEndpointUri()}/purchase/finalize/v2/?version=${getAppVersion()}&orderid=${value.order_id}`;
                            let hasDeprecated = false;
                            const headers: HeadersInit = {
                                'Content-Type': 'application/json'
                            };
                            hasDeprecated = tokenResponse.deprecated;
                            if (tokenResponse.tokenHolder !== undefined) {
                                headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
                            }
                            try {
                                logger.debug('purchase finalize url', url, headers.Authorization);
                                const response = await fetch(url, {
                                    method: 'GET',
                                    headers: headers,
                                    timeout: TIMEOUT
                                });
                                if (response.ok) {
                                    const body: PurchaseSuccess = (await response.json()) as PurchaseSuccess;
                                    logger.debug('purchase finalize response body', body);
                                    if (body.success) {
                                        logger.log('inside success');
                                        return {
                                            type: 'success',
                                            result: body
                                        };
                                    } else {
                                        return {
                                            type: 'error',
                                            result: {
                                                code: ServerErrorCode.QUERY_INVALID,
                                                deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                                                responseCode: 500
                                            }
                                        };
                                    }
                                } else {
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
                        })().then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
                    });
                }).then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
                const url = `${getEndpointUri()}/purchase/v2?version=${getAppVersion()}&item=${item}`;
                let hasDeprecated = false;
                const headers: HeadersInit = {
                    'Content-Type': 'application/json'
                };
                hasDeprecated = tokenResponse.deprecated;
                if (tokenResponse.tokenHolder !== undefined) {
                    headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
                }
                try {
                    logger.debug('purchase url', url, headers.Authorization);
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: headers,
                        timeout: TIMEOUT
                    });
                    if (response.ok) {
                        const body: PurchaseSuccess = (await response.json()) as PurchaseSuccess;
                        logger.debug('purchase response body', body);
                        if (!body.success) {
                        //     return {
                        //         type: 'success',
                        //         result: body
                        //     };
                        // } else {
                            return {
                                type: 'error',
                                result: {
                                    code: ServerErrorCode.QUERY_INVALID,
                                    deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                                    responseCode: 500
                                }
                            };
                        }
                        logger.log('first success');
                        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
                        await delay(10 * 60 * 60 * 1000);
                        logger.log('after delayt');
                        return {
                            type: 'error',
                            result: {
                                responseCode: ServerErrorCode.QUERY_UNDEFINED,
                                deprecated: false,
                                code: -1
                            }
                        };
                    } else {
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
            })().then((result) => resolve(result as PurchaseOutput)).catch((error) => reject(error));
        });
    } else {
        logger.log('undefineeed');
        return undefined;
    }
}

async function createToken(): Promise<TokenHolderResponse> {
    const ticket = await getWebAuthTicket();
    logger.debug('trying to get token', `${getEndpointUri()}/session/v${serverVersion}?version=${getAppVersion()}&steamToken=${ticket.getBytes().toString('hex')}`);
    let response: Response | undefined = undefined;
    try {
        response = await fetch(`${getEndpointUri()}/session/v${serverVersion}?version=${getAppVersion()}&steamToken=${ticket.getBytes().toString('hex')}&steamLanguage=${getSteamGameLanguage()}`, {
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

// Returns undefined if in offline mode.
export async function combine(a: string, b: string): Promise<CombineOutput | undefined> {
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
        if (!(await getSettings(false)).offline) {
            let tokenResponse: TokenHolderResponse | undefined = undefined;
            try {
                tokenResponse = await getToken();
            } catch (e) {
                logger.error('Failed to get token response', e);
            }
            const url = `${getEndpointUri()}/api/v${serverVersion}?version=${getAppVersion()}&a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
            let hasDeprecated = false;
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (tokenResponse !== undefined) {
                hasDeprecated = tokenResponse.deprecated;
                if (tokenResponse.tokenHolder !== undefined) {
                    headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
                }
            }
            try {
                logger.debug('combine url', url, headers.Authorization);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers,
                    timeout: TIMEOUT
                });
                if (response.ok) {
                    const body: Recipe = (await response.json()) as Recipe;
                    logger.debug('combine response body', body);
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
                                responseCode: response.status,
                                deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
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
                                responseCode: response.status,
                                deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
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
                    const json = (await response.json()) as RequestErrorResult;
                    if ([ServerErrorCode.QUERY_MISSING, ServerErrorCode.QUERY_INVALID, ServerErrorCode.QUERY_UNDEFINED].includes(json.code)) {
                        throw('Unknown issue with input a/b');
                    } else if (json.code === ServerErrorCode.AB_NOT_KNOWN) {
                        // TODO Need to add server method to rectify this
                        throw('Items are not known, have these been synced with the server?');
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
        } else {
            return undefined;
        }
    }
}

export async function submitIdea(a: string, b: string, result: string): Promise<CombineOutput | undefined> {
    if (!(await getSettings(false)).offline) {
        const recipe: Recipe = {
            order: 0,
            a: {
                name: a,
                display: undefined,
                emoji: '❓',
                depth: 0,
                first: 0,
                who_discovered: '',
                base: 0
            },
            b: {
                name: b,
                display: undefined,
                emoji: '❓',
                depth: 0,
                first: 0,
                who_discovered: '',
                base: 0
            },
            discovered: 0,
            result: result,
            display: undefined,
            emoji: '❓',
            depth: 0,
            first: 0,
            who_discovered: '',
            base: 0
        };
        let tokenResponse: TokenHolderResponse | undefined = undefined;
        try {
            tokenResponse = await getToken();
        } catch (e) {
            logger.error('Failed to get token response', e);
        }
        const url = `${getEndpointUri()}/idea/v1?version=${getAppVersion()}&a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}&result=${encodeURIComponent(result)}`;
        let hasDeprecated = false;
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (tokenResponse !== undefined) {
            hasDeprecated = tokenResponse.deprecated;
            if (tokenResponse.tokenHolder !== undefined) {
                headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
            }
        }
        try {
            logger.debug('idea url', url, headers.Authorization);
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                timeout: TIMEOUT
            });
            if (response.ok) {
                const body: Recipe = (await response.json()) as Recipe;
                logger.debug('combine response body', body);
                return {
                    type: 'success',
                    result: {
                        responseCode: response.status,
                        deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                        hintAdded: false,
                        newDiscovery: false,
                        firstDiscovery: false,
                        recipe: recipe
                    }
                };
            } else {
                const json = (await response.json()) as RequestErrorResult;
                if ([ServerErrorCode.QUERY_MISSING, ServerErrorCode.QUERY_INVALID, ServerErrorCode.QUERY_UNDEFINED].includes(json.code)) {
                    throw('Unknown issue with input a/b/result');
                } else if (json.code === ServerErrorCode.MAX_DEPTH) {
                    // TODO Need to add server method to rectify this
                    logger.debug('Idea already exists');
                    return {
                        type: 'success',
                        result: {
                            responseCode: response.status,
                            deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                            hintAdded: false,
                            newDiscovery: false,
                            firstDiscovery: false,
                            recipe: recipe
                        }
                    };
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
    } else {
        return undefined;
    }
}

export async function validateItems(items: string[]): Promise<ValidateOutput | undefined> {
    if (!(await getSettings(false)).offline) {
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
        let tokenResponse: TokenHolderResponse | undefined = undefined;
        try {
            tokenResponse = await getToken();
        } catch (e) {
            logger.error('Failed to get token response', e);
        }
        if (tokenResponse === undefined) {
            // Cant initiate transaction without steam token
            logger.error('Cannot find token response');
            return {
                type: 'error',
                result: {
                    code: ServerErrorCode.NO_TOKEN,
                    deprecated: false,
                    responseCode: 400
                }
            };
        }
        const url = `${getEndpointUri()}/validate/v2?version=${getAppVersion()}`;
        let hasDeprecated = false;
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        hasDeprecated = tokenResponse.deprecated;
        if (tokenResponse.tokenHolder !== undefined) {
            headers.Authorization = `Bearer ${tokenResponse.tokenHolder.token}`;
        }
        try {
            logger.debug('validate url', url, headers.Authorization);
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                timeout: TIMEOUT,
                body: JSON.stringify({
                    items: items,
                    includeLanguage: 'true'
                })
            });
            if (response.ok) {
                const body: ValidateSuccess = (await response.json()) as ValidateSuccess;
                logger.debug('validate response body', body);
                if (body.success) {
                    return {
                        type: 'success',
                        result: body
                    };
                } else {
                    return {
                        type: 'error',
                        result: {
                            code: ServerErrorCode.QUERY_INVALID,
                            deprecated: hasDeprecated ? true : response.headers.has('Api-Deprecated'),
                            responseCode: 500
                        }
                    };
                }
            } else {
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
    } else {
        logger.log('undefineeed');
        return undefined;
    }
}
