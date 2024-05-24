import { RecipeAPIName, IRecipeAPI } from './preload/api/recipe';
import { ISettingsAPI, SettingsAPIName } from './preload/api/settings';
import { IGenericAPI, GenericAPIName } from './preload/api/generic';
import { DisplayAPIName, IDisplayAPI } from './preload/api/display';
import { ISteamAPI, SteamAPIName } from './preload/api/steam';
import 'react';
import { IStatsAPI, StatsAPIName } from './preload/api/stats';
import { HintAPIName, IHintAPI } from './preload/api/hints';
import { IImportExportAPI, ImportExportAPIName } from './preload/api/importexport';
import { IServerAPI, ServerAPIName } from './preload/api/server';
import { ErrorAPIName, IErrorAPI } from './preload/api/error';
import { IInfoAPI, InfoAPIName } from './preload/api/info';

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
        [InfoAPIName]: IInfoAPI
        [StatsAPIName]: IStatsAPI
        [HintAPIName]: IHintAPI
        [ImportExportAPIName]: IImportExportAPI
        [ServerAPIName]: IServerAPI
        [ErrorAPIName]: IErrorAPI
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
