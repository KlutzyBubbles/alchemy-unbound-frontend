import { promises as fs } from 'fs';
import { getFolder, getSteamGameLanguage } from './steam';
import { dirExists } from './utils';
import { DEFAULT_SETTINGS, RawSettings, Settings } from '../common/settings';
import logger from 'electron-log/main';

const SETTINGS_VERISON = 1;

let settings: Settings = DEFAULT_SETTINGS;
let loaded = false;

export async function saveSettings(): Promise<void> {
    try {
        if (!(await dirExists(getFolder()))) {
            await fs.mkdir(getFolder(), { recursive: true });
        }
        await fs.writeFile(getFolder() + 'settings.json', JSON.stringify({
            version: SETTINGS_VERISON,
            settings: settings
        }), 'utf-8');
    } catch(e) {
        logger.error('Error saving settings', e);
    }
}

function loadV1(loaded: RawSettings) {
    settings = loaded;
}

export async function loadSettings(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'settings.json', 'utf-8'));
        if (raw.version === 1) {
            loadV1(raw.settings);
            loaded = true;
        } else {
            logger.error(`Failed to load settings because of unknown version '${raw.version}', has this been altered?`);
        }
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading settings JSON', e);
        } else {
            logger.info('Settings file could not be found, initializing with default settings');
            if (settings === null || settings === undefined)
                settings = DEFAULT_SETTINGS;
            settings.language = getSteamGameLanguage();
        }
    }
    if (settings === null || settings === undefined)
        settings = DEFAULT_SETTINGS;
}

export async function getSettings(): Promise<Settings> {
    if (!loaded) {
        await loadSettings();
    }
    return settings;
}

export async function setSettings(setTo: Settings) {
    settings = setTo;
}

export async function getSetting<K extends keyof Settings>(setting: K): Promise<Settings[K]> {
    if (!loaded) {
        await loadSettings();
    }
    return settings[setting];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    try {
        settings[key] = value;
    } catch(e) {
        logger.error('Error setting settings ke', e);
    }
}
