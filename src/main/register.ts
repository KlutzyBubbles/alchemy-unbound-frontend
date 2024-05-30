import { ipcMain } from 'electron';
import { ErrorEntryAdd, Recipe } from '../common/types';
import { insertRecipe, deleteRecipe, getRecipe, getAllRecipes, save, resetAndBackup, getRecipesFor, hasAllRecipes, hasAtleastRecipe } from './libs/database/recipeStore';
import { addItem, checkDLC, combine, getEndpoint, getMission, getToken, getUserDetails, getVersion, initTransaction, restorePurchases } from './libs/server';
import { DisplayChannel, ErrorChannel, GenericChannel, HintChannel, ImportExportChannel, InfoChannel, ProfileChannel, RecipeChannel, ServerChannel, SettingsChannel, StatsChannel, SteamChannel } from '../common/ipc';
import { Language, Settings } from '../common/settings';
import { getSettings, loadSettings, saveSettings, setSetting, setSettings } from './libs/settings';
import { getAppVersions, isPackaged, getSystemInformation, quit, getFileVersions } from './libs/generic';
import { getCurrentDisplay, getDisplays, isFullscreen, moveToDisplay, setFullscreen } from './libs/display';
import { activateAchievement, getSteamGameLanguage, getSteamId, getUsername, isAchievementActivated, isDlcInstalled } from './libs/steam';
import { getStats, loadStats, saveStats, setStat, setStats } from './libs/stats';
import { Stats } from '../common/stats';
import { addHintPoint, fillHints, getHint, getHintsLeft, getMaxHints, hintComplete, loadHint, resetHint, saveHint } from './libs/hints';
import { exportDatabase, importFile } from './libs/importexport';
import { getErrors, registerError } from './libs/error';
import { Info } from '../common/info';
import { addTheme, getInfo, loadInfo, removeTheme, saveInfo, setInfo, setInfoKey } from './libs/info';
import { DatabaseData, MissionType } from '../common/types/saveFormat';
import { switchProfile } from './libs/database/profiles';


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
    ipcMain.handle(ServerChannel.GET_VERSION, async () => {
        return getVersion();
    });
    ipcMain.handle(ServerChannel.GET_ENDPOINT, async () => {
        return getEndpoint();
    });
    ipcMain.handle(ServerChannel.INIT_TRANSACTION, async (_, item: string) => {
        return initTransaction(item);
    });
    ipcMain.handle(ServerChannel.GET_USER_INFO, async () => {
        return getUserDetails();
    });
    ipcMain.handle(ServerChannel.CHECK_DLC, async () => {
        return checkDLC();
    });
    ipcMain.handle(ServerChannel.RESTORE_PURCHASES, async () => {
        return restorePurchases();
    });
    ipcMain.handle(ServerChannel.ADD_ITEM, async (_, item: string, language: Language) => {
        return addItem(item, language);
    });
    ipcMain.handle(ServerChannel.GET_MISSION, async (_, type: MissionType) => {
        return getMission(type);
    });

    // Error handlers
    ipcMain.handle(ErrorChannel.REGISTER, async (_, error: ErrorEntryAdd) => {
        return registerError(error);
    });
    ipcMain.handle(ErrorChannel.GET_ALL, async () => {
        return getErrors();
    });

    // Profile handlers
    ipcMain.handle(ProfileChannel.SWITCH, async (_, profile: string, info: DatabaseData) => {
        return switchProfile(profile, info);
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

    // Info handlers
    ipcMain.handle(InfoChannel.SET_VALUE, async (_, key: keyof Info, value: Info[keyof Info]) => {
        return setInfoKey(key, value);
    });
    ipcMain.handle(InfoChannel.GET, async () => {
        return getInfo();
    });
    ipcMain.handle(InfoChannel.SET, async (_, info: Info) => {
        return setInfo(info);
    });
    ipcMain.handle(InfoChannel.LOAD, async () => {
        return loadInfo();
    });
    ipcMain.handle(InfoChannel.SAVE, async () => {
        return saveInfo();
    });
    ipcMain.handle(InfoChannel.ADD_THEME, async (_, theme: string) => {
        return addTheme(theme);
    });
    ipcMain.handle(InfoChannel.REMOVE_THEME, async (_, theme: string) => {
        return removeTheme(theme);
    });

    // Generic handlers
    ipcMain.handle(GenericChannel.GET_VERSIONS, async () => {
        return getAppVersions();
    });
    ipcMain.handle(GenericChannel.GET_FILE_VERSIONS, async () => {
        return getFileVersions();
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
    ipcMain.handle(DisplayChannel.GET_FULLSCREEN, async () => {
        return isFullscreen();
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
    ipcMain.handle(SteamChannel.GET_NAME, async () => {
        return getUsername();
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
    ipcMain.handle(HintChannel.RESET, async (_, soft?: boolean) => {
        return resetHint(soft);
    });
    ipcMain.handle(HintChannel.COMPLETE, async () => {
        return hintComplete();
    });
    ipcMain.handle(HintChannel.FILL, async () => {
        return fillHints();
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
