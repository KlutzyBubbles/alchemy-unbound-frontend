import { contextBridge, ipcRenderer } from 'electron';
import { combine, getEndpoint, getToken, getVersion, initTransaction, submitIdea } from '../../main/libs/server';
import { ServerChannel } from '../../common/ipc';

export const ServerAPIName = 'ServerAPI';

export interface IServerAPI {
    combine: typeof combine,
    getToken: typeof getToken,
    submitIdea: typeof submitIdea,
    getVersion: typeof getVersion,
    getEndpoint: typeof getEndpoint
    initTransaction: typeof initTransaction
}

contextBridge.exposeInMainWorld(ServerAPIName, {
    combine: (a: string, b: string) => ipcRenderer.invoke(ServerChannel.COMBINE, a, b),
    getToken: () => ipcRenderer.invoke(ServerChannel.GET_TOKEN),
    submitIdea: (a: string, b: string, result: string) => ipcRenderer.invoke(ServerChannel.IDEA, a, b, result),
    getVersion: () => ipcRenderer.invoke(ServerChannel.GET_VERSION),
    getEndpoint: () => ipcRenderer.invoke(ServerChannel.GET_ENDPOINT),
    initTransaction: (item: string) => ipcRenderer.invoke(ServerChannel.INIT_TRANSACTION, item),
});
