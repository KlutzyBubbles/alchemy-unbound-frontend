import { promises as fs } from 'fs';
import { Compressed, compress, decompress } from 'compress-json';
import { getFolder } from '../steam';
import { verifyFolder } from '../../utils';
import baseLanguage from '../../../languages.json';
import logger from 'electron-log/main';
import { FileVersionError, LanguageRecord, LanguageRecords } from '../../../common/types/saveFormat';
import { saveToFile } from './helpers';
import { hasProp } from '../../../common/utils';
import { Language } from '../../../common/settings';

const LANG_DATABASE_VERISON = 1;

const BASE_LANG: {
    [key: string]: LanguageRecord
} = {
    fire: {
        english: "Fire",
        schinese: "火",
        russian: "огонь",
        spanish: "fuego",
        french: "feu",
        japanese: "火",
        indonesian: "Api",
        german: "Feuer",
        latam: "fuego",
        italian: "fuoco",
        dutch: "vuur",
        polish: "ogień",
        portuguese: "fogo",
        tchinese: "火",
        koreana: "불",
        emoji: "🔥"
    },
    earth: {
        english: "Earth",
        schinese: "地球",
        russian: "Земля",
        spanish: "Tierra",
        french: "Terre",
        japanese: "地球",
        indonesian: "Bumi",
        german: "Erde",
        latam: "terra",
        italian: "terra",
        dutch: "aarde",
        polish: "ziemia",
        portuguese: "terra",
        tchinese: "地球",
        koreana: "지구",
        emoji: "🌎"
    },
    air: {
        english: "Air",
        schinese: "空气",
        russian: "Воздух",
        spanish: "Aire",
        french: "Air",
        japanese: "空気",
        indonesian: "Udara",
        german: "Luft",
        latam: "aire",
        italian: "aria",
        dutch: "lucht",
        polish: "powietrze",
        portuguese: "ar",
        tchinese: "空氣",
        koreana: "공기",
        emoji: "🌬️"
    },
    water: {
        english: "Water",
        schinese: "水",
        russian: "Вода",
        spanish: "Agua",
        french: "Eau",
        japanese: "水",
        indonesian: "Air",
        german: "Wasser",
        latam: "agua",
        italian: "acqua",
        dutch: "water",
        polish: "woda",
        portuguese: "água",
        tchinese: "水",
        koreana: "물",
        emoji: "💧"
    },
    time: {
        english: "Time",
        schinese: "时间",
        russian: "Время",
        spanish: "Tiempo",
        french: "Temps",
        japanese: "時間",
        indonesian: "Waktu",
        german: "Zeit",
        latam: "Tiempo",
        italian: "Tempo",
        dutch: "Tijd",
        polish: "Czas",
        portuguese: "Tempo",
        tchinese: "時間",
        koreana: "시간",
        emoji: "⏰"
    },
    life: {
        english: "Life",
        schinese: "生活",
        russian: "Жизнь",
        spanish: "Vida",
        french: "Vie",
        japanese: "人生",
        indonesian: "Hidup",
        german: "Leben",
        latam: "Vida",
        italian: "Vita",
        dutch: "Leven",
        polish: "Życie",
        portuguese: "Vida",
        tchinese: "生活",
        koreana: "인생",
        emoji: "🌟"
    }
};

export let data: LanguageRecords = {};

let loadedVersion: number = FileVersionError.NOT_LOADED;

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
    logger.silly('languageStore save', loadedVersion);
    await verifyFolder();
    if (loadedVersion < 0 && loadedVersion !== FileVersionError.DEFAULTS) {
        logger.warn('Database not saved due to file version potentially not loaded', loadedVersion);
    } else {
        await saveToFile('lang.json', getDatabaseSaveFormat());
    }
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
            loadedVersion = FileVersionError.NO_VERSION;
        }
        if (raw.version === 1) {
            return loadLangDatabaseV1(raw.data);
        } else {
            loadedVersion = FileVersionError.ERROR;
            logger.error(`Failed to load lang database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load lang database because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            logger.info('No lang database file found, returning blank data');
            loadedVersion = FileVersionError.DEFAULTS;
            return {};
        } else {
            logger.error(`Failed to read lang database file with error ${e.code}`);
            loadedVersion = FileVersionError.ERROR;
            throw e;
        }
    }
}

async function validateData(shouldSave = false): Promise<void> {
    if (Object.keys(data).length === 0) {
        data = structuredClone(baseLanguage) as LanguageRecords;
        if (Object.keys(data).length === 0) {
            logger.warn('Still 0 maybe something went wrong with loading');
            data = BASE_LANG;
        }
        if (shouldSave) {
            await save();
        }
    }
}

export async function createLangDatabase(): Promise<void> {
    try {
        data = await loadData();
    } catch(e) {
        loadedVersion = FileVersionError.ERROR;
        logger.error(`Failed to load lang database '${e.message}'`);
    }
    await validateData(true);
    for (const key of Object.keys(BASE_LANG)) {
        if (!hasProp(data, key)) {
            data[key] = BASE_LANG[key];
        }
    }
    await save();
}

export async function insertLanguage(key: string, language: LanguageRecord, override: boolean = false): Promise<void> {
    await validateData();
    if (hasProp(data, key)) {
        if (override) {
            data[key] = language;
        }
    } else {
        data[key] = language;
    }
}

export async function getKeyByLanguage(result: string, language: Language): Promise<string | undefined> {
    await validateData();
    let found: string | undefined = undefined;
    for (const key of Object.keys(data)) {
        if (data[key][language].toLocaleLowerCase() === result.toLocaleLowerCase()) {
            found = key;
            break;
        }
    }
    return found;
}

export function getLanguage(key: string): LanguageRecord | undefined {
    if (hasProp(data, key)) {
        return data[key];
    }
    return undefined;
}

export async function getLanguageKeys(): Promise<string[]> {
    await validateData();
    return Object.keys(data);
}

export async function getAllLanguages(): Promise<LanguageRecords> {
    await validateData();
    return data;
}
