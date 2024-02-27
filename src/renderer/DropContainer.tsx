import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DropTargetMonitor, XYCoord } from 'react-dnd'
import { useDrop } from 'react-dnd'

import { MainElement } from './MainElement'
import { ItemTypes } from './Constants'
import { Recipe } from '../main/types'
import { CustomDragLayer } from './DragLayer'
import Split from 'react-split';
import { Row } from 'react-bootstrap'
import { SideElement } from './SideElement'
import { SideContainer } from './SideContainer'

interface DragItem {
    type: string
    id?: string
    recipe?: Recipe
    top?: number
    left?: number
}

export interface ContainerProps {
  // refreshRecipes: () => void
  hideSourceOnDrag: boolean
}

export interface ContainerState {
  boxes: { [key: string]: { top: number; left: number; title: string } }
}

export function getXY(item: DragItem, monitor: DropTargetMonitor): XYCoord {
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

export const DropContainer: FC<ContainerProps> = ({
  hideSourceOnDrag
}) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    async function getAllRecipes() {
        const data = await window.electron.getAllRecipes();

        if (data) {
            setRecipes(data);
        }
    }

    async function refreshRecipes() {
        await getAllRecipes()
    }

    useEffect(() => {
        getAllRecipes();
    }, []);

    const [boxes, setBoxes] = useState<{
        [key: string]: {
          top: number
          left: number
          combining: boolean,
          recipe: Recipe
        }
      }>({
        a: { top: 20, left: 80, combining: false, recipe: {
          a: '',
          b: '',
          result: 'fire',
          display: 'Fire',
          emoji: '🔥',
          depth: 0,
          who_discovered: '',
          base: 1 } }
      })

    const combine = async (a: string, b: string) => {
        if (Object.prototype.hasOwnProperty.call(boxes, a) && Object.prototype.hasOwnProperty.call(boxes, b)) {
            console.log('combining...')
            console.log(boxes)
            try {
              try {
                var recipe: Recipe | undefined = await window.electron.combine(boxes[a].recipe.result, boxes[b].recipe.result)
                if (recipe === undefined) {
                  console.error('cant combine')
                } else {
                  console.log('combining')
                  console.log(recipe)
                  let temp = update(boxes, {
                    [a]: {
                        $merge: { recipe: recipe },
                    }
                  })
                  console.log(temp)
                  delete temp[b]
                  console.log(temp)
                  setBoxes(temp)
                  refreshRecipes()
                }
              } catch(e) {
                console.error('cant combine')
                console.error(e)
              }
            } catch(e) {
              console.error('cant combine')
              console.error(e)
            }
        } else {
            console.error("One or more of the items doesn't exist anymore")
            throw("One or more of the items doesn't exist anymore")
        }
    }

    const removeBox = (id: string) => {
      console.log(`Remove box ${id}`)
      if (Object.prototype.hasOwnProperty.call(boxes, id)) {
        console.log('has box')
        var temp = {...boxes};
        delete temp[id]
        setBoxes(temp)
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

  const addBox = (x: number, y: number, recipe: Recipe, combining: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      var newId = makeid(10)
      setBoxes({
        ...boxes,
        [newId]: {
            top: y,
            left: x,
            combining: combining,
            recipe: recipe
        }
      })
      setBoxes((value) => {
        resolve(newId)
        return value
      })
    });
  }

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
            addBox(x, y, item.recipe, false)
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
    [moveBox, setBoxes],
  )

 //style={styles}>
  return (
    <Split
        sizes={[75, 25]}
        className="split p-0 m-0"
        gutterSize={5}
        snapOffset={0}
    >
      <div>
        <div ref={drop} className='h-100 w-100'>
          {Object.keys(boxes).map((key) => {
            const { left, top, recipe, combining } = boxes[key]
            return (
              <MainElement
                key={key}
                id={key}
                left={left}
                top={top}
                recipe={recipe}
                hideSourceOnDrag={hideSourceOnDrag}
                addBox={addBox}
                moveBox={moveBox}
                combine={combine}
              />
            )
          })}
          <CustomDragLayer/>
        </div>
      </div>
      <SideContainer recipes={recipes} removeBox={removeBox}/>
    </Split>
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
