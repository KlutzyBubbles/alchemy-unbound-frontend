import { contextBridge, ipcRenderer } from 'electron';
import { combine, getToken, submitIdea } from '../../main/libs/server';
import { ServerChannel } from '../../common/ipc';

export const ServerAPIName = 'ServerAPI';

export interface IServerAPI {
    combine: typeof combine,
    getToken: typeof getToken,
    submitIdea: typeof submitIdea,
}

contextBridge.exposeInMainWorld(ServerAPIName, {
    combine: (a: string, b: string) => ipcRenderer.invoke(ServerChannel.COMBINE, a, b),
    getToken: () => ipcRenderer.invoke(ServerChannel.GET_TOKEN),
    submitIdea: (a: string, b: string, result: string) => ipcRenderer.invoke(ServerChannel.IDEA, a, b, result),
});
