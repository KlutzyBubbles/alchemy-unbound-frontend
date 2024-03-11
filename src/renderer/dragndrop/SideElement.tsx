import { useEffect, type FC, type ReactNode, useContext } from 'react';
import { useDrag } from 'react-dnd';
import { RecipeElement } from '../../common/types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragItem, ItemTypes } from '../types';
import { ItemRenderer } from '../ItemRenderer';
import { SoundContext } from '../providers/SoundProvider';

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
    const { playSound } = useContext(SoundContext);
    const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
        () => ({
            type: ItemTypes.SIDE_ELEMENT,
            end: () => {
                // playSound('drop', 0.5);
                console.log('end');
            },
            item: () => {
                playSound('pickup', 0.5);
                return { type: ItemTypes.SIDE_ELEMENT, element: element };
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            }),
            options: {
                dropEffect: 'copy'
            },
        }),
        [name],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    const maxDepth = false;

    if (isDragging && hideSourceOnDrag) {
        return <div ref={drag} />;
    }
    return (
        <ItemRenderer
            ref={drag}
            element={element}
            type={ItemTypes.SIDE_ELEMENT}
            dragging={false}
            maxDepth={maxDepth}/>
    );
};
