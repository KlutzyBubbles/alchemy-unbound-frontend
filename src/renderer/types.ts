import { XYCoord } from 'react-dnd';
import { RecipeElement } from '../common/types';

export interface DragItem {
    type: string
    offset?: XYCoord
    id?: string
    element?: RecipeElement
    top?: number
    left?: number
}

export enum ItemTypes {
    ELEMENT = 'element',
    MAIN_ELEMENT = 'main',
    FINAL_ELEMENT = 'final',
    SIDE_ELEMENT = 'side',
    RECIPE_ELEMENT = 'recipe'
}
