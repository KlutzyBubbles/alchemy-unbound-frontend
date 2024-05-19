import { app } from 'electron';
import * as appInfo from '../../../package.json';
import { SystemVersion, AppVersions, FileVersions } from '../../common/types';
import { getHintVersion } from './hints';
import { getDatabaseVersion } from './database/recipeStore';
import { getSettingsVersion } from './settings';

export function getAppVersions(): AppVersions {
    return {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        app: getAppVersion()
    };
}

export function getFileVersions(): FileVersions {
    return {
        database: getDatabaseVersion(),
        hint: getHintVersion(),
        stats: -1,
        settings: getSettingsVersion()
    };
}

export function getAppVersion(): string {
    return  appInfo.version;
}

export function getSystemInformation(): SystemVersion {
    return {
        version: process.getSystemVersion(),
        platform: process.platform.toString(),
        arch: process.arch.toString()
    };
}

export function isPackaged(): boolean {
    return app.isPackaged;
}

export function quit(): void {
    return app.quit();
}
