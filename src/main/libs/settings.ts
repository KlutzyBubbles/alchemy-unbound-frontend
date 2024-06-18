import { promises as fs } from 'fs';
import { getFolder, getSteamGameLanguage } from './steam';
import { verifyFolder } from '../utils';
import { DEFAULT_SETTINGS, Settings, SettingsV1, SettingsV2, SettingsV3 } from '../../common/settings';
import logger from 'electron-log/main';
import { FileVersionError } from '../../common/types/saveFormat';
import { hasProp } from 'src/common/utils';

const SETTINGS_VERISON = 3;

let settings: Settings = DEFAULT_SETTINGS;
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

export function settingsV1toV2(loaded: SettingsV1): SettingsV2 {
    return {
        theme: ((loaded.dark ?? DEFAULT_SETTINGS.theme) === 'dark') ? 'dark' : 'light',
        fullscreen: loaded.fullscreen,
        offline: loaded.offline,
        currentDisplay: loaded.currentDisplay,
        background: loaded.background,
        sidebar: loaded.sidebar,
        language: loaded.language,
        languageSet: loaded.languageSet,
        volume: loaded.volume,
        muted: loaded.muted,
        fps: loaded.fps
    };
}

export function settingsV2toV3(loaded: SettingsV2): SettingsV3 {
    return {
        theme: loaded.theme,
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
        keybinds: DEFAULT_SETTINGS.keybinds
    };
}

export function settingsV3toV4(loaded: SettingsV3): Settings {
    return {
        theme: loaded.theme,
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
        performance: DEFAULT_SETTINGS.performance,
        keybinds: loaded.keybinds
    };
}

function fillUndefined(settings: Settings): Settings {
    settings.background = settings.background ?? DEFAULT_SETTINGS.background;
    settings.currentDisplay = settings.currentDisplay ?? DEFAULT_SETTINGS.currentDisplay;
    settings.fps = settings.fps ?? DEFAULT_SETTINGS.fps;
    settings.fullscreen = settings.fullscreen ?? DEFAULT_SETTINGS.fullscreen;
    settings.keybinds = settings.keybinds ?? DEFAULT_SETTINGS.keybinds;
    settings.language = settings.language ?? DEFAULT_SETTINGS.language;
    settings.languageSet = settings.languageSet ?? DEFAULT_SETTINGS.languageSet;
    settings.muted = settings.muted ?? DEFAULT_SETTINGS.muted;
    settings.offline = settings.offline ?? DEFAULT_SETTINGS.offline;
    settings.performance = settings.performance ?? DEFAULT_SETTINGS.performance;
    settings.sidebar = settings.sidebar ?? DEFAULT_SETTINGS.sidebar;
    settings.theme = settings.theme ?? DEFAULT_SETTINGS.theme;
    settings.volume = settings.volume ?? DEFAULT_SETTINGS.volume;
    return settings;
}

export async function loadSettings(): Promise<void> {
    try {
        const raw = JSON.parse(await fs.readFile(getFolder() + 'settings.json', 'utf-8'));
        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }

        if (raw.version !== undefined) {
            loadedVersion = raw.version;
        } else {
            loadedVersion = 0;
        }
        let workingVersion = raw.version;
        let workingData = raw.settings;
        logger.silly('Settings data', workingVersion, workingData);
        if (workingVersion === 1) {
            logger.info('Found v1 settings, migrating...');
            workingData = settingsV1toV2(workingData);
            workingVersion = 2;
        }
        if (workingVersion === 2) {
            logger.info('Found v2 settings, migrating...');
            workingData = settingsV2toV3(workingData);
            workingVersion = 3;
        }
        if (workingVersion === 3) {
            logger.info('Found v3 settings, migrating...');
            workingData = settingsV3toV4(workingData);
            workingVersion = 4;
        }
        if (workingVersion === 4) {
            logger.info('Found v4 settings, loading...');
            settings = fillUndefined(workingData);
        } else {
            loadedVersion = FileVersionError.UNKOWN_VERSION;
            logger.error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`);
            throw(Error(`Failed to load database because of unknown version '${raw.version}', has this been altered?`));
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
    if (loadedVersion === FileVersionError.NOT_LOADED || force) {
        await loadSettings();
    }
    return settings;
}

export async function setSettings(setTo: Settings) {
    settings = setTo;
}

export async function getSetting<K extends keyof Settings>(setting: K): Promise<Settings[K]> {
    if (loadedVersion === FileVersionError.NOT_LOADED) {
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
