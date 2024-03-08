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

export enum ErrorCode {
    QUERY_MISSING = 1,
    QUERY_INVALID = 2,
    QUERY_UNDEFINED = 3,
    AB_NOT_KNOWN = 4,
    STEAM_TICKET_INVALID = 5,
    TOKEN_EXPIRED = 6,
    STEAM_SERVERS_DOWN = 7
}
