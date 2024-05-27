import { Language } from '../settings';
import { DatabaseData } from './saveFormat';

export type Languages = {
    [key in Language]: string;
}

export type BasicElement = {
    name: string;
    display: Languages;
    emoji: string;
    depth: number;
    first: number;
    who_discovered: string;
    base: number;
}

export type APIRecipe = {
    order: number;
    a: BasicElement;
    b: BasicElement;
    discovered: number;
    result: string;
    display: Languages;
    emoji: string;
    depth: number;
    first: number;
    who_discovered: string;
    base: number;
    custom: number;
    credits: number;
    creditAdjust: number;
}

export type Recipe = {
    order: number;
    a: BasicElement;
    b: BasicElement;
    discovered: number;
    result: string;
    display: Languages;
    emoji: string;
    depth: number;
    first: number;
    who_discovered: string;
    base: number;
    custom: number;
}

export type RecipeRow = {
    order: number;
    a: string;
    b: string;
    discovered: number;
    result: string;
    display: Languages;
    emoji: string;
    depth: number;
    first: number;
    who_discovered: string;
    hint_ignore?: boolean;
    base: number;
    custom: number;
}

export type RecipeElement = {
    name: string;
    display: Languages;
    emoji: string;
    sortDepth: number;
    sortOrder: number;
    base: boolean;
    first: boolean;
    recipes: Recipe[];
}

export type OrderDepth = {
    order: number;
    depth: number;
}

export type BaseFirst = {
    base: boolean;
    first: boolean;
}

export type SystemVersion = {
    version: string,
    arch: string,
    platform: string
}

export type AppVersions = {
    node: string,
    electron: string,
    chrome: string,
    app: string
}

export type FileVersions = {
    database: number,
    hint: number,
    stats: number,
    settings: number,
    databaseInfo: DatabaseData,
    databaseName: string
}

export const DEFAULT_FILE_VERSIONS: FileVersions = {
    database: -3,
    hint: -3,
    stats: -3,
    settings: -3,
    databaseName: 'unknown',
    databaseInfo: {
        type: 'base'
    }
};

export type TokenHolder = {
    token: string,
    steamId: string,
    expiryDate: number
}

export type TokenHolderResponse = {
    tokenHolder: TokenHolder,
    deprecated: boolean
}

export type CombineOutput = {
    type: 'success',
    result: CombineSuccess
} | {
    type: 'error',
    result: ServerError
}

export type PurchaseOutput = {
    type: 'success',
    result: PurchaseSuccess
} | {
    type: 'error',
    result: ServerError
}

export type ValidateOutput = {
    type: 'success',
    result: ValidateSuccess
} | {
    type: 'error',
    result: ServerError
}

export type UserOutput = {
    type: 'success',
    result: UserSuccess
} | {
    type: 'error',
    result: ServerError
}

export type GenericOutput = {
    type: 'success',
    result: GenericSuccess
} | {
    type: 'error',
    result: ServerError
}

export type GenericLoopable = {
    [key: string]: GenericLoopable | unknown
}

export type GenericSuccess = {
    success: boolean
    [key: string]: GenericLoopable | unknown
}

export type Success = {
    success: boolean
}

export type UserSuccess = Success & {
    user: {
        firstDiscoveries: number,
        combines: number,
        generations: number,
        credits: number,
        highestDepth: number,
        supporter: boolean,
        generateBanned: boolean,
        apiBanned: boolean
    }
}

export type ValidateSuccess = Success & {
    items: string[],
    languages: (Languages & {
        emoji: string,
        tokens: number,
        name: string
    })[]
}

export type PurchaseSuccess = Success & {
    softError: boolean
}

export type RedeemSuccess = Success & {
    redeemed: boolean
}

export type CombineSuccess = {
    responseCode: number,
    deprecated: boolean,
    hintAdded: boolean,
    newDiscovery: boolean,
    firstDiscovery: boolean,
    creditAdjust: number,
    recipe: Recipe
}

export type ServerError = {
    responseCode: number,
    deprecated: boolean,
    code: ServerErrorCode
}

export enum ServerErrorCode {
    NO_TOKEN = -10,
    QUERY_MISSING = 1,
    QUERY_INVALID = 2,
    QUERY_UNDEFINED = 3,
    AB_NOT_KNOWN = 4,
    STEAM_TICKET_INVALID = 5,
    TOKEN_EXPIRED = 6,
    STEAM_SERVERS_DOWN = 7,
    AB_NUMBER = 8,
    MAX_DEPTH = 9,
    STEAM_ERROR = 10,
    ITEM_UNKNOWN = 11,
    TRANSLATION_ERROR = 12,
}

export enum LocalErrorCode {
    UNKNOWN = 1001
}

export type ErrorCode = ServerErrorCode | LocalErrorCode;

export const ErrorCodeToString: {
    [key in ErrorCode]: string
} = {
    '-10': 'noToken',
    1: 'queryMissing',
    2: 'queryInvalid',
    3: 'queryUndefined',
    4: 'abNotKnown',
    5: 'steamTicketInvalid',
    6: 'tokenExpired',
    7: 'steamServersDown',
    8: 'abNumber',
    9: 'maxDepth',
    10: 'steamError',
    11: 'itemUnknown',
    12: 'translateError',
    1001: 'unknownError'
};

export type ErrorType = 'combine' | 'token' | 'item';

export type ErrorEntry = {
    a?: string,
    b?: string,
    result?: string,
    message?: string,
    type: ErrorType,
    code: ErrorCode,
    date: Date,
}

export type ErrorEntryAdd = Omit<ErrorEntry, 'date'>

export type SoundFile = 'new-discovery' | 'first-discovery' | 'pickup' | 'side-drop' | 'drop' | 'reset' | 'click1' | 'click2'

export const SoundFiles: SoundFile[] = ['first-discovery', 'new-discovery', 'pickup', 'side-drop', 'drop', 'reset', 'click1', 'click2'];

export const SUPPORTER_DLC = 2911170;
export const HINT_DLC = 2920230;

export const LATEST_SERVER_VERSION = 2;