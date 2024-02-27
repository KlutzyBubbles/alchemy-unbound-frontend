import { useState, type CSSProperties, type FC, type ReactNode, useEffect } from 'react'
import { ConnectableElement, DragSourceOptions, XYCoord, useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'
import { Recipe } from '../main/types'
import Dropdown from 'react-bootstrap/Dropdown';
import { getXY } from './DropContainer';
import { getEmptyImage } from 'react-dnd-html5-backend';

export interface BoxProps {
  id: any
  left: number
  top: number
  recipe: Recipe
  hideSourceOnDrag?: boolean
  addBox: (x: number, y: number, recipe: Recipe, combining: boolean) => Promise<string>
  moveBox: (id: string, left: number, top: number) => void
  combine: (a: string, b: string) => Promise<void>,
  // combineRaw: (a: string, b: string) => Promise<void>,
  children?: ReactNode
}

interface DragItem {
  type: string
  id?: string
  recipe?: Recipe
  top?: number
  left?: number
}

export const MainElement: FC<BoxProps> = ({
  id,
  left,
  top,
  recipe,
  hideSourceOnDrag,
  addBox,
  moveBox,
  combine,
  children,
}) => {
    const dragDrop = (node: ConnectableElement, options?: DragSourceOptions) => {
        drag(node, options)
        drop(node, options)
    }
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.ELEMENT,
      item: { type: ItemTypes.ELEMENT, id, left, top, recipe: recipe },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  )

  function getStyles(
    left: number,
    top: number,
    isDragging: boolean,
  ): CSSProperties {
    const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
      position: 'absolute',
      left,
      top,
      // transform,
      // WebkitTransform: transform,
      // IE fallback: hide the real node using CSS when dragging
      // because IE will ignore our custom "empty image" drag preview.
      opacity: isDragging ? 0 : 1,
      height: isDragging ? 0 : '',
    }
  }

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

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
            addBox(x, y, item.recipe, true).then((newId) => {
              if (id !== newId) {
                combine(id, newId).then(() => {
                  console.log('combined')
                }).catch((e) => {
                  console.error('combining ewrror')
                  console.error(e)
                })
              }
            }).catch((e) => {
              console.error(e)
            })
        } else {
            // Moving an existing item
            moveBox(item.id, x, y)
            if (id !== item.id) {
              combine(id, item.id).then(() => {
                console.log('combined')
              }).catch((e) => {
                console.error('combining ewrror')
                console.error(e)
              })
            }
        }
      },
      canDrop: (item: DragItem, monitor) => {
        console.log(monitor.getItem())
        console.log(item)
        console.log(id)
        if (monitor.getItem().id === id) {
            return false
        }
        return true;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && (monitor.getItem().id !== id),
        isOverCurrent: monitor.isOver({ shallow: true }) && (monitor.getItem().id !== id),
      }),
    }),
    [moveBox, addBox],
  )

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleContext = () => {
    setDropdownOpen(!dropdownOpen)
  }

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }
  return (
      <div
        className="main-element btn btn-outline-dark btn-light position-absolute"
        ref={dragDrop}
        style={getStyles(left, top, isDragging) /*{ left, top, backgroundColor: isOver ? 'darkgreen' : 'rgba(0, 0, 0, .5)' }*/}
        data-testid="box"
        onContextMenu={handleContext}
        onBlur={() => setDropdownOpen(false)}
      >
        {recipe.emoji} {recipe.display}
        <Dropdown show={dropdownOpen} onToggle={(nextShow) => setDropdownOpen(nextShow)}>
          <Dropdown.Menu>
            <Dropdown.Item href="#">Menu Item</Dropdown.Item>
            <Dropdown.Item href="#">Menu Item</Dropdown.Item>
            <Dropdown.Item href="#">Menu Item</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
  )
}
