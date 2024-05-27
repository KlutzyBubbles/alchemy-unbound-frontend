import { contextBridge, ipcRenderer } from 'electron';
import { addItem, checkDLC, combine, getEndpoint, getToken, getUserDetails, getVersion, initTransaction, restorePurchases } from '../../main/libs/server';
import { ServerChannel } from '../../common/ipc';
import { Language } from 'src/common/settings';

export const ServerAPIName = 'ServerAPI';

export interface IServerAPI {
    combine: typeof combine,
    getToken: typeof getToken,
    getVersion: typeof getVersion,
    getEndpoint: typeof getEndpoint
    initTransaction: typeof initTransaction
    getUserDetails: typeof getUserDetails
    restorePurchases: typeof restorePurchases
    checkDLC: typeof checkDLC
    addItem: typeof addItem
}

contextBridge.exposeInMainWorld(ServerAPIName, {
    combine: (a: string, b: string) => ipcRenderer.invoke(ServerChannel.COMBINE, a, b),
    addItem: (item: string, language: Language) => ipcRenderer.invoke(ServerChannel.ADD_ITEM, item, language),
    getToken: () => ipcRenderer.invoke(ServerChannel.GET_TOKEN),
    getVersion: () => ipcRenderer.invoke(ServerChannel.GET_VERSION),
    getEndpoint: () => ipcRenderer.invoke(ServerChannel.GET_ENDPOINT),
    initTransaction: (item: string) => ipcRenderer.invoke(ServerChannel.INIT_TRANSACTION, item),
    getUserDetails: () => ipcRenderer.invoke(ServerChannel.GET_USER_INFO),
    checkDLC: () => ipcRenderer.invoke(ServerChannel.CHECK_DLC),
    restorePurchases: () => ipcRenderer.invoke(ServerChannel.RESTORE_PURCHASES),
});
