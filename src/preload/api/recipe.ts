import { contextBridge, ipcRenderer } from 'electron';
import { Recipe } from '../../common/types';
import { deleteRecipe, getAllRecipes, getRecipe, getRecipesFor, hasAllRecipes, insertRecipe, save } from '../../main/libs/database';
import { RecipeChannel } from '../../common/ipc';

export const RecipeAPIName = 'RecipeAPI';

export interface IRecipeAPI {
    insertRecipe: typeof insertRecipe,
    deleteRecipe: typeof deleteRecipe,
    getRecipe: typeof getRecipe,
    getRecipesFor: typeof getRecipesFor,
    getAllRecipes: typeof getAllRecipes,
    save: typeof save,
    hasAllRecipes: typeof hasAllRecipes,
}

contextBridge.exposeInMainWorld(RecipeAPIName, {
    insertRecipe: (recipe: Recipe) => ipcRenderer.invoke(RecipeChannel.INSERT, recipe),
    deleteRecipe: (a: string, b: string) => ipcRenderer.invoke(RecipeChannel.DELETE, a, b),
    getRecipe: (a: string, b: string) => ipcRenderer.invoke(RecipeChannel.GET, a, b),
    getRecipesFor: (result: string) => ipcRenderer.invoke(RecipeChannel.GET_FOR, result),
    getAllRecipes: () => ipcRenderer.invoke(RecipeChannel.GET_ALL),
    save: () => ipcRenderer.invoke(RecipeChannel.SAVE),
    hasAllRecipes: (result: string) => ipcRenderer.invoke(RecipeChannel.HAS_ALL, result),
});
