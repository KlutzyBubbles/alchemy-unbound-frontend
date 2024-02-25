import type { CSSProperties, FC, ReactNode } from 'react'
import { ConnectableElement, DragSourceOptions, XYCoord, useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'
import { Recipe } from './main/database'

export type SideElementProps = Recipe & {
  hideSourceOnDrag?: boolean
  children?: ReactNode
}

export const SideElement: FC<SideElementProps> = ({
  a,
  b,
  result,
  display,
  emoji,
  depth,
  who_discovered,
  base,
  hideSourceOnDrag,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SIDE_ELEMENT,
      item: { type: ItemTypes.SIDE_ELEMENT, name: result },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: 'copy'
      }
    }),
    [name],
  )

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }
  return (
    <a
      className="side-element btn btn-outline-dark"
      ref={drag}
    >
      {emoji} {display}
    </a>
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
