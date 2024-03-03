export type Recipe = {
    a: string;
    b: string;
    result: string;
    display: string;
    emoji: string;
    depth: number;
    who_discovered: string;
    base: number;
}

export type RecipeElement = {
    name: string;
    display: string;
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
