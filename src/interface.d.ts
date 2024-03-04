import { RecipeAPIName, IRecipeAPI } from './preload/recipe';
import { ISettingsAPI, SettingsAPIName } from './preload/settings';
import { IGenericAPI, GenericAPIName } from './preload/generic';
import { DisplayAPIName, IDisplayAPI } from './preload/display';
import { ISteamAPI, SteamAPIName } from './preload/steam';

declare global {
    interface Window {
        [RecipeAPIName]: IRecipeAPI
        [SettingsAPIName]: ISettingsAPI
        [GenericAPIName]: IGenericAPI
        [DisplayAPIName]: IDisplayAPI
        [SteamAPIName]: ISteamAPI
    }
}

export {};
