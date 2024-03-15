import { contextBridge, ipcRenderer } from 'electron';
import { StatsChannel } from '../common/ipc';
import { getStats, setStats, saveStats, loadStats, setStat } from '../main/stats';
import { Stats } from '../common/stats';

export const StatsAPIName = 'StatsAPI';

export interface IStatsAPI {
    getStats: typeof getStats,
    setStat: typeof setStat,
    setStats: typeof setStats,
    saveStats: typeof saveStats,
    loadStats: typeof loadStats,
}

contextBridge.exposeInMainWorld(StatsAPIName, {
    getStats: () => ipcRenderer.invoke(StatsChannel.GET),
    setStat: (key: keyof Stats, value: Stats[keyof Stats]) => ipcRenderer.invoke(StatsChannel.SET_VALUE, key, value),
    setStats: (stats: Stats) => ipcRenderer.invoke(StatsChannel.SET, stats),
    saveStats: () => ipcRenderer.invoke(StatsChannel.SAVE),
    loadStats: () => ipcRenderer.invoke(StatsChannel.LOAD)
});
