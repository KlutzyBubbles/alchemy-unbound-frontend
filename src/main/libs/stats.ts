import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists } from '../utils';
import logger from 'electron-log/main';
import { DEFAULT_STATS, Stats } from '../../common/stats';
import { hasProp } from '../../common/utils';

let stats: Stats = DEFAULT_STATS;
let loaded = false;

export async function saveStats(): Promise<void> {
    try {
        if (!(await dirExists(getFolder()))) {
            await fs.mkdir(getFolder(), { recursive: true });
        }
        await fs.writeFile(getFolder() + 'stats.json', JSON.stringify(stats), 'utf-8');
    } catch(e) {
        logger.error('Error saving stats', e);
    }
}

function loadRaw(loaded: Record<string, unknown>) {
    for (const key of Object.keys(stats)) {
        if (hasProp(loaded, key) && (typeof loaded[key] === 'number' || typeof loaded[key] === 'string')) {
            try {
                stats[key as keyof Stats] = parseInt((loaded[key] as string).toString());
            } catch (e) {
                logger.error(`Failed loading number value from item ${key}`, e);
            }
        }
    }
}

export async function loadStats(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'stats.json', 'utf-8'));
        loadRaw(raw);
        loaded = true;
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading stats JSON', e);
        } else {
            logger.info('Stats file could not be found, initializing with default stats');
            if (stats === null || stats === undefined)
                stats = DEFAULT_STATS;
        }
    }
    if (stats === null || stats === undefined)
        stats = DEFAULT_STATS;
}

export async function getStats(): Promise<Stats> {
    if (!loaded) {
        await loadStats();
    }
    return stats;
}

export async function setStats(setTo: Stats) {
    stats = setTo;
}

export async function getStat<K extends keyof Stats>(stat: K): Promise<Stats[K]> {
    if (!loaded) {
        await loadStats();
    }
    return stats[stat];
}

export async function setStat<K extends keyof Stats>(key: K, value: Stats[K]) {
    try {
        stats[key] = value;
    } catch(e) {
        logger.error('Error setting stats key', e);
    }
}
