import logger from 'electron-log/renderer';
import { Stats } from '../../common/stats';

export async function unlockCheck(stats: Stats): Promise<void> {
    // baseRecipeCheck(stats.baseRecipesFound);
    // aiRecipeCheck(stats.aiRecipesFound);
    // baseResultCheck(stats.baseResultsFound);
    // aiResultCheck(stats.aiResultsFound);
    // firstDiscoveryCheck(stats.firstDiscoveries);
    // depthCheck(stats.baseHighestDepth, stats.aiHighestDepth);

    const recipes = await window.RecipeAPI.countBaseRecipes();
    const results = await window.RecipeAPI.countBaseResults();
    logger.info('unlockCheck', stats, recipes, results);
    baseRecipeCheck(recipes);
    baseResultCheck(results);

    if (await shouldDoAICheck('first_discovery', ['1', '10', '100'])
        || await shouldDoAICheck('discover_ai_recipe')
        || await shouldDoAICheck('discover_ai')) {
        logger.info('Checking for user details');
        const response = await window.ServerAPI.getUserDetails();
        if (response.type === 'success') {
            const details = response.result.user;
            aiRecipeCheck(details.combines);
            firstDiscoveryCheck(details.firstDiscoveries);
        } else {
            logger.error('Failed to check for achievements');
        }
    }

    if (!await window.SteamAPI.isAchievementActivated('hard_base') || !await window.SteamAPI.isAchievementActivated('medium_base')) {
        const response = await window.ServerAPI.getUserDetails();
        if (response.type === 'success') {
            const details = response.result.user;
            depthCheck(stats.baseHighestDepth, details.highestDepth);
        } else {
            logger.error('Failed to check for achievements');
        }
    }

    itemRecipeCheck('egg');
    itemRecipeCheck('idea');
}

export async function itemRecipeCheck(result: string, achievementName?: string) {
    logger.silly('itemRecipeCheck', result, achievementName);
    if (await window.RecipeAPI.hasAtleastRecipe(result)) {
        logger.debug(`Unlocking achievement ${achievementName ?? result}`);
        window.SteamAPI.activateAchievement(achievementName ?? result);
    }
}

export function baseRecipeCheck(baseRecipesFound: number) {
    logger.silly('baseRecipeCheck', baseRecipesFound);
    do250Check(baseRecipesFound, 'discover_base_recipe');
    if (baseRecipesFound >= 3150) {
        window.SteamAPI.activateAchievement('discover_base_recipe_all');
    }
}

export function aiRecipeCheck(aiRecipesFound: number) {
    logger.silly('aiRecipeCheck', aiRecipesFound);
    do250Check(aiRecipesFound, 'discover_ai_recipe');
}

export function baseResultCheck(baseResultsFound: number) {
    logger.silly('baseResultCheck', baseResultsFound);
    do250Check(baseResultsFound, 'discover_base');
    if (baseResultsFound >= 700) {
        window.SteamAPI.activateAchievement('discover_base_all');
    }
}

export function aiResultCheck(aiResultsFound: number) {
    logger.silly('aiResultCheck', aiResultsFound);
    do250Check(aiResultsFound, 'discover_ai');
}

export function firstDiscoveryCheck(firstDiscoveries: number) {
    logger.silly('firstDiscoveryCheck', firstDiscoveries);
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
    logger.silly('depthCheck', baseHighestDepth, aiHighestDepth);
    const highest = Math.max(baseHighestDepth, aiHighestDepth);
    if (highest >= 200) {
        window.SteamAPI.activateAchievement('hard_base');
    }
    if (highest >= 100) {
        window.SteamAPI.activateAchievement('medium_base');
    }
}

async function shouldDoAICheck(prefix: string, numbers: string[] = ['10', '50', '250']): Promise<boolean> {
    for (const number of numbers) {
        if (!await window.SteamAPI.isAchievementActivated(`${prefix}_${number}`)) {
            return true;
        }
    }
    return false;
}

function do250Check(value: number, prefix: string) {
    logger.silly('do250Check', value, prefix);
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
