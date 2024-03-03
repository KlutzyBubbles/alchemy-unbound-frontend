import { RecipeAPIName, IRecipeAPI } from "./preload/recipe"
import { ISettingsAPI, SettingsAPIName } from "./preload/settings"
import { IGenericAPI, GenericAPIName } from "./preload/generic"
import { DisplayAPIName, IDisplayAPI } from "./preload/display"

declare global {
    interface Window {
        [RecipeAPIName]: IRecipeAPI
        [SettingsAPIName]: ISettingsAPI
        [GenericAPIName]: IGenericAPI
        [DisplayAPIName]: IDisplayAPI
    }
}

export {}