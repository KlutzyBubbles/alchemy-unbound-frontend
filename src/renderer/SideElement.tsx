import { useEffect, type FC, type ReactNode } from 'react'
import { useDrag } from 'react-dnd'
import { ItemTypes } from './Constants'
import { RecipeElement } from '../common/types'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { DragItem } from './types'

export type SideElementProps = {
  element: RecipeElement
  hideSourceOnDrag?: boolean
  removeBox: (id: string) => void,
  children?: ReactNode
}

export const SideElement: FC<SideElementProps> = ({
  element,
  hideSourceOnDrag,
  removeBox,
  children,
}) => {
  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      type: ItemTypes.SIDE_ELEMENT,
      item: { type: ItemTypes.SIDE_ELEMENT, element: element },
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
      {element.emoji} {element.display}
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
