import type { CSSProperties, FC } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'

import { ItemTypes } from './Constants'
import { Recipe } from '../common/types'


const layerStyles: CSSProperties = {
    pointerEvents: 'none',
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`
  return {
    transform,
    WebkitTransform: transform,
  }
}

export const CustomDragLayer: FC<{}> = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }))

  function renderItem() {
    switch (itemType) {
        case ItemTypes.ELEMENT:
        case ItemTypes.SIDE_ELEMENT:
            return (
                <div
                    className="main-element btn btn-outline-dark btn-light position-absolute shadow"
                    style={getItemStyles(initialOffset, currentOffset)}
                    data-testid="box"
                >
                    {item.recipe.emoji} {item.recipe.display}
                </div>
            )
        default:
            return null
    }
  }

  // if (!isDragging) {
  //   return null
  // }
  return (
    <div style={layerStyles} className='h-100 w-100 z-600'>
        {renderItem()}
    </div>
  )
}
