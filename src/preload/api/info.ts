import { contextBridge, ipcRenderer } from 'electron';
import { InfoChannel } from '../../common/ipc';
import { getInfo, setInfo, saveInfo, loadInfo, setInfoKey, addTheme, removeTheme } from '../../main/libs/info';
import { Info } from '../../common/info';

export const InfoAPIName = 'InfoAPI';

export interface IInfoAPI {
    getInfo: typeof getInfo,
    setInfoKey: typeof setInfoKey,
    setInfo: typeof setInfo,
    saveInfo: typeof saveInfo,
    loadInfo: typeof loadInfo,
    addTheme: typeof addTheme,
    removeTheme: typeof removeTheme,
}

contextBridge.exposeInMainWorld(InfoAPIName, {
    getInfo: () => ipcRenderer.invoke(InfoChannel.GET),
    setInfoKey: (key: keyof Info, value: Info[keyof Info]) => ipcRenderer.invoke(InfoChannel.SET_VALUE, key, value),
    setInfo: (info: Info) => ipcRenderer.invoke(InfoChannel.SET, info),
    saveInfo: () => ipcRenderer.invoke(InfoChannel.SAVE),
    loadInfo: () => ipcRenderer.invoke(InfoChannel.LOAD),
    addTheme: (theme: string) => ipcRenderer.invoke(InfoChannel.ADD_THEME, theme),
    removeTheme: (theme: string) => ipcRenderer.invoke(InfoChannel.REMOVE_THEME, theme),
});
