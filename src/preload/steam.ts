import { contextBridge, ipcRenderer } from 'electron';
import { SteamChannel } from '../common/ipc';
import { activateAchievement, getSteamGameLanguage, getSteamId, isAchievementActivated, isDlcInstalled } from '../main/steam';

export const SteamAPIName = 'SteamAPI';

export interface ISteamAPI {
    activateAchievement: typeof activateAchievement
    isAchievementActivated: typeof isAchievementActivated
    getSteamId: typeof getSteamId
    getSteamGameLanguage: typeof getSteamGameLanguage
    isDlcInstalled: typeof isDlcInstalled
}

contextBridge.exposeInMainWorld(SteamAPIName, {
    activateAchievement: (achievement: string) => ipcRenderer.invoke(SteamChannel.ACTIVATE_ACHIEVEMENT, achievement),
    isAchievementActivated: (achievement: string) => ipcRenderer.invoke(SteamChannel.CHECK_ACHIEVEMENT, achievement),
    isDlcInstalled: (appid: number) => ipcRenderer.invoke(SteamChannel.CHECK_DLC, appid),
    getSteamId: () => ipcRenderer.invoke(SteamChannel.GET_ID),
    getSteamGameLanguage: () => ipcRenderer.invoke(SteamChannel.GET_LANGUAGE)
});
