import { Language } from './settings';

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
    base: number;
}

export type RecipeElement = {
    name: string;
    display: Languages;
    emoji: string;
    recipes: Recipe[];
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
    result: CombineError
}

export type CombineSuccess = {
    responseCode: number,
    deprecated: boolean,
    hintAdded: boolean,
    newDiscovery: boolean,
    firstDiscovery: boolean,
    recipe: Recipe
}

export type CombineError = {
    responseCode: number,
    deprecated: boolean,
    code: ServerErrorCode
}

export enum ServerErrorCode {
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

export type ErrorType = 'combine' | 'token';

export type ErrorEntry = {
    a?: string,
    b?: string,
    message?: string,
    type: ErrorType,
    code: ErrorCode,
    date: Date,
}

export type ErrorEntryAdd = Omit<ErrorEntry, 'date'>

export type SoundFile = 'new-discovery' | 'first-discovery' | 'pickup' | 'side-drop' | 'drop' | 'reset'

export const SoundFiles: SoundFile[] = ['first-discovery', 'new-discovery', 'pickup', 'side-drop', 'drop', 'reset'];

export const SUPPORTER_DLC = 2911170;
export const HINT_DLC = 2920230;
