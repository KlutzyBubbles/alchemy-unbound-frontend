import { useEffect, type CSSProperties, type FC, type ReactNode } from 'react'
import { ConnectableElement, DragSourceOptions, XYCoord, useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'
import { Recipe } from '../common/types'
import { getEmptyImage } from 'react-dnd-html5-backend'

export type SideElementProps = {
  recipe: Recipe
  hideSourceOnDrag?: boolean
  removeBox: (id: string) => void,
  children?: ReactNode
}

interface DragItem {
  type: string
  id?: string
  recipe?: Recipe
  top?: number
  left?: number
}

export const SideElement: FC<SideElementProps> = ({
  recipe,
  hideSourceOnDrag,
  removeBox,
  children,
}) => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.SIDE_ELEMENT,
      item: { type: ItemTypes.SIDE_ELEMENT, recipe: recipe },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: 'copy'
      }
    }),
    [name],
  )

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }
  return (
    <div
      className={`side-element btn btn-element mt-2 ms-2`}
      ref={drag}
    >
      {recipe.emoji} {recipe.display}
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
