import React, { useEffect, type FC, type ReactNode, useContext, useState } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './Constants';
import { RecipeElement } from '../common/types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragItem } from './types';
import { SettingsContext } from './SettingsProvider';

export type SideElementProps = {
  element: RecipeElement
  hideSourceOnDrag?: boolean
  removeBox: (id: string) => void,
  children?: ReactNode
}

export const SideElement: FC<SideElementProps> = ({
    element,
    hideSourceOnDrag,
}) => {
    const { settings } = useContext(SettingsContext);
    const [xy, setXY] = useState({ x: 0, y: 0 });
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
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        setXY({
            x: -e.nativeEvent.offsetX,
            y: -e.nativeEvent.offsetY
        });
    };

    if (isDragging && hideSourceOnDrag) {
        return <div ref={drag} />;
    }
    return (
        <div
            className={'side-element btn btn-element mt-2 ms-2 p-0 overflow-hidden'}
            ref={drag}
            onMouseMove={handleMove}
            style={{ backgroundPosition: `var(${xy.x}px) var(${xy.y}px)` }}
        >
            <div className='py-2 px-2 h-100 w-100' style={{ backgroundColor: '#FFFA' }}>
                {element.emoji} {element.display[settings.language]}
            </div>
        </div>
    );
};
