import { RecipeElement } from "src/common/types"

export interface DragItem {
    type: string
    id?: string
    element?: RecipeElement
    top?: number
    left?: number
}