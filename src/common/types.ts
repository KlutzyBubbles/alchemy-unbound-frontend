import { Language } from './settings';

export type Languages = {
    [key in Language]: string;
}

export type BasicElement = {
    name: string;
    display: Languages;
    emoji: string;
}

export type Recipe = {
    a: BasicElement;
    b: BasicElement;
    result: string;
    display: Languages;
    emoji: string;
    depth: number;
    who_discovered: string;
    base: number;
}

export type RecipeRow = {
    a: string;
    b: string;
    result: string;
    display: Languages;
    emoji: string;
    depth: number;
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
