import { DropTargetMonitor, XYCoord } from 'react-dnd';
import { DragItem } from '../types';
import { BaseFirst, BasicElement, Languages, OrderDepth, Recipe, RecipeElement } from '../../common/types';
import { languages } from '../../common/settings';
import logger from 'electron-log/renderer';

export function getXY(item: DragItem, monitor: DropTargetMonitor): XYCoord {
    const delta = monitor.getClientOffset() as XYCoord;
    let left = delta.x;
    let top = delta.y;
    if (item.top !== undefined && item.left !== undefined) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        left = Math.round(item.left + delta.x);
        top = Math.round(item.top + delta.y);
    }
    return {
        x: left,
        y: top
    };
}

export function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export async function getAllRecipes(): Promise<RecipeElement[]> {
    const data = await window.RecipeAPI.getAllRecipes();
    if (data) {
        const namesUnique = [...new Set(data.map(item => item.result))];

        const formattedData: RecipeElement[] = [];
        const steamId = await window.SteamAPI.getSteamId() ?? 'NO_STEAM_ID';
        for (const name of namesUnique) {
            const recipes = data.filter((item) => item.result === name);
            if (recipes.length === 0) {
                logger.warn(`Invalid recipe data for name ${name}`);
            } else {
                const ordering = getOrderDepth(recipes);
                const filtering = getBaseFirst(recipes, steamId);
                formattedData.push({
                    name: name,
                    display: recipes[0].display,
                    emoji: recipes[0].emoji,
                    first: filtering.first,
                    base: filtering.base,
                    sortOrder: ordering.order,
                    sortDepth: ordering.depth,
                    recipes: recipes
                });
            }
        }
        return formattedData;
    }
    return [];
}

export function mockElement(recipe: Recipe | BasicElement): RecipeElement {
    if ('result' in recipe) {
        return {
            name: recipe.result,
            display: recipe.display,
            emoji: recipe.emoji,
            base: false,
            first: false,
            sortDepth: 0,
            sortOrder: 0,
            recipes: [
                recipe
            ]
        };
    } else {
        const unknowns: Partial<Languages> = {};
        for (const language of languages) {
            unknowns[language] = '???';
        }
        return {
            name: recipe.name,
            display: recipe.display,
            emoji: recipe.emoji,
            base: false,
            first: false,
            sortDepth: 0,
            sortOrder: 0,
            recipes: [
                {
                    ...recipe,
                    order: 0,
                    result: recipe.name,
                    discovered: 1,
                    a: {
                        name: '',
                        display: unknowns as Languages,
                        emoji: '❓',
                        depth: 0,
                        first: 0,
                        who_discovered: '',
                        base: 0
                    },
                    b: {
                        name: '',
                        display: unknowns as Languages,
                        emoji: '❓',
                        depth: 0,
                        first: 0,
                        who_discovered: '',
                        base: 0
                    }
                }
            ]
        };
    }
}

export function getOrderDepth(recipes: Recipe[]): OrderDepth {
    let depth = Infinity;
    let order = Infinity;
    for (const recipe of recipes) {
        if (recipe.depth < depth)
            depth = recipe.depth;
        if (recipe.order < order)
            order = recipe.order;
    }
    return {
        depth,
        order
    };
}


export function getBaseFirst(recipes: Recipe[], steamId: string): BaseFirst {
    let base = false;
    let first = false;
    for (const recipe of recipes) {
        if (!base && recipe.base)
            base = true;
        if (!first && (recipe.who_discovered === steamId || recipe.first))
            first = true;
    }
    return {
        base,
        first
    };
}
