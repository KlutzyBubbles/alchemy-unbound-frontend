import { Languages } from '.';

export type LanguageRecord = Languages & {
    emoji: string
}

export type LanguageRecords = {
    [key: string]: LanguageRecord
}

export type RecipeRecord = {
    order: number;
    a: string;
    b: string;
    discovered: number;
    result: string;
    depth: number;
    first: number;
    who_discovered: string;
    hint_ignore?: boolean;
    has_language?: boolean;
    valid_language?: boolean;
    base: number;
}

export type DatabaseData = {
    type: 'base' | 'daily' | 'weekly' | 'custom',
    expiry?: Date,
}

export enum FileVersionError {
    UNKOWN_VERSION = -1,
    ERROR = -2
}
