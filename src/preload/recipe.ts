import { contextBridge, ipcRenderer } from 'electron';
import { Recipe } from '../common/types';
import { deleteRecipe, exportDatabase, getAllRecipes, getBaseHint, getRecipe, getRecipesFor, importFile, insertRecipe, resetAndBackup, save } from '../main/database';
import { combine, getToken } from '../main/server';
import { RecipeChannel } from '../common/ipc';

export const RecipeAPIName = 'RecipeAPI';

export interface IRecipeAPI {
    insertRecipe: typeof insertRecipe,
    deleteRecipe: typeof deleteRecipe,
    getRecipe: typeof getRecipe,
    getRecipesFor: typeof getRecipesFor,
    combine: typeof combine,
    getAllRecipes: typeof getAllRecipes,
    save: typeof save,
    reset: typeof resetAndBackup,
    import: typeof importFile,
    export: typeof exportDatabase,
    getBaseHint: typeof getBaseHint,
    getToken: typeof getToken,
}

contextBridge.exposeInMainWorld(RecipeAPIName, {
    insertRecipe: (recipe: Recipe) => ipcRenderer.invoke(RecipeChannel.INSERT, recipe),
    deleteRecipe: (a: string, b: string) => ipcRenderer.invoke(RecipeChannel.DELETE, a, b),
    getRecipe: (a: string, b: string) => ipcRenderer.invoke(RecipeChannel.GET, a, b),
    getRecipesFor: (result: string) => ipcRenderer.invoke(RecipeChannel.GET_FOR, result),
    combine: (a: string, b: string) => ipcRenderer.invoke(RecipeChannel.COMBINE, a, b),
    getAllRecipes: () => ipcRenderer.invoke(RecipeChannel.GET_ALL),
    save: () => ipcRenderer.invoke(RecipeChannel.SAVE),
    reset: () => ipcRenderer.invoke(RecipeChannel.RESET),
    import: () => ipcRenderer.invoke(RecipeChannel.IMPORT),
    export: () => ipcRenderer.invoke(RecipeChannel.EXPORT),
    getBaseHint: () => ipcRenderer.invoke(RecipeChannel.BASE_HINT),
    getToken: () => ipcRenderer.invoke(RecipeChannel.GET_TOKEN),
});
