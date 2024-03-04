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
import { getXY } from './Utils'

export interface ContainerProps {
  // refreshRecipes: () => void
  // hideSourceOnDrag: boolean
  removeBox: (id: string) => void,
  moveBox: (id: string, left: number, top: number) => Promise<void>
  elements: RecipeElement[],
}

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    moveBox,
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
          let { x, y } = getXY(item, monitor)
          moveBox(item.id, x, y).then(() => {
            (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
              removeBox(item.id)
            })
          })
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
    <div className='vh-100 d-flex flex-column'>
      <div ref={drop} style={{ background: isOver ? 'red' : 'white' }} className='overflow-y-scroll overflow-x-hidden h-100'>
          {elements.map((element) => {
              return (<SideElement key={element.name} element={element} removeBox={removeBox} />)
          })}
      </div>
      <div className='footer mt-auto'>
        <div className="mb-3">
          <input type="email" className="form-control" id="exampleFormControlInput1" placeholder={`Search ${elements.length} elements`}/>
        </div>
      </div>
    </div>
  )
}
