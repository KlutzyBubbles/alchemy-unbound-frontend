import { BasicElement, Languages, Recipe, RecipeRow } from '../../common/types';
import { promises as fs } from 'fs';
import { Compressed, compress, decompress } from 'compress-json';
import { getFolder } from './steam';
import { verifyFolder } from '../utils';
import { languages } from '../../common/settings';
import baseData from '../../base.json';
// import baseData from '../allDiscovered.json';
import logger from 'electron-log/main';
import { addHintPoint, resetHint } from './hints';

const DATABASE_VERISON = 2;

export let data: RecipeRow[] = [];
let databaseOrder = 0;

export function getPlaceholderOrder(): number {
    const temp = databaseOrder;
    databaseOrder++;
    return temp;
}

async function saveDatabaseToFile(filename: string, fullpath = false) {
    await fs.writeFile(fullpath ? filename : getFolder() + filename, JSON.stringify(getDatabaseSaveFormat()), 'utf-8');
}

export function getDatabaseSaveFormat() {
    return {
        version: DATABASE_VERISON,
        data: compress(data.filter((item) => item.discovered))
    };
}

export async function save(): Promise<void> {
    await verifyFolder();
    await saveDatabaseToFile('db.json');
    //let existing: RecipeRow[] = [];
    //try {
    //    if (fileExists(getFolder() + 'db.json')) {
    //        existing = await loadData();
    //    }
    //} catch(e) {
    //    if (e.code === 'ENOENT') {
    //        console.log('Error was coulnd\'t find file, which is fine');
    //    } else if (!(e.message as string).startsWith('Failed to load database')) {
    //        console.error('Failed to load file, not overriding just incase, saving to temp instead');
    //        await fs.writeFile(getFolder() + `db_backup_${(new Date()).toISOString().slice(0, 16)}.json`, JSON.stringify({
    //            version: DATABASE_VERISON,
    //            data: data
    //        }), 'utf-8');
    //        return;
    //    }
    //}
    //const uniques = new Set(existing.map((value) => {
    //    return value.a.localeCompare(value.b) > 0 ? `${value.a}${value.b}` : `${value.b}${value.a}`;
    //}));
    //const newData = [...existing, ...data.filter((value) => !uniques.has(value.a.localeCompare(value.b) > 0 ? `${value.a}${value.b}` : `${value.b}${value.a}`))];
    //await fs.writeFile(getFolder() + 'db.json', JSON.stringify({
    //    version: DATABASE_VERISON,
    //    data: newData
    //}), 'utf-8');
}

export function setDataRaw(newData: RecipeRow[]) {
    data = newData;
}

export function loadDatabaseV1(loaded: Record<string, unknown>[]): RecipeRow[] {
    return loaded as RecipeRow[];
}

export function loadDatabaseV2(loaded: Compressed): RecipeRow[] {
    const tempData = decompress(loaded) as RecipeRow[];
    for (const baseItem of structuredClone(baseData)) {
        let hasDiscovered = false;
        for (const tempItem of tempData) {
            if ((tempItem.a === baseItem.a && tempItem.b === baseItem.b) || (tempItem.a === baseItem.b && tempItem.b === baseItem.a)) {
                hasDiscovered = true;
                break;
            }
        }
        if (!hasDiscovered) {
            tempData.push(baseItem);
        }
    }
    return tempData;
}

async function loadData(): Promise<RecipeRow[]> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'db.json', 'utf-8'));
        if (raw.version === 1) {
            return loadDatabaseV1(raw.data);
        } else if (raw.version === 2) {
            return loadDatabaseV2(raw.data);
        } else {
            logger.error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
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
        // PRERELEASE -------------------------- REMOVE ON RELEASE
        await verifyFolder();
        try {
            JSON.parse(await fs.readFile(getFolder() + 'prerelease.json', 'utf-8'));
        } catch (e) {
            if (e.code === 'ENOENT') {
                logger.info('No prerelease file found, creating');
                await fs.writeFile(getFolder() + 'prerelease.json', JSON.stringify({
                    data: 'DO NOT REMOVE ME',
                    version: 1
                }), 'utf-8');
            } else {
                logger.error(`Failed to read prerlease file with error ${e.code}`);
                throw e;
            }
        }
        // PRERELEASE -------------------------- REMOVE ON RELEASE
        data = await loadData();
    } catch(e) {
        logger.error(`Failed to load database '${e.message}'`);
    }
    if (data.length === 0) {
        data = structuredClone(baseData) as RecipeRow[];
        await save();
    }
    setDatabaseOrder();
}

export async function resetAndBackup(): Promise<void> {
    await verifyFolder();
    await saveDatabaseToFile(`db_backup_${Math.floor((new Date()).getTime() / 1000)}.backup`);
    data = structuredClone(baseData) as RecipeRow[];
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
    return false;
}

export async function deleteRecipe(a: string, b: string): Promise<void> {
    data = data.filter((value) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return false;
        }
        return true;
    });
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
