import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { verifyFolder } from './utils';
import logger from 'electron-log/main';
import { DEFAULT_HINT, Hint } from '../common/hints';
import { Compressed, compress, decompress } from 'compress-json';
import { Recipe } from '../common/types';
import { getBaseHint } from './database';

const HINT_VERISON = 1;

let hint: Hint = DEFAULT_HINT;
let loaded = false;

async function saveToFile(filename: string, fullpath = false) {
    let content = '';
    if (hint.hint !== undefined) {
        content = JSON.stringify({
            version: HINT_VERISON,
            hint: compress(hint)
        });
    } else {
        content = JSON.stringify({
            version: HINT_VERISON,
            hint: compress({
                hintsLeft: hint.hintsLeft,
                maxHints: hint.maxHints
            })
        });
    }
    await fs.writeFile(fullpath ? filename : getFolder() + filename, content, 'utf-8');
}

export async function saveHint(): Promise<void> {
    try {
        await verifyFolder();
        await saveToFile('hint.json');
    } catch(e) {
        logger.error('Error saving hint', e);
    }
}

function loadV1(loaded: Compressed) {
    hint = decompress(loaded) as Hint;
}

export async function loadHint(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'hint.json', 'utf-8'));
        if (raw.version === 1) {
            loadV1(raw.hint);
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
    if (hint.hintsLeft > 0) {
        hint.hintsLeft -= 1;
        return getBaseHint();
    }
    return undefined;
}

export async function getHint(generate: boolean): Promise<Recipe | undefined> {
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
    if (!loaded) {
        await loadHint();
    }
    if (hint.hintsLeft < hint.maxHints) {
        hint.hintsLeft += amount;
        if (hint.hintsLeft > hint.maxHints) {
            hint.hintsLeft = hint.maxHints;
        }
    }
    await saveHint();
}

export async function setMaxHints(maxHints: number) {
    if (!loaded) {
        await loadHint();
    }
    hint.maxHints = maxHints;
    if (hint.hintsLeft > hint.maxHints) {
        hint.hintsLeft = hint.maxHints;
    }
    await saveHint();
}

export async function getMaxHints(): Promise<number> {
    if (!loaded) {
        await loadHint();
    }
    return hint.maxHints;
}

export async function getHintsLeft(): Promise<number> {
    if (!loaded) {
        await loadHint();
    }
    return hint.hintsLeft;
}

export async function resetHint(): Promise<void> {
    hint = DEFAULT_HINT;
    await saveHint();
}

export async function hintComplete(): Promise<void> {
    hint.hint = undefined;
    await saveHint();
}
