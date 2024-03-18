import { useState, type CSSProperties, type FC } from 'react';
import { DragLayerMonitor, useDragLayer } from 'react-dnd';
import { shallowEqual } from '@react-dnd/shallowequal';

import { ItemRenderer } from '../ItemRenderer';
import { ItemTypes } from '../types';

const layerStyles: CSSProperties = {
    pointerEvents: 'none',
};

export default function useEfficientDragLayer<CollectedProps>(collect: (monitor: DragLayerMonitor) => CollectedProps): CollectedProps {
    const collected = useDragLayer(collect);
    const [previousCollected, setPreviousCollected] = useState<CollectedProps>(collected);
    const [requestID, setRequestID] = useState<number>();
    if (requestID === undefined && !shallowEqual(collected, previousCollected)) {
        setPreviousCollected(collected);
        setRequestID(requestAnimationFrame(() => setRequestID(undefined)));
    }
    return previousCollected;
}

export const CustomDragLayer: FC<Record<string, never>> = () => {
    const { itemType, item, initialOffset, currentOffset } =
    useEfficientDragLayer((monitor) => {
        return {
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        };
    });

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

    //const [tickThrottle, setTickThrottle] = useState(false);
    //setInterval(() => {
    //    setTickThrottle(!tickThrottle);
    //}, 700);

    ////Throttling with useMemo hook
    //const throttledDataVisdsualizator = useMemo(
    //    () => <div style={layerStyles} className='h-100 w-100 z-dragLayer'>
    //        {renderItem()}
    //    </div>,
    //    [tickThrottle]
    //);
    //return (
    //    <>
    //        {throttledDataVisdsualizator}
    //    </>
    //);

    return (
        <div style={layerStyles} className='h-100 w-100 z-dragLayer'>
            {renderItem()}
        </div>
    );
};
