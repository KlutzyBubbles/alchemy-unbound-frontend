import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { verifyFolder } from '../utils';
import logger from 'electron-log/main';
import { DEFAULT_INFO, Info } from '../../common/info';
import { getSettings, saveSettings, setSetting } from './settings';
import { DEFAULT_SETTINGS } from '../../common/settings';

let info: Info = DEFAULT_INFO;
let loaded = false;

export async function saveInfo(): Promise<void> {
    try {
        await verifyFolder();
        await fs.writeFile(getFolder() + 'info.json', JSON.stringify(info), 'utf-8');
    } catch(e) {
        logger.error('Error saving info', e);
    }
}

function loadRaw(loaded: Record<string, unknown>) {
    info = loaded as Info;
}

export async function loadInfo(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'info.json', 'utf-8'));
        loadRaw(raw);
        loaded = true;
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading info JSON', e);
        } else {
            logger.info('Info file could not be found, initializing with default info');
            if (info === null || info === undefined)
                info = DEFAULT_INFO;
        }
    }
    if (info === null || info === undefined)
        info = DEFAULT_INFO;
}

export async function getInfo(): Promise<Info> {
    if (!loaded) {
        await loadInfo();
    }
    return info;
}

export async function setInfo(setTo: Info) {
    info = setTo;
}

export async function getInfoKey<K extends keyof Info>(infokey: K): Promise<Info[K]> {
    if (!loaded) {
        await loadInfo();
    }
    return info[infokey];
}

export async function setInfoKey<K extends keyof Info>(key: K, value: Info[K]) {
    try {
        info[key] = value;
    } catch(e) {
        logger.error('Error setting info key', e);
    }
}

export async function addTheme(theme: string) {
    if (!info.themesUnlocked.includes(theme)) {
        info.themesUnlocked.push(theme);
        await saveInfo();
    }
}

export async function removeTheme(theme: string) {
    const index = info.themesUnlocked.indexOf(theme);
    if (index > -1) {
        info.themesUnlocked.splice(index, 1);
    }
    await saveInfo();
    if ((await getSettings(false)).theme === theme) {
        await setSetting('theme', DEFAULT_SETTINGS.theme);
        await saveSettings();
    }
}
