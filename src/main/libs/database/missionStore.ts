import { promises as fs } from 'fs';
import { Compressed, compress, decompress } from 'compress-json';
import { getFolder } from '../steam';
import { verifyFolder } from '../../utils';
import logger from 'electron-log/main';
import { FileVersionError, MissionStore, MissionStores, MissionType } from '../../../common/types/saveFormat';
import { saveToFile } from './helpers';
import { MissionDifficulty } from '../../../common/mission';
import { hasProp } from '../../../common/utils';

const MISSION_DATABASE_VERISON = 1;

export let data: MissionStores = {};

let loadedVersion: number = FileVersionError.NOT_LOADED;

export function getMissionDBVersion(): number {
    return loadedVersion;
}

export function getMissionDBSaveFormat() {
    return {
        version: MISSION_DATABASE_VERISON,
        data: compress(data),
    };
}

export async function save(): Promise<void> {
    await verifyFolder();
    await saveToFile('mission.json', getMissionDBSaveFormat());
}

export async function setDataRaw(newData: MissionStores) {
    data = newData;
    await save();
}

export function loadMissionDBV1(loaded: Compressed): MissionStores {
    return decompress(loaded) as MissionStores;
}

async function loadData(): Promise<MissionStores> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'mission.json', 'utf-8'));
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        if (raw.version === 1) {
            return loadMissionDBV1(raw.data);
        } else {
            loadedVersion = FileVersionError.ERROR;
            logger.error(`Failed to load missiondb because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load missiondb because of unknown version '${raw.version}', has this been altered?`));
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            logger.info('No missiondb file found, returning blank data');
            loadedVersion = FileVersionError.DEFAULTS;
            return {};
        } else {
            loadedVersion = FileVersionError.ERROR;
            logger.error(`Failed to read missiondb file with error ${e.code}`);
            throw e;
        }
    }
}

export async function createMissionDB(): Promise<void> {
    try {
        data = await loadData();
    } catch(e) {
        loadedVersion = FileVersionError.ERROR;
        logger.error(`Failed to load missiondb '${e.message}'`);
    }
}

export async function setMissionStore(key: MissionType, dataStore: MissionStore): Promise<void> {
    logger.silly('setMissionStore()', key, dataStore);
    data[key] = dataStore;
    await save();
}

export async function setComplete(key: MissionType, level: MissionDifficulty, complete: boolean = true): Promise<void> {
    logger.silly('setComplete()', key, level, complete);
    if (hasProp(data, key) && data[key] !== undefined && hasProp(data[key], level) && data[key][level] !== undefined) {
        data[key][level].complete = complete;
    }
    await save();
}

export async function addCombine(key: MissionType, amount: number = 1): Promise<void> {
    logger.silly('addCombine()', key, amount);
    if (hasProp(data, key) && data[key] !== undefined) {
        data[key].combines = (data[key].combines ?? 0) + amount;
    }
    await save();
}

export async function resetCombine(key: MissionType): Promise<void> {
    logger.silly('resetCombine()', key);
    if (hasProp(data, key) && data[key] !== undefined) {
        data[key].combines = 0;
    }
    await save();
}

export async function getMissionStore(type: MissionType): Promise<MissionStore | undefined> {
    logger.silly('getMissionStore()', type);
    if (loadedVersion === FileVersionError.NOT_LOADED) {
        await createMissionDB();
    }
    return data[type];
}
