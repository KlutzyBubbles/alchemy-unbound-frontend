import type { CSSProperties, FC, ReactNode } from 'react'
import { ConnectableElement, DragSourceOptions, XYCoord, useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'

const style: CSSProperties = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  cursor: 'move',
}

export interface BoxProps {
  id: any
  left: number
  top: number
  hideSourceOnDrag?: boolean
  moveBox: (id: string, left: number, top: number) => void
  combine: (a: string, b: string) => void,
  children?: ReactNode
}

export const Box: FC<BoxProps> = ({
  id,
  left,
  top,
  hideSourceOnDrag,
  moveBox,
  combine,
  children,
}) => {
    const dragDrop = (node: ConnectableElement, options?: DragSourceOptions) => {
        drag(node, options)
        drop(node, options)
    }
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.ELEMENT,
      item: { type: ItemTypes.ELEMENT, id, left, top },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  )

  const [{ isOver, isOverCurrent }, drop] = useDrop(
    () => ({
      accept: ItemTypes.ELEMENT,
      drop(item: BoxProps, monitor) {
        if (monitor.didDrop()) {
            return
        }
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord
        const left = Math.round(item.left + delta.x)
        const top = Math.round(item.top + delta.y)
        console.log(`Dropped ${item.id} on ${id}`)
        moveBox(item.id, left, top)
        if (id !== item.id) {
            combine(id, item.id)
        }
        return undefined
      },
      canDrop: (item: BoxProps, monitor) => {
        console.log(monitor.getItem())
        console.log(item)
        console.log(id)
        if (monitor.getItem().id === id) {
            return false
        }
        return true;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [moveBox],
  )

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }
  return (
    <div
      className="box z-0"
      ref={dragDrop}
      style={{ ...style, left, top, backgroundColor: isOver ? 'darkgreen' : 'rgba(0, 0, 0, .5)' }}
      data-testid="box"
    >
      {children}
    </div>
  )
}
