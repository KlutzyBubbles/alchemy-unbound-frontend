import { RecipeAPIName, IRecipeAPI } from "./preload/recipe"
import { ISettingsAPI, SettingsAPIName } from "./preload/settings"

declare global {
    interface Window {
        [RecipeAPIName]: IRecipeAPI
        [SettingsAPIName]: ISettingsAPI
    }
}

export {}