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
    base: number;
}
