import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DropTargetMonitor, XYCoord } from 'react-dnd'
import { useDrop } from 'react-dnd'

import { MainElement } from './MainElement'
import { ItemTypes } from './Constants'
import { Recipe, RecipeElement } from '../common/types'
import { CustomDragLayer } from './DragLayer'
import Split from 'react-split';
import { SideElement } from './SideElement'
import { DragItem } from './types'

export interface ContainerProps {
  // refreshRecipes: () => void
  // hideSourceOnDrag: boolean
  removeBox: (id: string) => void,
  elements: RecipeElement[],
}

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    elements
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
        {elements.map((element) => {
            return (<SideElement key={element.name} element={element} removeBox={removeBox} />)
        })}
    </div>
  )
}
