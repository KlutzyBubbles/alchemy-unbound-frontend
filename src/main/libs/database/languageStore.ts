import { promises as fs } from 'fs';
import { Compressed, compress, decompress } from 'compress-json';
import { getFolder } from '../steam';
import { verifyFolder } from '../../utils';
import baseLanguage from '../../../languages.json';
import logger from 'electron-log/main';
import { LanguageRecord, LanguageRecords } from '../../../common/types/saveFormat';
import { saveToFile } from './helpers';
import { hasProp } from '../../../common/utils';

const LANG_DATABASE_VERISON = 1;

export let data: LanguageRecords = {};

let loadedVersion: number = -2;

export function getLangDatabaseVersion(): number {
    return loadedVersion;
}

export function getDatabaseSaveFormat() {
    return {
        version: LANG_DATABASE_VERISON,
        data: compress(data),
    };
}

export async function save(): Promise<void> {
    await verifyFolder();
    await saveToFile('lang.json', getDatabaseSaveFormat());
}

export async function setDataRaw(newData: LanguageRecords) {
    data = newData;
    await save();
}

export function loadLangDatabaseV1(loaded: Compressed): LanguageRecords {
    return decompress(loaded) as LanguageRecords;
}

async function loadData(): Promise<LanguageRecords> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'lang.json', 'utf-8'));
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        if (raw.version === 1) {
            return loadLangDatabaseV1(raw.data);
        } else {
            loadedVersion = -1;
            logger.error(`Failed to load lang database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load lang database because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
        loadedVersion = -2;
        if (e.code === 'ENOENT') {
            logger.info('No lang database file found, returning blank data');
            return {};
        } else {
            logger.error(`Failed to read lang database file with error ${e.code}`);
            throw e;
        }
    }
}

export async function createLangDatabase(): Promise<void> {
    try {
        data = await loadData();
    } catch(e) {
        loadedVersion = -2;
        logger.error(`Failed to load lang database '${e.message}'`);
    }
    if (Object.keys(data).length === 0) {
        data = structuredClone(baseLanguage) as LanguageRecords;
        await save();
    }
}

export async function insertLanguage(key: string, language: LanguageRecord, override: boolean = false): Promise<void> {
    if (hasProp(data, key)) {
        if (override) {
            data[key] = language;
        }
    } else {
        data[key] = language;
    }
}

export function getLanguage(key: string): LanguageRecord | undefined {
    if (hasProp(data, key)) {
        return data[key];
    }
    return undefined;
}

export async function getLanguageKeys(): Promise<string[]> {
    return Object.keys(data);
}

export async function getAllLanguages(): Promise<LanguageRecords> {
    return data;
}
