import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsProvider';
import logger from 'electron-log/renderer';
// import { unlockCheck } from '../utils/achievements';
import { InfoContext } from './InfoProvider';
import { SUPPORTER_DLC, THEME_DLC } from '../../common/types';
import { BackgroundType, DEFAULT_SETTINGS } from '../../common/settings';
// import { LanguageStore } from '../language/store';

export const LoadingContext = createContext<{
    loading: boolean
    setLoading: (loading: boolean) => void,
    loadingVisible: boolean
    setLoadingVisible: (loading: boolean) => void,
        }>({
            loading: true,
            setLoading: (loading: boolean) => { console.log('DEFAULT STILL RUN', loading); },
            loadingVisible: true,
            setLoadingVisible: (loading: boolean) => { console.log('DEFAULT STILL RUN', loading); }
        });

interface LoadingProviderProps {
    children?: ReactNode
}

export const LoadingProvider: FC<LoadingProviderProps> = ({
    children
}) => {
    const { setSettings } = useContext(SettingsContext);
    const { setIsProduction, setHasSupporterTheme, setIsLegacy, setFileVersions, setHasThemePack } = useContext(InfoContext);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingVisible, setLoadingVisible] = useState<boolean>(true);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout>(undefined);

    useEffect(() => {
        (async () => {
            if (loading) {
                setLoadingVisible(true);
                // console.log('Language', LanguageStore);
                try {
                    logger.info('Loading file versions');
                    const versions = await window.GenericAPI.getFileVersions();
                    logger.info('file versions loaded', versions);
                    setFileVersions(versions);
                } catch (e) {
                    logger.error('Failed to load file versions', e);
                }
                try {
                    setIsLegacy((await window.ServerAPI.getVersion()) === 1);
                } catch (e) {
                    logger.error('Failed to load legacy check', e);
                }
                try {
                    setIsProduction(await window.GenericAPI.isPackaged());
                } catch (e) {
                    logger.error('Failed to load production check', e);
                }
                let hasSupporterTheme = false;
                try {
                    hasSupporterTheme = await window.SteamAPI.isDlcInstalled(SUPPORTER_DLC);
                    setHasSupporterTheme(hasSupporterTheme);
                } catch (e) {
                    logger.error('Failed to load production check', e);
                }
                let hasThemePack = false;
                try {
                    hasThemePack = await window.SteamAPI.isDlcInstalled(THEME_DLC);
                    setHasThemePack(hasThemePack);
                } catch (e) {
                    logger.error('Failed to load production check', e);
                }
                try {
                    const result = await window.ServerAPI.getUserDetails();
                    if (result.type === 'error') {
                        logger.error('Failed to load user check', result.result);
                    } else {
                        logger.info('User found from load', result);
                        if (hasSupporterTheme !== result.result.user.supporter) {
                            const newResult = await window.ServerAPI.checkDLC();
                            if (newResult.type === 'error') {
                                logger.error('Failed to load dlc check', newResult.result);
                            } else {
                                logger.info('User found from dlc check', newResult);
                                hasSupporterTheme = result.result.user.supporter;
                                setHasSupporterTheme(hasSupporterTheme);
                            }
                        }
                    }
                } catch (e) {
                    logger.error('Failed to load user', e);
                }
                try {
                    const settings = await window.SettingsAPI.getSettings(true);
                    if (settings === undefined || settings === null) {
                        throw new Error('getSettings returned undefined');
                    }
                    logger.info('Setting settings from load', settings, hasSupporterTheme);
                    if (settings.theme === 'supporter' && !hasSupporterTheme) {
                        settings.theme = DEFAULT_SETTINGS.theme;
                    }
                    if (settings.background === 'bounce' as BackgroundType) {
                        settings.background = DEFAULT_SETTINGS.background;
                    }
                    setSettings(settings);
                } catch (e) {
                    logger.error('Failed to load settings in loader (oops)', e);
                }
                try {
                    const recipes = await window.RecipeAPI.getAllRecipes();
                    const discoveredBaseResults: string[] = [];
                    const discoveredAIResults: string[] = [];
                    let discoveredBaseRecipes: number = 0;
                    let discoveredAIRecipes: number = 0;
                    let baseHighestDepth: number = 0;
                    let aiHighestDepth: number = 0;
                    for (const recipe of recipes) {
                        if (recipe.discovered) {
                            if (recipe.base) {
                                if (!discoveredBaseResults.includes(recipe.result)) {
                                    discoveredBaseResults.push(recipe.result);
                                }
                                if (recipe.depth > baseHighestDepth) {
                                    baseHighestDepth = recipe.depth;
                                }
                                discoveredBaseRecipes++;
                            } else {
                                if (!discoveredAIResults.includes(recipe.result)) {
                                    discoveredAIResults.push(recipe.result);
                                }
                                if (recipe.depth > aiHighestDepth) {
                                    aiHighestDepth = recipe.depth;
                                }
                                discoveredAIRecipes++;
                            }
                        }
                    }
                    const stats = await window.StatsAPI.getStats();
                    if (stats === undefined || stats === null) {
                        throw new Error('getStats returned undefined');
                    }
                    stats.aiRecipesFound = discoveredAIRecipes;
                    stats.aiResultsFound = discoveredAIResults.length;
                    stats.baseRecipesFound = discoveredBaseRecipes;
                    stats.baseResultsFound = discoveredBaseResults.length;
                    stats.baseHighestDepth = baseHighestDepth;
                    stats.aiHighestDepth = aiHighestDepth;
                    logger.info('Setting stats from load', stats);
                    await window.StatsAPI.setStats(stats);
                    // setStats(stats);
                } catch (e) {
                    logger.error('Failed to load database and stats in loader (oops)', e);
                }
                logger.silly('Setting loading to false BOTH');
                setLoading(false);
                setLoadingVisible(false);

                if (intervalId !== undefined) {
                    clearInterval(intervalId);
                }
                // clearInterval();
                setIntervalId(setInterval(() => {
                    // window.StatsAPI.getStats().then((stats) => {
                    //     unlockCheck(stats);
                    // }).catch((e) => {
                    //     logger.error('Cannot load stats in interval', e);
                    // });
                    window.StatsAPI.saveStats();
                }, 5 * 60 * 1000));
            }
        })();
    }, [loading]);

    return (
        <LoadingContext.Provider
            value={{
                loading,
                setLoading,
                loadingVisible,
                setLoadingVisible
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
};
  
