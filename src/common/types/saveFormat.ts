import { APILanguage, Languages } from '.';
import { MissionDifficulty } from '../mission';

export type LanguageRecord = Languages & {
    emoji: string
}

export type LanguageRecords = {
    [key: string]: LanguageRecord
}

export type MissionType = 'daily' | 'weekly'

export type MissionStores = {
    [key in MissionType]?: MissionStore
}

export type MissionLevelStore = APILanguage & {
    complete: boolean
}

export type MissionStore = {
    [key in MissionDifficulty]: MissionLevelStore
} & {
    expires: number,
    combines: number
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
    expires?: number,
}

export enum FileVersionError {
    UNKOWN_VERSION = -1,
    ERROR = -2,
    NOT_LOADED = -3,
    NO_VERSION = -4,
    TYPE_DEFAULT = -5,
    DEFAULTS = -5
}
