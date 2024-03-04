import { ipcMain } from "electron";
import { Recipe } from "../common/types";
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save } from "./database";
import { combine } from "./server";
import { DisplayChannel, GenericChannel, RecipeChannel, SettingsChannel, SteamChannel } from "../common/ipc";
import { Settings } from "../common/settings";
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from "./settings";
import { getAppVersions, isPackaged, getSystemInformation } from "./generic";
import { getCurrentDisplay, getDisplays, moveToDisplay, setFullscreen } from "./display";
import { activateAchievement, getSteamGameLanguage, getSteamId, isAchievementActivated } from "./steam";


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
    ipcMain.handle(RecipeChannel.GET_ALL, async (_) => {
        return getAllRecipes();
    });
    ipcMain.handle(RecipeChannel.SAVE, async (_) => {
        return save();
    });

    // Settings handlers
    ipcMain.handle(SettingsChannel.SET_VALUE, async (_, key: keyof Settings, value: Settings[keyof Settings]) => {
        return setSetting(key, value);
    });
    ipcMain.handle(SettingsChannel.GET, async (_) => {
        return getSettings();
    });
    ipcMain.handle(SettingsChannel.SET, async (_, settings: Settings) => {
        return setSettings(settings);
    });
    ipcMain.handle(SettingsChannel.LOAD, async (_) => {
        return loadSettings();
    });
    ipcMain.handle(SettingsChannel.SAVE, async (_) => {
        return saveSettings();
    });
    getSteamGameLanguage
    // Generic handlers
    ipcMain.handle(GenericChannel.GET_VERSIONS, async (_) => {
        return getAppVersions();
    });
    ipcMain.handle(GenericChannel.GET_SYSTEM_INFO, async (_) => {
        return getSystemInformation();
    });
    ipcMain.handle(GenericChannel.GET_IS_PACKAGED, async (_) => {
        return isPackaged();
    });

    // Display handlers
    ipcMain.handle(DisplayChannel.GET_DISPLAYS, async (_) => {
        return getDisplays();
    });
    ipcMain.handle(DisplayChannel.GET_DISPLAY, async (_) => {
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
    ipcMain.handle(SteamChannel.GET_ID, async (_) => {
        return getSteamId();
    });
    ipcMain.handle(SteamChannel.GET_LANGUAGE, async (_) => {
        return getSteamGameLanguage();
    });
}