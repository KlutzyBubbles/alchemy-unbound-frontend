import { DropTargetMonitor, XYCoord } from 'react-dnd';
import { DragItem } from '../types';
import { RecipeElement } from '../../common/types';

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
        for (const name of namesUnique) {
            const recipes = data.filter((item) => item.result === name);
            if (recipes.length === 0) {
                console.warn(`Invalid recipe data for name ${name}`);
            } else {
                formattedData.push({
                    name: name,
                    display: recipes[0].display,
                    emoji: recipes[0].emoji,
                    recipes: recipes
                });
            }
        }
        return formattedData;
    }
    return [];
}
