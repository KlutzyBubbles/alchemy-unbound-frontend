import { BasicElement, Languages, Recipe, RecipeRow } from '../common/types';
import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists } from '../common/utils';
import { languages } from '../common/settings';
import baseData from '../base.json';

const DATABASE_VERISON = 1;

let data: RecipeRow[] = [];
let databaseOrder = 0;

export function getPlaceholderOrder(): number {
    const temp = databaseOrder;
    databaseOrder++;
    return temp;
}

export async function save(): Promise<void> {
    if (!(await dirExists(getFolder()))) {
        await fs.mkdir(getFolder(), { recursive: true });
    }
    console.log('saving db');
    await fs.writeFile(getFolder() + 'db.json', JSON.stringify({
        version: DATABASE_VERISON,
        data: data
    }), 'utf-8');
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

function loadV1(loaded: Record<string, unknown>[]): RecipeRow[] {
    return loaded as RecipeRow[];
}

async function loadData(): Promise<RecipeRow[]> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'db.json', 'utf-8'));
        if (raw.version === 1) {
            return loadV1(raw.data);
        } else {
            console.error('Failed to load database because of unknown version, has this been altered?');
            throw(Error('Failed to load database because of unknown version, has this been altered?'));
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log('No file found, returning blank data');
            // const raw: RecipeRow[] = JSON.parse(await fs.readFile(MAIN_WINDOW_WEBPACK_ENTRY + '/base.json', 'utf-8'));
            // return baseData as RecipeRow[];
            return [];
        }
    }
}

export async function createDatabase(): Promise<void> {
    try {
        data = await loadData();
    } catch(e) {
        console.error('Error reading JSON');
        console.error(e);
    }
    if (data.length === 0) {
        data = baseData as RecipeRow[];
        await save();
    }
    databaseOrder = data.length;
}

export async function insertRecipeRow(recipe: Omit<RecipeRow, 'order'>): Promise<RecipeRow> {
    console.log('insertRecipe');
    const recipeRow: RecipeRow = { ...recipe, order: databaseOrder };
    data.push(recipeRow);
    databaseOrder++;
    return recipeRow;
}
export async function insertRecipe(recipe: Omit<Recipe, 'order'>): Promise<RecipeRow> {
    console.log('insertRecipe');
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

export function setDiscovered(a: string, b: string, discovered: boolean) {
    for (const recipe of data) {
        if ((recipe.a === a && recipe.b === b) || (recipe.a === b && recipe.b === a)) {
            recipe.discovered = discovered ? 1 : 0;
            break;
        }
    }
}

export async function deleteRecipe(a: string, b: string): Promise<void> {
    console.log('deleteRecipe');
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
