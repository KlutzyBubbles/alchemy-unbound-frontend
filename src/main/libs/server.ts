import logger from 'electron-log/main';
import { CombineOutput, ServerErrorCode, Recipe, TokenHolder, TokenHolderResponse, PurchaseOutput, PurchaseSuccess, ValidateOutput, UserOutput, RedeemSuccess, GenericSuccess, GenericOutput, APIRecipe, MissionOutput, MissionAPISuccess, MissionCheckOutput, APIMissionCheck, UserSuccess, RedeemBulkSuccess, ServerError } from '../../common/types';
import { getDatabaseInfo, getPlaceholderOrder, getRecipe, getRecipesForLanguage, insertRecipeRow, serverVersion, setDiscovered, traverseAndFill } from './database/recipeStore';
import { getAppVersion, isPackaged } from './generic';
import { getSettings } from './settings';
import { getSteamGameLanguage, getSteamworksClient, getWebAuthTicket } from './steam';
import fetch, { HeadersInit, Response } from 'electron-fetch';
import { TxnItems } from '../../common/server';
import { addTheme, removeTheme } from './info';
import { Language } from '../../common/settings';
import { MissionLevelStore, MissionStore, MissionType } from '../../common/types/saveFormat';
import { addCombine, getMissionStore, setComplete, setMissionStore } from './database/missionStore';
import { MissionDifficulty, missionRewards } from '../../common/mission';
import { delay } from '../../common/utils';

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
endpoint = 'https://alchemy-unbound-prerelease-b687af701d77.herokuapp.com';
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
        if (token.expiryDate < ((new Date()).getTime() + 300000) / 1000) {
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
        '/v2/purchase/check',
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

export async function checkAndRedeemBulk(items: string[]): Promise<{
    type: 'success',
    result: {
        item: string,
        success: boolean,
        softError: boolean
    }[]
} | {
    type: 'error',
    result: ServerError
}>  {
    logger.silly('checkAndRedeemBulk', items);
    const result = await apiRequest(
        'POST',
        '/v2/purchase/check',
        undefined,
        {
            items
        },
        true
    );
    if (result.type === 'success') {
        const body: RedeemBulkSuccess = result.result as RedeemBulkSuccess;
        const resultItems: {
            item: string,
            success: boolean,
            softError: boolean
        }[] = [];
        if (body.success) {
            logger.log('inside success');
            for (const returned of body.items) {
                if (!returned.redeemed) {
                    const redeem = await redeemItem(returned.item);
                    if (redeem.type === 'error') {
                        resultItems.push({
                            item: returned.item,
                            success: false,
                            softError: true
                        });
                        continue;
                    }
                    resultItems.push({
                        item: returned.item,
                        success: true,
                        softError: false
                    });
                }
            }
            return {
                type: 'success',
                result: resultItems
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
    const databaseType = (await getDatabaseInfo()).type;
    let mission: MissionStore | undefined = undefined;
    try {
        const tempResult = databaseType === 'daily' || databaseType === 'weekly' ? await getMission(databaseType) : undefined;
        if (tempResult !== undefined && tempResult.type === 'success') {
            mission = tempResult.result;
        } else {
            logger.error('Cannot get mission 1 from sub', tempResult);
            mission = undefined;
        }
    } catch(e) {
        logger.error('Cannot get mission 1', e);
        mission = undefined;
    }
    if (mission !== undefined) {
        addCombine(databaseType as MissionType);
    }
    let newDiscovery = false;
    let firstDiscovery = false;
    let missionComplete = false;
    if (exists !== undefined) {
        const hintAdded = await setDiscovered(exists.a.name, exists.b.name, true);
        if (!exists.discovered)
            newDiscovery = true;
        exists.discovered = 1;
        if (mission !== undefined) {
            console.log('mission existis recipe', exists);
            for (const key of Object.keys(missionRewards)) {
                const item = mission[key as MissionDifficulty];
                if (item.name === exists.result) {
                    if (!item.complete) {
                        const temp = await submitMission(a, b, exists.result, databaseType as MissionType, mission.combines + 1);
                        if (temp.type === 'success') {
                            missionComplete = true;
                        }
                    } else {
                        missionComplete = true;
                    }
                }
            }
            await addCombine(databaseType as MissionType);
        }
        return {
            type: 'success',
            result: {
                responseCode: 200,
                deprecated: false,
                hintAdded,
                newDiscovery,
                firstDiscovery,
                recipe: exists,
                missionComplete,
                creditAdjust: 0
            }
        };
    } else {
        const isCustom = databaseType === 'custom';
        if (!isCustom && (await getSettings(false)).offline) {
            return undefined;
        }
        const result = await apiRequest(
            'GET',
            `/v${isCustom ? '2' : serverVersion}/${isCustom ? 'custom' : 'api'}`,
            {
                a,
                b
            },
            undefined,
            false
        );
        if (result.type === 'success') {
            const body: APIRecipe = result.result as unknown as APIRecipe;
            newDiscovery = true;
            firstDiscovery = body.first ? true : false;
            if (mission !== undefined) {
                for (const key of Object.keys(missionRewards)) {
                    const item = mission[key as MissionDifficulty];
                    if (item.name === body.result) {
                        if (!item.complete) {
                            const temp = await submitMission(a, b, body.result, databaseType as MissionType, mission.combines + 1);
                            if (temp.type === 'success') {
                                missionComplete = true;
                            }
                        } else {
                            missionComplete = true;
                        }
                    }
                }
                await addCombine(databaseType as MissionType);
            }
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
                    base: body.base ? 1 : 0,
                    custom: body.custom ? 1 : 0
                });
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery,
                        firstDiscovery,
                        missionComplete,
                        recipe: traverseAndFill(recipeRow),
                        creditAdjust: body.creditAdjust
                    }
                };
            } catch(e) {
                logger.error('Failed to insert recipe 1', e);
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery,
                        firstDiscovery,
                        missionComplete,
                        recipe: traverseAndFill({
                            order: getPlaceholderOrder(),
                            a: a,
                            b: b,
                            result: body.result,
                            discovered: 1,
                            depth: body.depth,
                            first: body.first ? 1 : 0,
                            who_discovered: body.who_discovered,
                            base: body.base ? 1 : 0,
                            custom: body.custom ? 1 : 0
                        }),
                        creditAdjust: body.creditAdjust
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

// Returns undefined if no mission is available
export async function submitMission(a: string, b: string, result: string, type: MissionType, combines: number): Promise<MissionCheckOutput | undefined> {
    logger.silly('submitMission', a, b, result, type, combines);
    const databaseType = (await getDatabaseInfo()).type;
    let mission: MissionStore | undefined = undefined;
    try {
        const tempResult = databaseType === 'daily' || databaseType === 'weekly' ? await getMission(databaseType) : undefined;
        if (tempResult !== undefined && tempResult.type === 'success') {
            mission = tempResult.result;
        } else {
            logger.error('Cannot get mission 2 from sub', tempResult);
            mission = undefined;
        }
    } catch(e) {
        logger.error('Cannot get mission 2', e);
        mission = undefined;
    }
    if (mission === undefined) {
        return undefined;
    }
    let knownLevel: MissionDifficulty | undefined = undefined;
    let knownItem: MissionLevelStore | undefined = undefined;
    for (const key of Object.keys(missionRewards)) {
        const item = mission[key as MissionDifficulty];
        if (item.name === result) {
            knownLevel = key as MissionDifficulty;
            knownItem = item;
            break;
        }
    }
    if (knownLevel === undefined || knownItem === undefined) {
        throw new Error('Unable to verify which level was complete');
    }
    if (knownItem.complete) {
        return {
            type: 'success',
            result: {
                responseCode: 200,
                deprecated: false,
                points: 0,
                level: knownLevel
            }
        };
    }
    const apiResult = await apiRequest(
        'GET',
        '/v2/mission/check',
        {
            a,
            b,
            result,
            type,
            combines
        },
        undefined,
        true
    );
    if (apiResult.type === 'success') {
        const body: APIMissionCheck = apiResult.result as unknown as APIMissionCheck;
        await setComplete(type, knownLevel, true);
        return {
            type: 'success',
            result: {
                responseCode: 200,
                deprecated: false,
                points: body.points,
                level: knownLevel
            }
        };
    } else {
        if (apiResult.result.code === ServerErrorCode.ALREADY_COMPLETED) {
            await setComplete(type, knownLevel, true);
            return {
                type: 'success',
                result: {
                    responseCode: 200,
                    deprecated: false,
                    points: 0,
                    level: knownLevel
                }
            };
        }
        return apiResult;
    }
}

export async function addItem(result: string, language: Language): Promise<CombineOutput | undefined> {
    logger.silly('addItem', result, language);
    if ((await getDatabaseInfo()).type !== 'custom') {
        throw new Error('Database isnt in custom mode');
    }
    let exists: Recipe[] = [];
    try {
        exists = await getRecipesForLanguage(result, language);
    } catch(e) {
        logger.error('Cannot get recipe', e);
        exists = [];
    }
    if (exists.length > 0) {
        exists = exists.sort((a, b) => a.depth - b.depth);
        return {
            type: 'success',
            result: {
                responseCode: 200,
                deprecated: false,
                hintAdded: false,
                newDiscovery: false,
                firstDiscovery: false,
                missionComplete: false,
                creditAdjust: 0,
                recipe: exists[0]
            }
        };
    } else {
        const apiResult = await apiRequest(
            'PUT',
            '/v2/custom',
            {
                result,
                language
            },
            undefined,
            true
        );
        if (apiResult.type === 'success') {
            const body: APIRecipe = apiResult.result as unknown as APIRecipe;
            
            try {
                const recipeRow = await insertRecipeRow({
                    a: '',
                    b: '',
                    result: body.result,
                    discovered: 1,
                    display: body.display,
                    emoji: body.emoji,
                    depth: body.depth,
                    first: body.first ? 1 : 0,
                    who_discovered: body.who_discovered,
                    base: body.base ? 1 : 0,
                    custom: body.custom ? 1 : 0
                });
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery: false,
                        firstDiscovery: false,
                        missionComplete: false,
                        recipe: traverseAndFill(recipeRow),
                        creditAdjust: body.creditAdjust
                    }
                };
            } catch(e) {
                logger.error('Failed to insert recipe 2', e);
                return {
                    type: 'success',
                    result: {
                        responseCode: 200,
                        deprecated: false,
                        hintAdded: false,
                        newDiscovery: false,
                        firstDiscovery: false,
                        missionComplete: false,
                        recipe: traverseAndFill({
                            order: getPlaceholderOrder(),
                            a: '',
                            b: '',
                            result: body.result,
                            discovered: 1,
                            depth: body.depth,
                            first: body.first ? 1 : 0,
                            who_discovered: body.who_discovered,
                            base: body.base ? 1 : 0,
                            custom: body.custom ? 1 : 0
                        }),
                        creditAdjust: body.creditAdjust
                    }
                };
            }
        } else {
            if (apiResult.result.code === ServerErrorCode.AB_NOT_KNOWN) {
                throw('Items are not known, have these been synced with the server?');
            } else {
                return apiResult;
            }
        }
    }
}

export async function getMission(type: MissionType): Promise<MissionOutput> {
    logger.silly('getMission', type);
    let existing: MissionStore = undefined;
    // let addTime = 24 * 60 * 60 * 1000;
    // let addTime = 60 * 60 * 1000;
    // if (type === 'weekly') {
    //     addTime *= 7;
    // }
    const currentDate = new Date();
    try {
        existing = await getMissionStore(type);
    } catch(e) {
        logger.error('Cannot get mission', e);
        existing = undefined;
    }
    logger.silly('Existing mission', existing);
    if (existing !== undefined) {
        logger.silly('Expiry Check', existing.expires, currentDate.getTime());
        if (existing.expires <= currentDate.getTime()) {
            logger.silly('Expiry expired');
            // Expired
            setMissionStore(type, undefined);
            existing = undefined;
        } else {
            logger.silly('Returning existing');
            return {
                type: 'success',
                result: {
                    ...existing,
                    refreshed: false
                }
            };
        }
    }
    const apiResult = await apiRequest(
        'GET',
        `/v2/mission/${type}`,
        undefined,
        undefined,
        false
    );
    if (apiResult.type === 'success') {
        const body: MissionAPISuccess = apiResult.result as unknown as MissionAPISuccess;

        const formatted: MissionStore = {
            // success: body.success,
            combines: 0,
            expires: body.expires,
            easy: {
                complete: false,
                ...body.easy
            },
            medium: {
                complete: false,
                ...body.medium
            },
            hard: {
                complete: false,
                ...body.hard
            },
            random: {
                complete: false,
                ...body.random
            }
        };

        try {
            await setMissionStore(type, formatted);
            return {
                type: 'success',
                result: {
                    ...formatted,
                    refreshed: true
                }
            };
        } catch(e) {
            logger.error('Failed to set mission store', e, formatted, body);
            return {
                type: 'success',
                result: {
                    ...formatted,
                    refreshed: true
                }
            };
        }
    } else {
        return apiResult;
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

let userDetails: {
    details: UserSuccess,
    howRecent: number
} | undefined = undefined;

export async function getUserDetails(): Promise<UserOutput> {
    logger.silly('getUserDetails');
    if (userDetails === undefined) {
        const apiResult = await apiRequest(
            'GET',
            '/v2/session/user',
            undefined,
            undefined,
            false
        ) as UserOutput;
        if (apiResult.type === 'success') {
            const body: UserSuccess = apiResult.result as UserSuccess;
            userDetails = {
                details: body,
                howRecent: new Date().getTime()
            };
        }
        return apiResult;
    } else {
        logger.debug('Expiry dates', userDetails.howRecent, ((new Date()).getTime() + 60000));
        if (userDetails.howRecent + 60000 < (new Date()).getTime()) {
            const apiResult = await apiRequest(
                'GET',
                '/v2/session/user',
                undefined,
                undefined,
                false
            ) as UserOutput;
            if (apiResult.type === 'success') {
                const body: UserSuccess = apiResult.result as UserSuccess;
                userDetails = {
                    details: body,
                    howRecent: new Date().getTime()
                };
            }
            return apiResult;
        } else {
            return {
                type: 'success',
                result: userDetails.details
            };
        }
    }
}

export async function checkDLC(): Promise<UserOutput> {
    logger.silly('checkDLC');
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
    tokenRequired: boolean = false,
    cooloff: boolean = false
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
            return {
                type: 'success',
                result: body
            };
        } else {
            logger.warn('Error making request', response.status, response.body);
            if (response.status === 429) {
                // Rate limited
                if (!cooloff) {
                    await delay(500);
                    return apiRequest(method, path, queryParams, body, tokenRequired, true);
                }
            }
            const json = (await response.json()) as RequestErrorResult;
            logger.warn('Error making request body format', json);
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

export async function restorePurchases(): Promise<boolean> {
    logger.silly('restorePurchases');
    let hasErrors = false;
    const themes = ['themeOrange', 'themePurple', 'themeSand', 'themePink', 'themeBlue'];
    try {
        const result = await checkAndRedeemBulk(themes);
        if (result.type === 'error') {
            hasErrors = true;
        } else {
            const items = result.result.filter((item) => item.success).map((item) => item.item);
            for (const theme of themes) {
                if (!items.includes(theme)) {
                    logger.info('Removing theme', theme);
                    await removeTheme(theme);
                } else {
                    logger.info('Adding theme', theme);
                    await addTheme(theme);
                }
            }
        }
    } catch (error) {
        logger.error('Unable to check purchases, leaving alone', themes, error);
        hasErrors = true;
    }
    // for (const theme of ['themeOrange', 'themePurple', 'themeSand', 'themePink', 'themeBlue']) {
    //     try {
    //         const result = await checkAndRedeem(theme);
    //         if (result === undefined) {
    //             logger.info('Removing theme', theme);
    //             await removeTheme(theme);
    //         } else {
    //             if (result.type === 'success') {
    //                 if (!result.result.success) {
    //                     logger.info('Removing theme', theme);
    //                     await removeTheme(theme);
    //                 } else {
    //                     logger.info('Adding theme', theme);
    //                     await addTheme(theme);
    //                 }
    //             } else {
    //                 logger.error('Unable to get purchase, leaving alone', theme);
    //                 hasErrors = true;
    //             }
    //         }
    //     } catch (error) {
    //         logger.error('Unable to check purchases, leaving alone', theme, error);
    //         hasErrors = true;
    //     }
    // }
    return !hasErrors;
}
