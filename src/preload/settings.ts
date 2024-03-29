import { contextBridge, ipcRenderer } from 'electron';
import { Settings } from '../common/settings';
import { getSettings, setSettings, saveSettings, loadSettings, setSetting } from '../main/settings';
import { SettingsChannel } from '../common/ipc';

export const SettingsAPIName = 'SettingsAPI';

export interface ISettingsAPI {
    getSettings: typeof getSettings,
    setSetting: typeof setSetting,
    setSettings: typeof setSettings,
    saveSettings: typeof saveSettings,
    loadSettings: typeof loadSettings,
}

contextBridge.exposeInMainWorld(SettingsAPIName, {
    getSettings: (force: boolean) => ipcRenderer.invoke(SettingsChannel.GET, force),
    setSetting: (key: keyof Settings, value: Settings[keyof Settings]) => ipcRenderer.invoke(SettingsChannel.SET_VALUE, key, value),
    setSettings: (settings: Settings) => ipcRenderer.invoke(SettingsChannel.SET, settings),
    saveSettings: () => ipcRenderer.invoke(SettingsChannel.SAVE),
    loadSettings: () => ipcRenderer.invoke(SettingsChannel.LOAD)
});
