import { contextBridge, ipcRenderer } from 'electron';
import { DisplayChannel } from '../common/ipc';
import { getCurrentDisplay, getDisplays, moveToDisplay, setFullscreen } from '../main/display';

export const DisplayAPIName = 'DisplayAPI';

export interface IDisplayAPI {
    getDisplays: typeof getDisplays
    getCurrentDisplay: typeof getCurrentDisplay
    moveToDisplay: typeof moveToDisplay
    setFullscreen: typeof setFullscreen
}

contextBridge.exposeInMainWorld(DisplayAPIName, {
    getDisplays: () => ipcRenderer.invoke(DisplayChannel.GET_DISPLAYS),
    getCurrentDisplay: () => ipcRenderer.invoke(DisplayChannel.GET_DISPLAY),
    moveToDisplay: (display: Electron.Display) => ipcRenderer.invoke(DisplayChannel.SET_DISPLAY, display),
    setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke(DisplayChannel.SET_FULLSCREEN, fullscreen)
});
