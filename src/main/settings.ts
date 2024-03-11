import { promises as fs } from 'fs';
import { getFolder, getSteamGameLanguage } from './steam';
import { dirExists } from './utils';
import { DEFAULT_SETTINGS, RawSettings, Settings } from '../common/settings';

const SETTINGS_VERISON = 1;

let settings: Settings = DEFAULT_SETTINGS;
let loaded = false;

export async function saveSettings(): Promise<void> {
    console.log('saving settings', settings);
    try {
        if (!(await dirExists(getFolder()))) {
            await fs.mkdir(getFolder(), { recursive: true });
        }
        await fs.writeFile(getFolder() + 'settings.json', JSON.stringify({
            version: SETTINGS_VERISON,
            settings: settings
        }), 'utf-8');
    } catch(e) {
        console.error('Error saving on main side', e);
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
            console.error('Failed to load settings because of unknown version, has this been altered?');
        }
    } catch(e) {
        if (e.code !== 'ENOENT') {
            console.error('Error reading JSON');
            console.error(e);
        } else {
            console.log('No settings file found yet');
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
    console.log('returning settings', settings);
    return settings;
}

export async function setSettings(setTo: Settings) {
    console.log('setting settings', settings);
    settings = setTo;
}

export async function getSetting<K extends keyof Settings>(setting: K): Promise<Settings[K]> {
    console.log('getting setting', setting);
    if (!loaded) {
        await loadSettings();
    }
    return settings[setting];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    try {
        settings[key] = value;
    } catch(e) {
        console.error('Error setting settings key', e);
    }
}
