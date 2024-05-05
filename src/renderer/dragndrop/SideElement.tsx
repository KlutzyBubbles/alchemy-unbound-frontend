import { useEffect, type FC, type ReactNode, useContext, useRef, memo, CSSProperties } from 'react';
import { XYCoord, useDrag } from 'react-dnd';
import { RecipeElement } from '../../common/types';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DragItem, ItemTypes } from '../types';
import { ItemRenderer } from '../ItemRenderer';
import { SoundContext } from '../providers/SoundProvider';
import { arrayEquals } from '../../common/utils';

export type SideElementProps = {
  element: RecipeElement
  removeBox: (id: string) => void,
  addBox: (element: RecipeElement, combining: boolean) => Promise<string>
  children?: ReactNode
  style?: CSSProperties
  performance: boolean
}

const SideElementInternal: FC<SideElementProps> = ({
    element,
    addBox,
}) => {
    const { playSound } = useContext(SoundContext);
    const elementRef = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, drag, preview] = useDrag<DragItem, unknown, unknown>(
        () => ({
            type: ItemTypes.SIDE_ELEMENT,
            item: (monitor) => {
                const elementPos = elementRef.current.getBoundingClientRect();
                const mousePos = monitor.getInitialClientOffset();

                let offset: XYCoord | undefined = undefined;
                if (elementPos !== undefined && elementPos !== null && mousePos !== undefined && mousePos !== null) {
                    offset = {
                        x: mousePos.x - elementPos.x,
                        y: mousePos.y - elementPos.y
                    };
                }
                return { type: ItemTypes.SIDE_ELEMENT, element: element, offset: offset };
            },
            options: {
                dropEffect: 'copy'
            },
        }),
        [name],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    const onElementClick = () => {
        addBox(element, false);
    };

    const maxDepth = false;

    return (
        <ItemRenderer
            ref={(ref) => {
                drag(ref);
                elementRef.current = ref;
            }}
            onMouseDown={() => playSound('pickup', 0.5)}
            onClick={onElementClick}
            element={element}
            type={ItemTypes.SIDE_ELEMENT}
            dragging={false}
            maxDepth={maxDepth}/>
    );
};

export const SideElement = memo(SideElementInternal, (prevProps, nextProps) => {
    if (prevProps.element.name !== nextProps.element.name) {
        return false;
    }
    if (!arrayEquals(
        prevProps.element.recipes.sort((a, b) => `${a.a}${a.b}`.localeCompare(`${b.a}${b.b}`)).map((item) => item.first),
        nextProps.element.recipes.sort((a, b) => `${a.a}${a.b}`.localeCompare(`${b.a}${b.b}`)).map((item) => item.first))) {
        return false;
    }
    return true;
});
