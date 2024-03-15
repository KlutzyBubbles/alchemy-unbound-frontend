import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsProvider';
import logger from 'electron-log/renderer';
import { StatsContext } from './StatsProvider';
import { unlockCheck } from '../utils/achievements';

export const LoadingContext = createContext<{
    loading: boolean
    setLoading: (loading: boolean) => void,
        }>({
            loading: true,
            setLoading: (loading: boolean) => { console.log('DEFAULT STILL RUN', loading); }
        });

interface LoadingProviderProps {
    children?: ReactNode
}

export const LoadingProvider: FC<LoadingProviderProps> = ({
    children
}) => {
    const { setSettings } = useContext(SettingsContext);
    const { setStats } = useContext(StatsContext);
    const [loading, setLoading] = useState<boolean>(true);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout>(undefined);

    useEffect(() => {
        (async () => {
            if (loading) {
                try {
                    const settings = await window.SettingsAPI.getSettings();
                    if (settings === undefined || settings === null) {
                        throw new Error('getSettings returned undefined');
                    }
                    logger.info('Setting settings from load', settings);
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
                    setStats(stats);
                } catch (e) {
                    logger.error('Failed to load database and stats in loader (oops)', e);
                }

                if (intervalId !== undefined) {
                    clearInterval(intervalId);
                }
                // clearInterval();
                setIntervalId(setInterval(() => {
                    window.StatsAPI.getStats().then((stats) => {
                        unlockCheck(stats);
                    }).catch((e) => {
                        logger.error('Cannot load stats in interval', e);
                    });
                    window.StatsAPI.saveStats();
                }, 5 * 60 * 1000));
                setLoading(false);
            }
        })();
    }, [loading]);

    return (
        <LoadingContext.Provider
            value={{
                loading,
                setLoading
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
};
  
