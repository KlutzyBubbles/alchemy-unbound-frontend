import { promises as fs } from 'fs';
import { getFolder, isDlcInstalled } from './steam';
import { verifyFolder } from '../utils';
import logger from 'electron-log/main';
import { DEFAULT_HINT, DEFAULT_MAX_HINTS, Hint } from '../../common/hints';
import { Compressed, compress, decompress, trimUndefinedRecursively } from 'compress-json';
import { HINT_DLC, Recipe } from '../../common/types';
import { data, traverseAndFill } from './database/recipeStore';
import { FileVersionError } from '../../common/types/saveFormat';

const HINT_VERISON = 1;

let maxHints = DEFAULT_MAX_HINTS;
let hint: Hint = DEFAULT_HINT;
let loadedVersion: number = FileVersionError.NOT_LOADED;
let loaded = false;

const EXCLUDED = ['piney', 'shep3rd', 'klutzybubbles', 'ango', 'uncle', 'flikz', 'tvision'];

export function getHintVersion(): number {
    return loadedVersion;
}

async function getBaseHint(): Promise<Recipe | undefined> {
    const alreadyFound = [...new Set(data.filter((value) => value.discovered).map((item) => item.result))];
    let undiscovered = data.filter((value) => !alreadyFound.includes(value.result));
    undiscovered = undiscovered.filter((item) => alreadyFound.includes(item.a) && alreadyFound.includes(item.b));
    undiscovered = undiscovered.filter((item) => {
        if (EXCLUDED.includes(item.result) || EXCLUDED.includes(item.a) || EXCLUDED.includes(item.b)) {
            return false;
        }
        return true;
    });
    undiscovered = undiscovered.sort((a, b) => a.depth - b.depth);
    if (undiscovered.length > 0) {
        return traverseAndFill(undiscovered[0]);
    }
    const alreadyFoundRecipes = [...new Set(data.filter((value) => value.discovered).map((item) => `${item.a}:${item.b}`))];
    let undiscoveredRecipes = data.filter((value) => !alreadyFoundRecipes.includes(`${value.a}:${value.b}`));
    undiscoveredRecipes = undiscoveredRecipes.filter((item) => {
        if (EXCLUDED.includes(item.result) || EXCLUDED.includes(item.a) || EXCLUDED.includes(item.b)) {
            return false;
        }
        return true;
    });
    undiscoveredRecipes = undiscoveredRecipes.sort((a, b) => a.depth - b.depth);
    if (undiscoveredRecipes.length > 0) {
        return traverseAndFill(undiscoveredRecipes[0]);
    }
    return undefined;
}

async function saveHintToFile(filename: string, fullpath = false) {
    logger.debug('saveHintToFile()');
    await fs.writeFile(fullpath ? filename : getFolder() + filename, JSON.stringify(getHintSaveFormat()), 'utf-8');
}

export function getHintSaveFormat() {
    logger.debug('getHintSaveFormat()');
    if (hint.hint !== undefined) {
        const temp = structuredClone(hint);
        trimUndefinedRecursively(temp);
        return {
            version: HINT_VERISON,
            hint: compress(temp)
        };
    } else {
        return {
            version: HINT_VERISON,
            hint: compress({
                hintsLeft: hint.hintsLeft,
            })
        };
    }
}

export function setHintRaw(newHint: Hint) {
    logger.debug('setHintRaw()');
    hint = newHint;
}

export async function saveHint(): Promise<void> {
    logger.debug('saveHint()');
    try {
        await verifyFolder();
        await saveHintToFile('hint.json');
    } catch(e) {
        logger.error('Error saving hint', e);
    }
}

export function loadHintV1(loaded: Compressed) {
    logger.debug('loadHintV1()');
    return decompress(loaded) as Hint;
}

export async function loadHint(): Promise<void> {
    logger.debug('loadHint()');
    try {
        if (isDlcInstalled(HINT_DLC)) {
            maxHints = 25;
        }
        const raw = JSON.parse(await fs.readFile(getFolder() + 'hint.json', 'utf-8'));
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        if (raw.version === 1) {
            hint = loadHintV1(raw.hint);
        } else {
            loadedVersion = FileVersionError.ERROR;
            logger.error(`Failed to load hint because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load hint because of unknown version '${raw.version}', has this been altered?`));
        }
        loaded = true;
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading hint JSON', e);
        } else {
            logger.info('Hint file could not be found, initializing with default hint');
            if (hint === null || hint === undefined) {
                hint = DEFAULT_HINT;
                loadedVersion = FileVersionError.DEFAULTS;
            }
        }
    }
    if (hint === null || hint === undefined) {
        hint = DEFAULT_HINT;
        loadedVersion = FileVersionError.DEFAULTS;
    }
}

async function generateHint(): Promise<Recipe | undefined> {
    logger.debug('generateHint()');
    if (hint.hintsLeft > 0) {
        const tempHint = await getBaseHint();
        if (tempHint !== undefined)
            hint.hintsLeft -= 1;
        return tempHint;
    }
    return undefined;
}

export async function getHint(generate: boolean): Promise<Recipe | undefined> {
    logger.debug(`getHint(${generate})`);
    if (!loaded) {
        await loadHint();
    }
    if (hint.hint === undefined && generate) {
        hint.hint = await generateHint();
        await saveHint();
        return hint.hint;
    }
    return hint.hint;
}

export async function addHintPoint(amount = 1) {
    logger.debug(`addHintPoint(${amount})`);
    if (!loaded) {
        await loadHint();
    }
    if (hint.hintsLeft < maxHints) {
        hint.hintsLeft += amount;
        if (hint.hintsLeft > maxHints) {
            hint.hintsLeft = maxHints;
        }
    }
    await saveHint();
}

export async function fillHints() {
    logger.debug('fillHints()');
    if (!loaded) {
        await loadHint();
    }
    hint.hintsLeft = maxHints;
    await saveHint();
}

// export async function setMaxHints(maxHints: number) {
//     if (!loaded) {
//         await loadHint();
//     }
//     hint.maxHints = maxHints;
//     if (hint.hintsLeft > maxHints) {
//         hint.hintsLeft = maxHints;
//     }
//     await saveHint();
// }

export async function getMaxHints(): Promise<number> {
    logger.debug('getMaxHints()');
    if (!loaded) {
        await loadHint();
    }
    return maxHints;
}

export async function getHintsLeft(): Promise<number> {
    logger.debug('getHintsLeft()');
    if (!loaded) {
        await loadHint();
    }
    return hint.hintsLeft;
}

export async function resetHint(soft: boolean = false): Promise<void> {
    logger.debug('resetHint()');
    if (soft) {
        hint.hint = undefined;
    } else {
        hint = DEFAULT_HINT;
    }
    await saveHint();
}

export async function hintComplete(): Promise<void> {
    logger.debug('hintComplete()');
    hint.hint = undefined;
    await saveHint();
}
