import { ipcMain } from 'electron';
import { Recipe } from '../common/types';
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save, resetAndBackup } from './database';
import { combine } from './server';
import { DisplayChannel, GenericChannel, RecipeChannel, SettingsChannel, SteamChannel } from '../common/ipc';
import { Settings } from '../common/settings';
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from './settings';
import { getAppVersions, isPackaged, getSystemInformation, quit } from './generic';
import { getCurrentDisplay, getDisplays, moveToDisplay, setFullscreen } from './display';
import { activateAchievement, getSteamGameLanguage, getSteamId, isAchievementActivated } from './steam';


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
    ipcMain.handle(RecipeChannel.SAVE, async () => {
        return save();
    });
    ipcMain.handle(RecipeChannel.RESET, async () => {
        return resetAndBackup();
    });

    // Settings handlers
    ipcMain.handle(SettingsChannel.SET_VALUE, async (_, key: keyof Settings, value: Settings[keyof Settings]) => {
        return setSetting(key, value);
    });
    ipcMain.handle(SettingsChannel.GET, async () => {
        return getSettings();
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
    getSteamGameLanguage;
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
    ipcMain.handle(SteamChannel.GET_ID, async () => {
        return getSteamId();
    });
    ipcMain.handle(SteamChannel.GET_LANGUAGE, async () => {
        return getSteamGameLanguage();
    });
}
