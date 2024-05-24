import { BasicElement, LATEST_SERVER_VERSION, Languages, Recipe, RecipeRow } from '../../../common/types';
import { promises as fs } from 'fs';
import { Compressed, compress, decompress, trimUndefinedRecursively } from 'compress-json';
import { getFolder } from '../steam';
import { verifyFolder } from '../../utils';
import { languages } from '../../../common/settings';
import baseData from '../../../base.json';
// import baseData from '../../allDiscovered.json';
import logger from 'electron-log/main';
import { addHintPoint, resetHint } from '../hints';
import { saveToFile } from './helpers';
import { DatabaseData, FileVersionError, RecipeRecord } from '../../../common/types/saveFormat';
import { getLanguage, getLanguageKeys, insertLanguage } from './languageStore';
import { getWorkingDatabase } from './workingName';
import { validateItems } from '../server';

const DATABASE_VERISON = 4;

export let data: RecipeRecord[] = [];
export let serverVersion: number = 1;
let info: DatabaseData = {
    type: 'base'
};
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

export function getDatabaseInfo() {
    return info;
}

export function setDatabaseInfo(newInfo: DatabaseData) {
    info = newInfo;
}

export function getDatabaseSaveFormat() {
    const temp = structuredClone(data);
    trimUndefinedRecursively(temp);
    return {
        version: DATABASE_VERISON,
        data: compress(temp.filter((item) => item !== undefined && item.discovered)),
        server: serverVersion,
        info: info
    };
}

export async function save(): Promise<void> {
    await verifyFolder('database');
    await saveToFile(`database/${await getWorkingDatabase()}.json`, getDatabaseSaveFormat());
}

export async function setDataRaw(newData: RecipeRecord[]) {
    data = newData;
    await save();
}

export function databaseV1toV2(loaded: Record<string, unknown>[]): Compressed {
    return compress(structuredClone(loaded).filter((item) => item.discovered));
}

export async function databaseV2toV3(loaded: Compressed): Promise<Compressed> {
    const tempData = structuredClone(decompress(loaded) as RecipeRow[]);
    const v3Data: RecipeRecord[] = [];
    for (const row of tempData) {
        try {
            await insertLanguage(row.result, {
                ...row.display,
                emoji: row.emoji
            });
            v3Data.push({
                order: row.order,
                a: row.a,
                b: row.b,
                discovered: row.discovered,
                result: row.result,
                depth: row.depth,
                first: row.first,
                who_discovered: row.who_discovered,
                hint_ignore: row.hint_ignore ?? false,
                base: row.base,
            });
        } catch (error) {
            logger.error(`Failed inserting language for ${row.result}`, error);
        }
    }
    let compressed = undefined;
    try {
        compressed = compress(v3Data);
    } catch (error) {
        logger.error('Failed compressing', error);
    }
    if (compressed === undefined) {
        throw new Error('Compressed output is undefined');
    }
    return compressed;
}

export async function databaseV3toV4(loaded: Compressed): Promise<Compressed> {
    // v4 Only changed outer elements, not the data itself.
    const tempData = structuredClone(decompress(loaded) as RecipeRecord[]);
    const v4Data: RecipeRecord[] = [];
    for (const row of tempData) {
        try {
            v4Data.push({
                order: row.order,
                a: row.a,
                b: row.b,
                discovered: row.discovered,
                result: row.result,
                depth: row.depth,
                first: row.first,
                who_discovered: row.who_discovered,
                hint_ignore: row.hint_ignore ?? false,
                has_language: row.has_language ?? false,
                valid_language: row.valid_language ?? true,
                base: row.base,
            });
        } catch (error) {
            logger.error(`Failed inserting language for ${row.result}`, error);
        }
    }
    let compressed = undefined;
    try {
        compressed = compress(v4Data);
    } catch (error) {
        logger.error('Failed compressing', error);
    }
    if (compressed === undefined) {
        throw new Error('Compressed output is undefined');
    }
    return compressed;
}

export async function fillWithBase(loaded: Compressed): Promise<RecipeRecord[]> {
    const tempData = structuredClone(decompress(loaded) as RecipeRecord[]);
    const baseClone: RecipeRecord[] = structuredClone(baseData);
    const newData: RecipeRecord[] = [];
    let backup = false;
    for (const baseItem of baseClone) {
        let matchedItem: RecipeRecord | undefined = undefined;
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
        await saveToFile(`${await getWorkingDatabase()}_itemchange_${Math.floor((new Date()).getTime() / 1000)}.backup`, getDatabaseSaveFormat());
        data = holdData;
    }
    return newData;
}

export async function noFill(loaded: Compressed): Promise<RecipeRecord[]> {
    const tempData = structuredClone(decompress(loaded) as RecipeRecord[]);
    return tempData;
}

export async function checkLanguages(recipes: RecipeRecord[]): Promise<RecipeRecord[]> {
    const tempData = structuredClone(recipes);
    logger.info('tempData', tempData.length);
    let needToCheck: string[] = [];
    const languages = await getLanguageKeys();
    for (const recipe of tempData) {
        if (needToCheck.includes(recipe.result)) {
            recipe.has_language = false;
            continue;
        }
        if (!languages.includes(recipe.result)) {
            recipe.has_language = false;
            needToCheck.push(recipe.result);
        } else {
            recipe.has_language = true;
            recipe.valid_language = true;
        }
    }
    needToCheck = [...new Set(needToCheck)];
    const validated: string[] = [];
    const notExists: string[] = [];
    for (const chunk of chunkArray(needToCheck, 100)) {
        try {
            const validatedResponse = await validateItems(chunk);
            if (validatedResponse === undefined) {
                continue;
            } else if (validatedResponse.type === 'error') {
                continue;
            } else {
                for (const lang of validatedResponse.result.languages) {
                    await insertLanguage(lang.name, lang, true);
                    validated.push(lang.name);
                }
                for (const item of chunk) {
                    if (!validatedResponse.result.items.includes(item)) {
                        notExists.push(item);
                    }
                }
            }
        } catch (error) {
            logger.error('Error validating items', error);
            continue;
        }
    }
    for (const recipe of tempData) {
        if (validated.includes(recipe.result)) {
            recipe.has_language = true;
            recipe.valid_language = true;
        } else if (notExists.includes(recipe.result)) {
            recipe.has_language = false;
            recipe.valid_language = false;
        } else {
            recipe.has_language = false;
            recipe.valid_language = true;
        }
    }
    logger.info('tempDataafter', tempData.length);
    return tempData;
}

function chunkArray(array: string[], chunkSize: number): string[][] {
    return Array.from(
        { length: Math.ceil(array.length / chunkSize) },
        (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)   
    );
}

async function loadData(): Promise<RecipeRecord[]> {
    try {
        //`${getFolder()}database/${await getWorkingDatabase()}.json`
        const newPath = `${getFolder()}database/${await getWorkingDatabase()}.json`;
        const oldPath = getFolder() + await getWorkingDatabase() + '.json';
        let raw = undefined;
        try {
            raw = JSON.parse(await fs.readFile(newPath, 'utf-8'));
        } catch (e) {
            loadedVersion = FileVersionError.ERROR;
            serverVersion = LATEST_SERVER_VERSION;
            if (e.code === 'ENOENT') {
                logger.info('No database file found, trying old location');
                raw = JSON.parse(await fs.readFile(oldPath, 'utf-8'));
                await verifyFolder('database');
                await fs.rename(oldPath, newPath);
            } else {
                throw e;
            }
        }
        if (raw === undefined) {
            throw new Error('Raw turned out to be undefined');
        }
        serverVersion = raw.server;
        if (serverVersion === undefined) {
            serverVersion = 1;
        }
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        logger.info('raw', raw);
        let workingVersion = raw.version;
        let workingData = raw.data;
        let foundInfo: DatabaseData = {
            type: 'base'
        };
        if (raw.info !== undefined) {
            foundInfo = {
                type: raw.info.base ?? 'base',
                expiry: raw.info.expiry
            };
        }
        info = foundInfo;
        if (workingVersion === 1) {
            logger.info('Found v1, migrating...');
            workingData = databaseV1toV2(workingData);
            workingVersion = 2;
        }
        if (workingVersion === 2) {
            logger.info('Found v2, migrating...');
            workingData = await databaseV2toV3(workingData);
            workingVersion = 3;
        }
        if (workingVersion === 3) {
            logger.info('Found v3, migrating...');
            workingData = await databaseV3toV4(workingData);
            workingVersion = 4;
        }
        if (workingVersion === 4) {
            logger.info('Found v3, loading...');
            if (info.type === 'base') {
                return await checkLanguages(await fillWithBase(workingData));
            }
            return await checkLanguages(await noFill(workingData));
        } else {
            loadedVersion = FileVersionError.UNKOWN_VERSION;
            serverVersion = LATEST_SERVER_VERSION;
            logger.error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
        loadedVersion = FileVersionError.ERROR;
        serverVersion = LATEST_SERVER_VERSION;
        if (e.code === 'ENOENT') {
            logger.info('No database file found, returning blank data');
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
        loadedVersion = FileVersionError.ERROR;
        serverVersion = LATEST_SERVER_VERSION;
        logger.error(`Failed to load database '${e.message}'`);
    }
    if (data.length === 0) {
        data = structuredClone(baseData) as RecipeRecord[];
        await save();
    }
    setDatabaseOrder();
}

export async function resetAndBackup(prefix = 'db_backup_'): Promise<void> {
    await verifyFolder('backup');
    await saveToFile(`backup/${prefix}${Math.floor((new Date()).getTime() / 1000)}.backup`, getDatabaseSaveFormat());
    data = structuredClone(baseData) as RecipeRecord[];
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

export async function insertRecipeRow(recipe: Omit<RecipeRow, 'order'>): Promise<RecipeRecord> {
    await insertLanguage(recipe.result, {
        ...recipe.display,
        emoji: recipe.emoji
    });
    const recipeRow: RecipeRecord = {
        order: databaseOrder,
        a: recipe.a,
        b: recipe.b,
        discovered: recipe.discovered,
        result: recipe.result,
        depth: recipe.depth,
        first: recipe.first,
        who_discovered: recipe.who_discovered,
        hint_ignore: recipe.hint_ignore,
        base: recipe.base,
    };
    data.push(recipeRow);
    databaseOrder++;
    await save();
    return recipeRow;
}

export async function insertRecipe(recipe: Omit<Recipe, 'order'>): Promise<RecipeRecord> {
    await insertLanguage(recipe.result, {
        ...recipe.display,
        emoji: recipe.emoji
    });
    const recipeRow: RecipeRecord = {
        order: databaseOrder,
        a: recipe.a.name,
        b: recipe.b.name,
        discovered: recipe.discovered,
        result: recipe.result,
        depth: recipe.depth,
        first: recipe.first,
        who_discovered: recipe.who_discovered,
        hint_ignore: false,
        base: recipe.base,
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
        const temp = traverseAndFill(recipe);
        if (temp !== undefined) {
            formatted.push(temp);
        }
    }
    return formatted;
}

function getBasicDetails(name: string): BasicElement {
    const found = data.find((value) => value.result === name);
    const languageObject = found === undefined ? undefined : getLanguage(found.result);
    if (found === undefined || languageObject === undefined) {
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
            display: languageObject,
            emoji: languageObject.emoji,
            depth: found.depth,
            first: found.first,
            who_discovered: found.who_discovered,
            base: found.base
        };
    }
}

export function traverseAndFill(recipe?: RecipeRecord): Recipe | undefined {
    if (recipe === undefined)
        return undefined;
    const language = getLanguage(recipe.result);
    if (language === undefined)
        return undefined;
    const { a, b } = recipe;
    return {
        ...recipe,
        display: language,
        emoji: language.emoji,
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
