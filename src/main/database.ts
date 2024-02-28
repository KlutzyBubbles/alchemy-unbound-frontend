import { Recipe } from '../common/types';
import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists, fileExists } from '../common/utils';

const DATABASE_VERISON = 1;

var data: Recipe[] = [];

export async function save(): Promise<void> {
    if (!(await dirExists(getFolder()))) {
        await fs.mkdir(getFolder(), { recursive: true })
    }
    var existing: Recipe[] = []
    try {
        if (fileExists(getFolder() + 'db.json')) {
            existing = await loadData()
        }
    } catch(e) {
        if (!(e.message as string).startsWith('Failed to load database')) {
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

function loadV1(loaded: any): Recipe[] {
    return loaded
}

async function loadData(): Promise<Recipe[]> {
    var raw = JSON.parse(await fs.readFile(getFolder() + 'db.json', 'utf-8'))
    if (raw.version === 1) {
        return loadV1(raw.data)
    } else {
        console.error('Failed to load database because of unknown version, has this been altered?')
        throw(Error('Failed to load database because of unknown version, has this been altered?'))
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
            name: 'Earth',
            emoji: '🌎'
        },
        {
            name: 'Fire',
            emoji: '🔥'
        },
        {
            name: 'Water',
            emoji: '💧'
        },
        {
            name: 'Air',
            emoji: '💨'
        }
    ]

    records.forEach(async (item) => {
    var result = item.name.toLowerCase()
    var hasItem = await getRecipesFor(result)
    if (hasItem === null || hasItem === undefined || hasItem.length === 0) {
        await insertRecipe({
        a: '',
        b: '',
        result,
        display: item.name,
        emoji: item.emoji,
        depth: 0,
        who_discovered: '',
        base: 1
        })
    }
    })
}

export async function insertRecipe(recipe: Recipe): Promise<void> {
    console.log('insertRecipe')
    data.push(recipe)
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
    return data.find((value, index) => {
        if ((value.a === a && value.b === b) || (value.a === b && value.b === a)) {
            return true
        }
        return false
    })
}

export async function getRecipesFor(result: string): Promise<Recipe[]> {
    return data.filter((value) => value.result === result)
}

export async function getAllRecipes(): Promise<Recipe[]> {
    return data
}
