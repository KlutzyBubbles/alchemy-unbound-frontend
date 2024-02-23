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
  name: string
  hideSourceOnDrag?: boolean
  children?: ReactNode
}

export const SideElement: FC<BoxProps> = ({
  name,
  hideSourceOnDrag,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SIDE_ELEMENT,
      item: { type: ItemTypes.SIDE_ELEMENT, name },
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
      href="!#"
    >
      {name}
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
