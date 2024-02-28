import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DropTargetMonitor, XYCoord } from 'react-dnd'
import { useDrop } from 'react-dnd'

import { MainElement } from './MainElement'
import { ItemTypes } from './Constants'
import { Recipe } from '../common/types'
import { CustomDragLayer } from './DragLayer'
import Split from 'react-split';
import { SideElement } from './SideElement'

interface DragItem {
    type: string
    id?: string
    recipe?: Recipe
    top?: number
    left?: number
}

export interface ContainerProps {
  // refreshRecipes: () => void
  // hideSourceOnDrag: boolean
  removeBox: (id: string) => void,
  recipes: Recipe[],
}

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    recipes
}) => {
  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.ELEMENT],
      drop(item: DragItem, monitor) {
        if (monitor.didDrop()) {
            return
        }
        console.log(`removing ${item.id}`)
        if (item.id !== undefined) {
          removeBox(item.id)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [removeBox],
  )

 //style={styles}>
  return (
    <div ref={drop} style={{ background: isOver ? 'red' : 'white' }}>
        {recipes.map((recipe) => {
            return (<SideElement key={recipe.result} recipe={recipe} removeBox={removeBox} />)
        })}
    </div>
  )
}
