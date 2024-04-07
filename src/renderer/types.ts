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
    COPY_ELEMENT = 'copy',
    RECIPE_ELEMENT = 'recipe',
    LOCKED_ELEMENT = 'locked'
}

export interface Box {
    top: number
    left: number
    combining: boolean,
    newCombining: boolean,
    loading: boolean,
    firstDiscovery: boolean,
    newDiscovery: boolean,
    locked: boolean,
    error: number,
    element: RecipeElement
}
