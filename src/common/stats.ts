export type Stats = {
    baseRecipesFound: number,
    aiRecipesFound: number,
    itemsCombined: number,
    baseResultsFound: number,
    firstDiscoveries: number,
    baseHighestDepth: number,
    aiHighestDepth: number,
    aiResultsFound: number
}

export const DEFAULT_STATS: Stats = {
    aiRecipesFound: 0,
    aiResultsFound: 0,
    baseRecipesFound: 0,
    baseResultsFound: 0,
    firstDiscoveries: 0,
    baseHighestDepth: 0,
    aiHighestDepth: 0,
    itemsCombined: 0
};
