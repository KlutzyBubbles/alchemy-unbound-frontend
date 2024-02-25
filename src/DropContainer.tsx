import update from 'immutability-helper'
import type { CSSProperties, FC } from 'react'
import { Component, useCallback, useEffect, useState } from 'react'
import type { DropTargetMonitor, XYCoord } from 'react-dnd'
import { useDrop } from 'react-dnd'

import { Box } from './MainElement'
import { Container } from 'react-bootstrap'
import Main from 'electron/main'
import { ItemTypes } from './Constants'
import { Recipe } from './main/database'

interface DragItem {
    type: string
    id?: string
    name?: string
    top?: number
    left?: number
}

export interface ContainerProps {
  hideSourceOnDrag: boolean
}

export interface ContainerState {
  boxes: { [key: string]: { top: number; left: number; title: string } }
}

function getXY(item: DragItem, monitor: DropTargetMonitor): XYCoord {
    let delta = monitor.getClientOffset() as XYCoord
    let left = delta.x;
    let top = delta.y;
    if (item.top !== undefined && item.left !== undefined) {
        let delta = monitor.getDifferenceFromInitialOffset() as XYCoord
        left = Math.round(item.left + delta.x)
        top = Math.round(item.top + delta.y)
    }
    return {
        x: left,
        y: top
    }
}

export const DropContainer: FC<ContainerProps> = ({ hideSourceOnDrag }) => {
    const [boxes, setBoxes] = useState<{
        [key: string]: {
          top: number
          left: number
          title: string
        }
      }>({
        a: { top: 20, left: 80, title: 'Drag me around' },
        b: { top: 180, left: 120, title: 'Drag me too' },
        c: { top: 240, left: 220, title: 'Drag me too' },
        d: { top: 300, left: 320, title: 'Drag me too' },
        e: { top: 50, left: 20, title: 'Drag me too' },
        f: { top: 100, left: 20, title: 'Drag me too' },
      })

    const combine = (a: string, b: string) => {
        if (Object.prototype.hasOwnProperty.call(boxes, a) && Object.prototype.hasOwnProperty.call(boxes, b)) {
            console.log('combining...')
            console.log(boxes)
            let temp = update(boxes, {
                [a]: {
                    $merge: { title: `${boxes[a].title} - ${boxes[b].title}` },
                }
            })
            console.log(temp)
            delete temp[b]
            console.log(temp)
            setBoxes(temp)
        } else {
            console.error("One or more of the items doesn't exist anymore")
        }
    }

  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
      setBoxes(
        update(boxes, {
          [id]: {
            $merge: { left, top },
          },
        }),
      )
    },
    [boxes, setBoxes],
  )

  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.ELEMENT, ItemTypes.SIDE_ELEMENT],
      drop(item: DragItem, monitor) {
        if (monitor.didDrop()) {
            return
        }
        console.log(item.type)
        let { x, y } = getXY(item, monitor)
        if (item.type === ItemTypes.SIDE_ELEMENT) {
            // Create a new and place it
            setBoxes({
                ...boxes,
                [makeid(10)]: {
                    top: y,
                    left: x,
                    title: item.name
                }
            })
        } else {
            // Moving an existing item
            moveBox(item.id, x, y)
        }
        return undefined
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [moveBox],
  )

 //style={styles}>
  return (
    <div ref={drop} className='h-100 w-100'>
      {Object.keys(boxes).map((key) => {
        const { left, top, title } = boxes[key] as {
          top: number
          left: number
          title: string
        }
        return (
          <Box
            key={key}
            id={key}
            left={left}
            top={top}
            hideSourceOnDrag={hideSourceOnDrag}
            moveBox={moveBox}
            combine={combine}
          >
            {title}
          </Box>
        )
      })}
    </div>
  )
}

function makeid(length: number) {
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
