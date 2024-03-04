import { BasicElement, Recipe, RecipeRow } from '../common/types';
import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists, fileExists } from '../common/utils';

const DATABASE_VERISON = 1;

var data: RecipeRow[] = [];

export async function save(): Promise<void> {
    if (!(await dirExists(getFolder()))) {
        await fs.mkdir(getFolder(), { recursive: true })
    }
    var existing: RecipeRow[] = []
    try {
        if (fileExists(getFolder() + 'db.json')) {
            existing = await loadData()
        }
    } catch(e) {
        if (e.code === 'ENOENT') {
            console.log('Error was coulnd\'t find file, which is fine')
        } else if (!(e.message as string).startsWith('Failed to load database')) {
            console.error('Failed to load file, not overriding just incase, saving to temp instead')
            await fs.writeFile(getFolder() + `db_backup_${(new Date()).toISOString().slice(0, 16)}.json`, JSON.stringify({
                version: DATABASE_VERISON,
                data: data
            }), 'utf-8')
            return
        }
    }
    var uniques = new Set(existing.map((value) => {
        return value.a.localeCompare(value.b) > 0 ? `${value.a}${value.b}` : `${value.b}${value.a}`
    }))
    var newData = [...existing, ...data.filter((value) => !uniques.has(value.a.localeCompare(value.b) > 0 ? `${value.a}${value.b}` : `${value.b}${value.a}`))]
    await fs.writeFile(getFolder() + 'db.json', JSON.stringify({
        version: DATABASE_VERISON,
        data: newData
    }), 'utf-8')
}

function loadV1(loaded: any): RecipeRow[] {
    return loaded
}

async function loadData(): Promise<RecipeRow[]> {
    try {
        var raw = JSON.parse(await fs.readFile(getFolder() + 'db.json', 'utf-8'))
        if (raw.version === 1) {
            return loadV1(raw.data)
        } else {
            console.error('Failed to load database because of unknown version, has this been altered?')
            throw(Error('Failed to load database because of unknown version, has this been altered?'))
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log('No file found, returning blank data')
            return []
        }
    }
}

export async function createDatabase(): Promise<void> {
    try {
        data = await loadData()
    } catch(e) {
        console.error('Error reading JSON')
        console.error(e)
    }
    var records = [
        {
            english: 'Fire',
            schinese: '火',
            russian: 'огонь',
            french: 'feu',
            spanish: 'fuego',
            japanese: '火',
            emoji: '🔥'
        },
        {
            english: 'Earth',
            schinese: '地球',
            russian: 'Земля',
            french: 'Terre',
            spanish: 'Tierra',
            japanese: '地球',
            emoji: '🌎'
        },
        {
            english: 'Air',
            schinese: '空气',
            russian: 'Воздух',
            french: 'Air',
            spanish: 'Aire',
            japanese: '空気',
            emoji: '💨'
        },
        {
            english: 'Water',
            schinese: '水',
            russian: 'Вода',
            french: 'Eau',
            spanish: 'Agua',
            japanese: '水',
            emoji: '💧'
        }
    ]

    records.forEach(async (item) => {
    var result = item.english.toLowerCase()
    var hasItem = await getRecipesFor(result)
    if (hasItem === null || hasItem === undefined || hasItem.length === 0) {
        await insertRecipeRow({
            a: '',
            b: '',
            result,
            display: {
                english: item.english,
                schinese: item.schinese,
                russian: item.russian,
                french: item.french,
                spanish: item.spanish,
                japanese: item.japanese,
            },
            emoji: item.emoji,
            depth: 0,
            who_discovered: '',
            base: 1
        })
    }
    })
}

export async function insertRecipeRow(recipe: RecipeRow): Promise<void> {
    console.log('insertRecipe')
    data.push(recipe)
}
export async function insertRecipe(recipe: Recipe): Promise<void> {
    console.log('insertRecipe')
    data.push({
        ...recipe,
        a: recipe.a.name,
        b: recipe.b.name
    })
}

export async function deleteRecipe(a: string, b: string): Promise<void> {
    console.log('deleteRecipe')
    data = data.filter((value, index) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return false
        }
        return true
    })
}

export async function getRecipe(a: string, b: string): Promise<Recipe | undefined> {
    return traverseAndFill(data.find((value, index) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return true
        }
        return false
    }))
}

export async function getRecipesFor(result: string): Promise<Recipe[]> {
    var recipes = data.filter((value) => value.result === result)
    var formatted = []
    for (var recipe of recipes) {
        formatted.push(traverseAndFill(recipe))
    }
    return formatted
}

export async function getAllRecipes(): Promise<Recipe[]> {
    var formatted = []
    for (var recipe of data) {
        formatted.push(traverseAndFill(recipe))
    }
    return formatted
}

function getBasicDetails(name: string): BasicElement {
    var found = data.find((value) => value.result === name)
    if (found === undefined) {
        return {
            name: name,
            display: {
                english: name.charAt(0).toUpperCase() + name.slice(1),
                japanese: '???',
                schinese: '???',
                french: '???',
                russian: '???',
                spanish: '???',
            },
            emoji: '❓'
        }
    } else {
        return {
            name: found.result,
            display: found.display,
            emoji: found.emoji
        }
    }
}

export function traverseAndFill(recipe?: RecipeRow): Recipe | undefined {
    if (recipe === undefined)
        return undefined
    var { a, b } = recipe
    return {
        ...recipe,
        a: getBasicDetails(a),
        b: getBasicDetails(b)
    }
}
