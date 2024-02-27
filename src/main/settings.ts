import { promises as fs } from 'fs';
import { getFolder } from './steam';
import { dirExists } from '../common/utils';

const SETTINGS_VERISON = 1;

export type BackgroundType = 'blank' | 'particles' | 'rain'
export type LeftRight = 'left' | 'right'

var settings: {
    dark: boolean,
    background: BackgroundType
    sidebar: LeftRight
} = {
    dark: false,
    background: 'particles',
    sidebar: 'right'
};

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
        } else {
            console.error('Failed to load settings because of unknown version, has this been altered?')
        }
    } catch(e) {
        console.error('Error reading JSON')
        console.error(e)
    }
}
