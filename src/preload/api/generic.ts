import { contextBridge, ipcRenderer } from 'electron';
import { GenericChannel } from '../../common/ipc';
import { getAppVersions, isPackaged, getSystemInformation, quit, getFileVersions } from '../../main/libs/generic';

export const GenericAPIName = 'GenericAPI';

export interface IGenericAPI {
    getSystemInformation: typeof getSystemInformation
    getAppVersions: typeof getAppVersions
    getFileVersions: typeof getFileVersions
    isPackaged: typeof isPackaged
    quit: typeof quit
}

contextBridge.exposeInMainWorld(GenericAPIName, {
    getSystemInformation: () => ipcRenderer.invoke(GenericChannel.GET_SYSTEM_INFO),
    getAppVersions: () => ipcRenderer.invoke(GenericChannel.GET_VERSIONS),
    getFileVersions: () => ipcRenderer.invoke(GenericChannel.GET_FILE_VERSIONS),
    isPackaged: () => ipcRenderer.invoke(GenericChannel.GET_IS_PACKAGED),
    quit: () => ipcRenderer.invoke(GenericChannel.QUIT)
});
