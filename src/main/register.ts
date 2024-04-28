import { ipcMain } from 'electron';
import { ErrorEntryAdd, Recipe } from '../common/types';
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save, resetAndBackup, getRecipesFor, hasAllRecipes, hasAtleastRecipe } from './libs/database';
import { combine, getToken, submitIdea } from './libs/server';
import { DisplayChannel, ErrorChannel, GenericChannel, HintChannel, ImportExportChannel, RecipeChannel, ServerChannel, SettingsChannel, StatsChannel, SteamChannel } from '../common/ipc';
import { Settings } from '../common/settings';
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from './libs/settings';
import { getAppVersions, isPackaged, getSystemInformation, quit } from './libs/generic';
import { getCurrentDisplay, getDisplays, moveToDisplay, setFullscreen } from './libs/display';
import { activateAchievement, getSteamGameLanguage, getSteamId, isAchievementActivated, isDlcInstalled } from './libs/steam';
import { getStats, loadStats, saveStats, setStat, setStats } from './libs/stats';
import { Stats } from '../common/stats';
import { addHintPoint, getHint, getHintsLeft, getMaxHints, hintComplete, loadHint, resetHint, saveHint } from './libs/hints';
import { exportDatabase, importFile } from './libs/importexport';
import { getErrors, registerError } from './libs/error';


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
    ipcMain.handle(RecipeChannel.GET_ALL, async () => {
        return getAllRecipes();
    });
    ipcMain.handle(RecipeChannel.GET_FOR, async (_, result: string) => {
        return getRecipesFor(result);
    });
    ipcMain.handle(RecipeChannel.SAVE, async () => {
        return save();
    });
    ipcMain.handle(RecipeChannel.HAS_ALL, async (_, result: string) => {
        return hasAllRecipes(result);
    });
    ipcMain.handle(RecipeChannel.HAS_ATLEAST, async (_, result: string) => {
        return hasAtleastRecipe(result);
    });

    // Server handlers
    ipcMain.handle(ServerChannel.COMBINE, async (_, a: string, b: string) => {
        return combine(a, b);
    });
    ipcMain.handle(ServerChannel.GET_TOKEN, async () => {
        return getToken();
    });
    ipcMain.handle(ServerChannel.IDEA, async (_, a: string, b: string, result: string) => {
        return submitIdea(a, b, result);
    });

    // Error handlers
    ipcMain.handle(ErrorChannel.REGISTER, async (_, error: ErrorEntryAdd) => {
        return registerError(error);
    });
    ipcMain.handle(ErrorChannel.GET_ALL, async () => {
        return getErrors();
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
    
    // Hint handlers
    ipcMain.handle(HintChannel.SAVE, async () => {
        return saveHint();
    });
    ipcMain.handle(HintChannel.LOAD, async () => {
        return loadHint();
    });
    ipcMain.handle(HintChannel.ADD_POINT, async (_, hintPoints: number) => {
        return addHintPoint(hintPoints);
    });
    ipcMain.handle(HintChannel.GET, async (_, generate: boolean) => {
        return getHint(generate);
    });
    ipcMain.handle(HintChannel.GET_LEFT, async () => {
        return getHintsLeft();
    });
    ipcMain.handle(HintChannel.GET_MAX, async () => {
        return getMaxHints();
    });
    ipcMain.handle(HintChannel.RESET, async () => {
        return resetHint();
    });
    ipcMain.handle(HintChannel.COMPLETE, async () => {
        return hintComplete();
    });

    // Import Export Handlers
    ipcMain.handle(ImportExportChannel.RESET, async () => {
        return resetAndBackup();
    });
    ipcMain.handle(ImportExportChannel.IMPORT, async () => {
        return importFile();
    });
    ipcMain.handle(ImportExportChannel.EXPORT, async () => {
        return exportDatabase();
    });
}
