import { app } from 'electron';
import * as appInfo from '../../../package.json';
import { SystemVersion, AppVersions, FileVersions } from '../../common/types';
import { getHintVersion } from './hints';
import { getDatabaseInfo, getDatabaseVersion } from './database/recipeStore';
import { getSettingsVersion } from './settings';
import { getWorkingDatabase } from './database/workingName';
import { getMissionDBVersion } from './database/missionStore';
import { FileVersionError } from '../../common/types/saveFormat';

export function getAppVersions(): AppVersions {
    return {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        app: getAppVersion()
    };
}

export async function getFileVersions(): Promise<FileVersions> {
    return {
        database: getDatabaseVersion(),
        hint: getHintVersion(),
        stats: FileVersionError.NO_VERSION,
        settings: getSettingsVersion(),
        mission: getMissionDBVersion(),
        databaseInfo: await getDatabaseInfo(),
        databaseName: await getWorkingDatabase()
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
