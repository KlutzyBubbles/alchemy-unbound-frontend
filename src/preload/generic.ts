import { contextBridge, ipcRenderer } from 'electron'
import { GenericChannel } from '../common/ipc'
import { getAppVersions, isPackaged, getSystemInformation } from '../main/generic'

export const GenericAPIName = 'GenericAPI'

export interface IGenericAPI {
    getSystemInformation: typeof getSystemInformation
    getAppVersions: typeof getAppVersions
    isPackaged: typeof isPackaged
}

contextBridge.exposeInMainWorld(GenericAPIName, {
    getSystemInformation: () => ipcRenderer.invoke(GenericChannel.GET_SYSTEM_INFO),
    getAppVersions: () => ipcRenderer.invoke(GenericChannel.GET_VERSIONS),
    isPackaged: () => ipcRenderer.invoke(GenericChannel.GET_IS_PACKAGED)
})
