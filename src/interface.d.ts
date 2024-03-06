import { RecipeAPIName, IRecipeAPI } from './preload/recipe';
import { ISettingsAPI, SettingsAPIName } from './preload/settings';
import { IGenericAPI, GenericAPIName } from './preload/generic';
import { DisplayAPIName, IDisplayAPI } from './preload/display';
import { ISteamAPI, SteamAPIName } from './preload/steam';
import 'react';

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}

declare global {
    interface Window {
        [RecipeAPIName]: IRecipeAPI
        [SettingsAPIName]: ISettingsAPI
        [GenericAPIName]: IGenericAPI
        [DisplayAPIName]: IDisplayAPI
        [SteamAPIName]: ISteamAPI
    }
}
declare module 'vanta/dist/vanta.birds.min';
declare module 'vanta/dist/vanta.cells.min';
declare module 'vanta/dist/vanta.clouds.min';
declare module 'vanta/dist/vanta.clouds2.min';
declare module 'vanta/dist/vanta.dots.min';
declare module 'vanta/dist/vanta.fog.min';
declare module 'vanta/dist/vanta.globe.min';
declare module 'vanta/dist/vanta.halo.min';
declare module 'vanta/dist/vanta.net.min';
declare module 'vanta/dist/vanta.rings.min';
declare module 'vanta/dist/vanta.ripple.min';
declare module 'vanta/dist/vanta.topology.min';
declare module 'vanta/dist/vanta.trunk.min';
declare module 'vanta/dist/vanta.waves.min';

export {};
