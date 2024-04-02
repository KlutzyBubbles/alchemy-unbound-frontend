import { promises as fs } from 'fs';
import { getFolder, isDlcInstalled } from './steam';
import { verifyFolder } from './utils';
import logger from 'electron-log/main';
import { DEFAULT_HINT, DEFAULT_MAX_HINTS, Hint } from '../common/hints';
import { Compressed, compress, decompress } from 'compress-json';
import { HINT_DLC, Recipe } from '../common/types';
import { getBaseHint } from './database';

const HINT_VERISON = 1;

let maxHints = DEFAULT_MAX_HINTS;
let hint: Hint = DEFAULT_HINT;
let loaded = false;

async function saveHintToFile(filename: string, fullpath = false) {
    logger.debug('saveHintToFile()');
    await fs.writeFile(fullpath ? filename : getFolder() + filename, JSON.stringify(getHintSaveFormat()), 'utf-8');
}

export function getHintSaveFormat() {
    logger.debug('getHintSaveFormat()');
    if (hint.hint !== undefined) {
        return {
            version: HINT_VERISON,
            hint: compress(hint)
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
        if (raw.version === 1) {
            hint = loadHintV1(raw.hint);
        } else {
            logger.error(`Failed to load hint because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load hint because of unknown version '${raw.version}', has this been altered?`));
        }
        loaded = true;
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading hint JSON', e);
        } else {
            logger.info('Hint file could not be found, initializing with default hint');
            if (hint === null || hint === undefined)
                hint = DEFAULT_HINT;
        }
    }
    if (hint === null || hint === undefined)
        hint = DEFAULT_HINT;
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

export async function resetHint(): Promise<void> {
    logger.debug('resetHint()');
    hint = DEFAULT_HINT;
    await saveHint();
}

export async function hintComplete(): Promise<void> {
    logger.debug('hintComplete()');
    hint.hint = undefined;
    await saveHint();
}
