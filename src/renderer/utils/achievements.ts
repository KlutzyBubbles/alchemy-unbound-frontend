import { Stats } from '../../common/stats';

export function unlockCheck(stats: Stats): void {
    baseRecipeCheck(stats.baseRecipesFound);
    aiRecipeCheck(stats.aiRecipesFound);
    baseResultCheck(stats.baseResultsFound);
    aiResultCheck(stats.aiResultsFound);
    firstDiscoveryCheck(stats.firstDiscoveries);
    depthCheck(stats.baseHighestDepth, stats.aiHighestDepth);
    itemRecipeCheck('egg');
    itemRecipeCheck('idea');
}

export async function itemRecipeCheck(result: string, achievementName?: string) {
    if (await window.RecipeAPI.hasAllRecipes(result)) {
        window.SteamAPI.activateAchievement(achievementName ?? result);
    }
}

export function baseRecipeCheck(baseRecipesFound: number) {
    do250Check(baseRecipesFound, 'discover_base_recipe');
    if (baseRecipesFound >= 3000) {
        window.SteamAPI.activateAchievement('discover_base_recipe_all');
    }
}

export function aiRecipeCheck(aiRecipesFound: number) {
    do250Check(aiRecipesFound, 'discover_ai_recipe');
}

export function baseResultCheck(baseResultsFound: number) {
    do250Check(baseResultsFound, 'discover_base');
    if (baseResultsFound >= 700) {
        window.SteamAPI.activateAchievement('discover_base_all');
    }
}

export function aiResultCheck(aiResultsFound: number) {
    do250Check(aiResultsFound, 'discover_ai');
}

export function firstDiscoveryCheck(firstDiscoveries: number) {
    if (firstDiscoveries >= 100) {
        window.SteamAPI.activateAchievement('first_discovery_100');
    }
    if (firstDiscoveries >= 10) {
        window.SteamAPI.activateAchievement('first_discovery_10');
    }
    if (firstDiscoveries >= 1) {
        window.SteamAPI.activateAchievement('first_discovery_1');
    }
}

export function depthCheck(baseHighestDepth: number, aiHighestDepth: number) {
    const highest = Math.max(baseHighestDepth, aiHighestDepth);
    if (highest >= 200) {
        window.SteamAPI.activateAchievement('hard_base');
    }
    if (highest >= 100) {
        window.SteamAPI.activateAchievement('medium_base');
    }
}

function do250Check(value: number, prefix: string) {
    if (value >= 250) {
        window.SteamAPI.activateAchievement(`${prefix}_250`);
    }
    if (value >= 50) {
        window.SteamAPI.activateAchievement(`${prefix}_50`);
    }
    if (value >= 10) {
        window.SteamAPI.activateAchievement(`${prefix}_10`);
    }
}
