import { app } from 'electron';
import * as appInfo from '../../package.json';
import { SystemVersion, AppVersions } from '../common/types';

export function getAppVersions(): AppVersions {
    return {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        app: appInfo.version
    }
}

export function getSystemInformation(): SystemVersion {
    return {
        version: process.getSystemVersion(),
        platform: process.platform.toString(),
        arch: process.arch.toString()
    }
}

export function isPackaged(): boolean {
    return app.isPackaged;
}