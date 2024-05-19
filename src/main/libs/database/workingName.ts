import { promises as fs } from 'fs';
import { getFolder } from '../steam';
import { verifyFolder } from '../../utils';
import logger from 'electron-log/main';

const DEFAULT_DATABASE = 'db';
let name: string = DEFAULT_DATABASE;
let loaded = false;

async function saveWorkingDatabase(): Promise<void> {
    try {
        await verifyFolder();
        await fs.writeFile(getFolder() + 'working.database', name, 'utf-8');
    } catch(e) {
        logger.error('Error saving working database file', e);
    }
}

async function loadWorkingDatabase(): Promise<void> {
    try {
        const raw = await fs.readFile(getFolder() + 'working.database', 'utf-8');
        name = raw;
        loaded = true;
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading working database file', e);
        } else {
            logger.info('working database file could not be found, initializing with default db');
            if (name === null || name === undefined)
                name = DEFAULT_DATABASE;
        }
    }
    if (name === null || name === undefined)
        name = DEFAULT_DATABASE;
}

export async function getWorkingDatabase(): Promise<string> {
    if (!loaded) {
        await loadWorkingDatabase();
    }
    return name;
}

export async function setWorkingDatabase(setTo: string) {
    name = setTo;
    await saveWorkingDatabase();
}
