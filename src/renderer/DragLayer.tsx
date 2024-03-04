import { type CSSProperties, type FC } from 'react';
import { useDragLayer } from 'react-dnd';

import { ItemRenderer } from './ItemRenderer';
import { ItemTypes } from './types';

const layerStyles: CSSProperties = {
    pointerEvents: 'none',
};

export const CustomDragLayer: FC<Record<string, never>> = () => {
    const { itemType, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    function renderItem() {
        switch (itemType) {
        case ItemTypes.ELEMENT:
        case ItemTypes.SIDE_ELEMENT:
            return (
                <ItemRenderer
                    element={item.element}
                    type={itemType}
                    dragging={true}
                    initialOffset={initialOffset}
                    currentOffset={currentOffset}/>
            );
        default:
            return null;
        }
    }

    return (
        <div style={layerStyles} className='h-100 w-100 z-dragLayer'>
            {renderItem()}
        </div>
    );
};
