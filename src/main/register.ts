import { ipcMain } from 'electron';
import { Recipe } from '../common/types';
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save, resetAndBackup, importFile, exportDatabase, getRecipesFor, getBaseHint } from './database';
import { combine, getToken } from './server';
import { DisplayChannel, GenericChannel, RecipeChannel, SettingsChannel, StatsChannel, SteamChannel } from '../common/ipc';
import { Settings } from '../common/settings';
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from './settings';
import { getAppVersions, isPackaged, getSystemInformation, quit } from './generic';
import { getCurrentDisplay, getDisplays, moveToDisplay, setFullscreen } from './display';
import { activateAchievement, getSteamGameLanguage, getSteamId, isAchievementActivated, isDlcInstalled } from './steam';
import { getStats, loadStats, saveStats, setStat, setStats } from './stats';
import { Stats } from '../common/stats';


export function register() {
    // Recipe handlers
    ipcMain.handle(RecipeChannel.INSERT, async (_, recipe: Recipe) => {
        return insertRecipe(recipe);
    });
    ipcMain.handle(RecipeChannel.DELETE, async (_, a: string, b: string) => {
        return deleteRecipe(a ,b);
    });
    ipcMain.handle(RecipeChannel.GET, async (_, a: string, b: string) => {
        return getRecipe(a, b);
    });
    ipcMain.handle(RecipeChannel.COMBINE, async (_, a: string, b: string) => {
        return combine(a, b);
    });
    ipcMain.handle(RecipeChannel.GET_ALL, async () => {
        return getAllRecipes();
    });
    ipcMain.handle(RecipeChannel.GET_FOR, async (_, result: string) => {
        return getRecipesFor(result);
    });
    ipcMain.handle(RecipeChannel.SAVE, async () => {
        return save();
    });
    ipcMain.handle(RecipeChannel.RESET, async () => {
        return resetAndBackup();
    });
    ipcMain.handle(RecipeChannel.IMPORT, async () => {
        return importFile();
    });
    ipcMain.handle(RecipeChannel.EXPORT, async () => {
        return exportDatabase();
    });
    ipcMain.handle(RecipeChannel.BASE_HINT, async () => {
        return getBaseHint();
    });
    ipcMain.handle(RecipeChannel.GET_TOKEN, async () => {
        return getToken();
    });

    // Settings handlers
    ipcMain.handle(SettingsChannel.SET_VALUE, async (_, key: keyof Settings, value: Settings[keyof Settings]) => {
        return setSetting(key, value);
    });
    ipcMain.handle(SettingsChannel.GET, async (_, force: boolean) => {
        return getSettings(force);
    });
    ipcMain.handle(SettingsChannel.SET, async (_, settings: Settings) => {
        return setSettings(settings);
    });
    ipcMain.handle(SettingsChannel.LOAD, async () => {
        return loadSettings();
    });
    ipcMain.handle(SettingsChannel.SAVE, async () => {
        return saveSettings();
    });

    // Stats handlers
    ipcMain.handle(StatsChannel.SET_VALUE, async (_, key: keyof Stats, value: Stats[keyof Stats]) => {
        return setStat(key, value);
    });
    ipcMain.handle(StatsChannel.GET, async () => {
        return getStats();
    });
    ipcMain.handle(StatsChannel.SET, async (_, stats: Stats) => {
        return setStats(stats);
    });
    ipcMain.handle(StatsChannel.LOAD, async () => {
        return loadStats();
    });
    ipcMain.handle(StatsChannel.SAVE, async () => {
        return saveStats();
    });

    // Generic handlers
    ipcMain.handle(GenericChannel.GET_VERSIONS, async () => {
        return getAppVersions();
    });
    ipcMain.handle(GenericChannel.GET_SYSTEM_INFO, async () => {
        return getSystemInformation();
    });
    ipcMain.handle(GenericChannel.GET_IS_PACKAGED, async () => {
        return isPackaged();
    });
    ipcMain.handle(GenericChannel.QUIT, async () => {
        return quit();
    });

    // Display handlers
    ipcMain.handle(DisplayChannel.GET_DISPLAYS, async () => {
        return getDisplays();
    });
    ipcMain.handle(DisplayChannel.GET_DISPLAY, async () => {
        return getCurrentDisplay();
    });
    ipcMain.handle(DisplayChannel.SET_DISPLAY, async (_, display: Electron.Display) => {
        return moveToDisplay(display);
    });
    ipcMain.handle(DisplayChannel.SET_FULLSCREEN, async (_, fullscreen: boolean) => {
        return setFullscreen(fullscreen);
    });

    // Steam handlers
    ipcMain.handle(SteamChannel.ACTIVATE_ACHIEVEMENT, async (_, achievement: string) => {
        return activateAchievement(achievement);
    });
    ipcMain.handle(SteamChannel.CHECK_ACHIEVEMENT, async (_, achievement: string) => {
        return isAchievementActivated(achievement);
    });
    ipcMain.handle(SteamChannel.CHECK_DLC, async (_, appid: number) => {
        return isDlcInstalled(appid);
    });
    ipcMain.handle(SteamChannel.GET_ID, async () => {
        return getSteamId();
    });
    ipcMain.handle(SteamChannel.GET_LANGUAGE, async () => {
        return getSteamGameLanguage();
    });
}
