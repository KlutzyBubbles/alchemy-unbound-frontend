import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists } from '../common/utils';
import { DEFAULT_SETTINGS, Settings } from '../common/settings';

const SETTINGS_VERISON = 1;

var settings: Settings = DEFAULT_SETTINGS;
var loaded = false;

export async function saveSettings(): Promise<void> {
    if (!(await dirExists(getFolder()))) {
        await fs.mkdir(getFolder(), { recursive: true })
    }
    await fs.writeFile(getFolder() + 'settings.json', JSON.stringify({
        version: SETTINGS_VERISON,
        settings: settings
    }), 'utf-8')
}

function loadV1(loaded: any) {
    settings = loaded
}

export async function loadSettings(): Promise<void> {
    try {
        var raw = JSON.parse(await fs.readFile(getFolder() + 'settings.json', 'utf-8'))
        if (raw.version === 1) {
            loadV1(raw.settings)
            loaded = true;
        } else {
            console.error('Failed to load settings because of unknown version, has this been altered?')
        }
    } catch(e) {
        console.error('Error reading JSON')
        console.error(e)
    }
}

export async function getSettings(): Promise<Settings> {
    if (!loaded) {
        await loadSettings()
    }
    return settings
}

export function setSettings(setTo: Settings) {
    settings = setTo
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settings[key] = value
}
