import { Languages } from '.';

export type LanguageRecord = Languages & {
    emoji: string
}

export type LanguageRecords = {
    [key: string]: LanguageRecord
}

export type RecipeRecordV3 = {
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

export type RecipeRecord = RecipeRecordV3 & {
    custom: number;
}

export type DatabaseType = 'base' | 'daily' | 'weekly' | 'custom'

export type DatabaseData = {
    type: DatabaseType,
    expiry?: Date,
}

export enum FileVersionError {
    UNKOWN_VERSION = -1,
    ERROR = -2
}
