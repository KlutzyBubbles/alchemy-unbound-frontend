export type BasicElement = {
    name: string;
    display: {
        english: string,
        japanese: string,
        schinese: string,
        french: string,
        russian: string,
        spanish: string,
    };
    emoji: string;
}

export type Recipe = {
    a: BasicElement;
    b: BasicElement;
    result: string;
    display: {
        english: string,
        japanese: string,
        schinese: string,
        french: string,
        russian: string,
        spanish: string,
    };
    emoji: string;
    depth: number;
    who_discovered: string;
    base: number;
}

export type RecipeRow = {
    a: string;
    b: string;
    result: string;
    display: {
        english: string,
        japanese: string,
        schinese: string,
        french: string,
        russian: string,
        spanish: string,
    };
    emoji: string;
    depth: number;
    who_discovered: string;
    base: number;
}

export type RawRecipeRow = {
    a: string;
    b: string;
    result: string;
    display: {
        english: string,
        japanese: string,
        schinese: string,
        french: string,
        russian: string,
        spanish: string,
    };
    emoji: string;
    depth: number;
    who_discovered: string;
    base: number;
}

export type RecipeElement = {
    name: string;
    display: {
        english: string,
        japanese: string,
        schinese: string,
        french: string,
        russian: string,
        spanish: string,
    };
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
