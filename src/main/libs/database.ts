import { BasicElement, LATEST_SERVER_VERSION, Languages, Recipe, RecipeRow } from '../../common/types';
import { promises as fs } from 'fs';
import { Compressed, compress, decompress } from 'compress-json';
import { getFolder } from './steam';
import { verifyFolder } from '../utils';
import { languages } from '../../common/settings';
import baseData from '../../base.json';
// import baseData from '../../allDiscovered.json';
import logger from 'electron-log/main';
import { addHintPoint, resetHint } from './hints';

const DATABASE_VERISON = 2;

export let data: RecipeRow[] = [];
export let serverVersion: number = 1;
let loadedVersion: number = -2;
let databaseOrder = 0;

export function getDatabaseVersion(): number {
    return loadedVersion;
}

export function getPlaceholderOrder(): number {
    const temp = databaseOrder;
    databaseOrder++;
    return temp;
}

export function setServerVersion(version: number) {
    serverVersion = version;
}

async function saveDatabaseToFile(filename: string, fullpath = false) {
    await fs.writeFile(fullpath ? filename : getFolder() + filename, JSON.stringify(getDatabaseSaveFormat()), 'utf-8');
}

export function getDatabaseSaveFormat() {
    return {
        version: DATABASE_VERISON,
        data: compress(data.filter((item) => item.discovered)),
        server: serverVersion
    };
}

export async function save(): Promise<void> {
    await verifyFolder();
    await saveDatabaseToFile('db.json');
}

export async function setDataRaw(newData: RecipeRow[]) {
    data = newData;
    await save();
}

export function loadDatabaseV1(loaded: Record<string, unknown>[]): RecipeRow[] {
    return loaded as RecipeRow[];
}

export async function loadDatabaseV2(loaded: Compressed): Promise<RecipeRow[]> {
    const tempData = decompress(loaded) as RecipeRow[];
    const baseClone: RecipeRow[] = structuredClone(baseData);
    const newData: RecipeRow[] = [];
    let backup = false;
    for (const baseItem of baseClone) {
        let matchedItem: RecipeRow | undefined = undefined;
        if (baseItem.a === '' && baseItem.b === '') {
            for (const tempItem of tempData) {
                if ((tempItem.a === baseItem.a && tempItem.b === baseItem.b) && tempItem.result === baseItem.result) {
                    matchedItem = tempItem;
                    break;
                }
            }
        } else {
            for (const tempItem of tempData) {
                if ((tempItem.a === baseItem.a && tempItem.b === baseItem.b) || (tempItem.a === baseItem.b && tempItem.b === baseItem.a)) {
                    matchedItem = tempItem;
                    break;
                }
            }
        }
        if (matchedItem === undefined) {
            newData.push(baseItem);
        } else {
            if (matchedItem.result !== baseItem.result) {
                if (baseItem.a !== '' && baseItem.b !== '') {
                    logger.debug('Matched items dont match', matchedItem, baseItem);
                    baseItem.discovered = 1;
                    newData.push(baseItem);
                    backup = true;
                } else {
                    newData.push(matchedItem);
                }
            } else {
                newData.push(matchedItem);
            }
        }
    }
    for (const tempItem of tempData) {
        let matchedItem: boolean = false;
        for (const baseItem of baseClone) {
            if ((tempItem.a === baseItem.a && tempItem.b === baseItem.b) || (tempItem.a === baseItem.b && tempItem.b === baseItem.a)) {
                matchedItem = true;
                break;
            }
        }
        if (!matchedItem) {
            newData.push(tempItem);
        }
    }
    if (backup) {
        const holdData = data;
        data = tempData;
        await saveDatabaseToFile(`db_itemchange_${Math.floor((new Date()).getTime() / 1000)}.backup`);
        data = holdData;
    }
    return newData;
}

async function loadData(): Promise<RecipeRow[]> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'db.json', 'utf-8'));
        serverVersion = raw.server;
        if (serverVersion === undefined) {
            serverVersion = 1;
        }
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        if (raw.version === 1) {
            return loadDatabaseV1(raw.data);
        } else if (raw.version === 2) {
            return loadDatabaseV2(raw.data);
        } else {
            loadedVersion = -1;
            serverVersion = LATEST_SERVER_VERSION;
            logger.error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
        loadedVersion = -2;
        serverVersion = LATEST_SERVER_VERSION;
        if (e.code === 'ENOENT') {
            logger.info('No database file found, returning blank data');
            // const raw: RecipeRow[] = JSON.parse(await fs.readFile(MAIN_WINDOW_WEBPACK_ENTRY + '/base.json', 'utf-8'));
            // return baseData as RecipeRow[];
            return [];
        } else {
            logger.error(`Failed to read database file with error ${e.code}`);
            throw e;
        }
    }
}

export async function createDatabase(): Promise<void> {
    try {
        // RELEASE --------------------------
        await verifyFolder();
        try {
            JSON.parse(await fs.readFile(getFolder() + 'prerelease.json', 'utf-8'));
            logger.info('Found a prerelease file, time to reset!');
            data = await loadData();
            await resetAndBackup('prelease_');
            await fs.rm(getFolder() + 'prerelease.json');
        } catch (e) {
            if (e.code === 'ENOENT') {
                logger.info('No prerelease file found, this is good!');
            } else {
                logger.error(`Failed to read prerlease file with error ${e.code}`, e);
                throw e;
            }
        }
        // RELEASE --------------------------
        data = await loadData();
    } catch(e) {
        loadedVersion = -2;
        serverVersion = LATEST_SERVER_VERSION;
        logger.error(`Failed to load database '${e.message}'`);
    }
    if (data.length === 0) {
        data = structuredClone(baseData) as RecipeRow[];
        await save();
    }
    setDatabaseOrder();
}

export async function resetAndBackup(prefix = 'db_backup_'): Promise<void> {
    await verifyFolder();
    await saveDatabaseToFile(`${prefix}${Math.floor((new Date()).getTime() / 1000)}.backup`);
    data = structuredClone(baseData) as RecipeRow[];
    loadedVersion = DATABASE_VERISON;
    serverVersion = LATEST_SERVER_VERSION;
    await save();
    setDatabaseOrder();
    await resetHint();
}

function setDatabaseOrder() {
    let highest = 0;
    for (const row of data) {
        if (row.discovered && row.order > highest) {
            highest = row.order;
        }
    }
    databaseOrder = highest + 1;
}

export async function insertRecipeRow(recipe: Omit<RecipeRow, 'order'>): Promise<RecipeRow> {
    const recipeRow: RecipeRow = { ...recipe, order: databaseOrder };
    data.push(recipeRow);
    databaseOrder++;
    await save();
    return recipeRow;
}
export async function insertRecipe(recipe: Omit<Recipe, 'order'>): Promise<RecipeRow> {
    const recipeRow: RecipeRow = {
        ...recipe,
        order: databaseOrder,
        a: recipe.a.name,
        b: recipe.b.name
    };
    data.push(recipeRow);
    databaseOrder++;
    await save();
    return recipeRow;
}

function getDiscoveredOrder(result: string): number | undefined {
    for (const recipe of data) {
        if (recipe.result === result && recipe.discovered) {
            return recipe.order;
        }
    }
    return undefined;
}

export async function setDiscovered(a: string, b: string, discovered: boolean): Promise<boolean> {
    for (const recipe of data) {
        if ((recipe.a === a && recipe.b === b) || (recipe.a === b && recipe.b === a)) {
            const existingOrder = getDiscoveredOrder(recipe.result);
            recipe.discovered = discovered ? 1 : 0;
            recipe.order = existingOrder ?? databaseOrder;
            if (existingOrder === undefined)
                databaseOrder++;
            break;
        }
    }
    if (data.filter((recipe) => recipe.discovered).length % 10 === 0) {
        await addHintPoint(1);
        return true;
    }
    await save();
    return false;
}

export async function deleteRecipe(a: string, b: string): Promise<void> {
    data = data.filter((value) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return false;
        }
        return true;
    });
    await save();
}

export async function getRecipe(a: string, b: string): Promise<Recipe | undefined> {
    return traverseAndFill(data.find((value) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return true;
        }
        return false;
    }));
}

export async function getRecipesFor(result: string): Promise<Recipe[]> {
    const recipes = data.filter((value) => value.result === result);
    const formatted = [];
    for (const recipe of recipes) {
        formatted.push(traverseAndFill(recipe));
    }
    return formatted;
}

export async function getAllRecipes(): Promise<Recipe[]> {
    const formatted = [];
    for (const recipe of data) {
        formatted.push(traverseAndFill(recipe));
    }
    return formatted;
}

function getBasicDetails(name: string): BasicElement {
    const found = data.find((value) => value.result === name);
    if (found === undefined) {
        const unknowns: Partial<Languages> = {};
        for (const language of languages) {
            unknowns[language] = '???';
        }
        unknowns.english = name.charAt(0).toUpperCase() + name.slice(1);
        return {
            name: name,
            display: unknowns as Languages,
            emoji: '❓',
            depth: 0,
            first: 0,
            who_discovered: '',
            base: 0
        };
    } else {
        return {
            name: found.result,
            display: found.display,
            emoji: found.emoji,
            depth: found.depth,
            first: found.first,
            who_discovered: found.who_discovered,
            base: found.base
        };
    }
}

export function traverseAndFill(recipe?: RecipeRow): Recipe | undefined {
    if (recipe === undefined)
        return undefined;
    const { a, b } = recipe;
    return {
        ...recipe,
        a: getBasicDetails(a),
        b: getBasicDetails(b)
    };
}

export function hasAllRecipes(result: string): boolean {
    const recipes = data.filter((value) => (value.result === result && value.base));
    if (recipes.length === 0) {
        return false;
    }
    let hasAll = true;
    for (const recipe of recipes) {
        if (!recipe.discovered) {
            hasAll = false;
            break;
        }
    }
    return hasAll;
}

export function hasAtleastRecipe(result: string): boolean {
    const recipes = data.filter((value) => (value.result === result && value.base));
    if (recipes.length === 0) {
        return false;
    }
    let hasOne = false;
    for (const recipe of recipes) {
        if (recipe.discovered) {
            hasOne = true;
            break;
        }
    }
    return hasOne;
}
