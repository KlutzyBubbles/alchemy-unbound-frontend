import { contextBridge, ipcRenderer } from 'electron';
import { ErrorEntryAdd } from '../../common/types';
import { ErrorChannel } from '../../common/ipc';
import { getErrors, registerError } from 'src/main/libs/error';

export const ErrorAPIName = 'ErrorAPI';

export interface IErrorAPI {
    registerError: typeof registerError,
    getErrors: typeof getErrors,
}

contextBridge.exposeInMainWorld(ErrorAPIName, {
    registerError: (error: ErrorEntryAdd) => ipcRenderer.invoke(ErrorChannel.REGISTER, error),
    getErrors: () => ipcRenderer.invoke(ErrorChannel.GET_ALL),
});
