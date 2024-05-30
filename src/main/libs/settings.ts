import { promises as fs } from 'fs';
import { getFolder, getSteamGameLanguage } from './steam';
import { verifyFolder } from '../utils';
import { DEFAULT_SETTINGS, RawSettings, Settings } from '../../common/settings';
import logger from 'electron-log/main';
import { FileVersionError } from '../../common/types/saveFormat';

const SETTINGS_VERISON = 3;

let settings: Settings = DEFAULT_SETTINGS;
let loaded = false;
let loadedVersion: number = FileVersionError.NOT_LOADED;

export function getSettingsVersion(): number {
    return loadedVersion;
}

export async function saveSettings(): Promise<void> {
    try {
        await verifyFolder();
        await fs.writeFile(getFolder() + 'settings.json', JSON.stringify({
            version: SETTINGS_VERISON,
            settings: settings
        }), 'utf-8');
    } catch(e) {
        logger.error('Error saving settings', e);
    }
}

function loadV1(loaded: RawSettings) {
    settings = {
        theme: loaded.theme ?? ((loaded.dark ?? DEFAULT_SETTINGS.theme === 'dark') ? 'dark' : 'light'),
        fullscreen: loaded.fullscreen,
        offline: loaded.offline,
        currentDisplay: loaded.currentDisplay,
        background: loaded.background,
        sidebar: loaded.sidebar,
        language: loaded.language,
        languageSet: loaded.languageSet,
        volume: loaded.volume,
        muted: loaded.muted,
        fps: loaded.fps,
        keybinds: loaded.keybinds ?? DEFAULT_SETTINGS.keybinds
    };
}

function loadV2(loaded: RawSettings) {
    loadV1(loaded);
}

function loadV3(loaded: RawSettings) {
    loadV1(loaded);
}

export async function loadSettings(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'settings.json', 'utf-8'));
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        if (raw.version === 1) {
            logger.info('Found settings V1', raw.settings);
            loadV1(raw.settings);
            loaded = true;
        } else if (raw.version === 2) {
            logger.info('Found settings V2', raw.settings);
            loadV2(raw.settings);
            loaded = true;
        } else if (raw.version === 3) {
            logger.info('Found settings V3', raw.settings);
            loadV3(raw.settings);
            loaded = true;
        } else {
            loadedVersion = FileVersionError.ERROR;
            logger.error(`Failed to load settings because of unknown version '${raw.version}', has this been altered?`);
        }
    } catch(e) {
        if (e.code !== 'ENOENT') {
            logger.error('Error reading settings JSON', e);
        } else {
            logger.info('Settings file could not be found, initializing with default settings');
            if (settings === null || settings === undefined) {
                settings = DEFAULT_SETTINGS;
                loadedVersion = FileVersionError.DEFAULTS;
            }
            settings.language = getSteamGameLanguage();
        }
    }
    if (settings === null || settings === undefined) {
        logger.warn('Failed to load settings, using defaults');
        settings = DEFAULT_SETTINGS;
        loadedVersion = FileVersionError.DEFAULTS;
    }
}

export async function getSettings(force: boolean): Promise<Settings> {
    logger.debug('getSettings', force);
    if (!loaded || force) {
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
