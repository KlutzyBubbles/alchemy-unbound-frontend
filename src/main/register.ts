import { ipcMain } from "electron";
import { Recipe } from "../common/types";
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save } from "./database";
import { combine } from "./server";
import { RecipeChannel, SettingsChannel } from "../common/ipc";
import { Settings } from "../common/settings";
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from "./settings";


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
}