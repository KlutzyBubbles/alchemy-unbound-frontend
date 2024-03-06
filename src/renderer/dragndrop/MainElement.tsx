import { useState, type FC, type ReactNode, useEffect, useContext } from 'react';
import { ConnectableElement, DragSourceOptions, useDrag, useDrop } from 'react-dnd';
import { RecipeElement } from '../../common/types';
import Dropdown from 'react-bootstrap/Dropdown';
import { getXY } from '../utils';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Variants, useAnimation } from 'framer-motion';
import { DragItem, ItemTypes } from '../types';
import { SettingsContext } from '../providers/SettingsProvider';
import { ItemRenderer } from '../ItemRenderer';

export interface BoxProps {
  dragId: string
  left: number
  top: number
  element: RecipeElement
  hideSourceOnDrag?: boolean
  addBox: (x: number, y: number, element: RecipeElement, combining: boolean) => Promise<string>
  moveBox: (id: string, left: number, top: number) => Promise<void>
  rawCombine: (a: string, bName: string) => Promise<void>,
  combine: (a: string, b: string) => Promise<void>,
  combining: boolean,
  newCombine: boolean,
  loading: boolean,
  error: number,
  // combineRaw: (a: string, b: string) => Promise<void>,
  children?: ReactNode
}

export const MainElement: FC<BoxProps> = ({
    dragId,
    left,
    top,
    element,
    hideSourceOnDrag,
    addBox,
    moveBox,
    rawCombine,
    combine,
    combining,
    loading,
    error,
}) => {
    const dragDrop = (node: ConnectableElement, options?: DragSourceOptions) => {
        drag(node, options);
        drop(node, options);
    };

    const { settings } = useContext(SettingsContext);
    // const [hasDropOver, setHasDropOver] = useState(false);
    
    const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
        () => ({
            type: ItemTypes.ELEMENT,
            item: { type: ItemTypes.ELEMENT, id: dragId, left, top, element: element },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [dragId, left, top],
    );

    useEffect(() => {
        console.log(`Moved ${left}, ${top}`);
    }, [top, left]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        console.log(element);
    }, []);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.ELEMENT, ItemTypes.SIDE_ELEMENT],
            drop(item: DragItem, monitor) {
                if (monitor.didDrop()) {
                    return;
                }
                const { x, y } = getXY(item, monitor);
                if (item.type === ItemTypes.SIDE_ELEMENT) {
                    // Create a new and place it
                    rawCombine(dragId, item.element.name).then(() => {
                        console.log('combined');
                    }).catch((e) => {
                        console.error('combining ewrror');
                        console.error(e);
                    });
                } else {
                    // Moving an existing item
                    moveBox(item.id, x, y);
                    if (dragId !== item.id) {
                        combine(dragId, item.id).then(() => {
                            console.log('combined');
                        }).catch((e) => {
                            console.error('combining ewrror');
                            console.error(e);
                        });
                    }
                }
            },
            canDrop: (item: DragItem, monitor) => {
                console.log(`Can drop ${item.id} onto ${dragId}`);
                if (monitor.getItem().id === dragId) {
                    return false;
                }
                return true;
            },
            collect: (monitor) => ({
                isOver: monitor.isOver() && (monitor.getItem().id !== dragId),
                isOverCurrent: monitor.isOver({ shallow: true }) && (monitor.getItem().id !== dragId),
            }),
        }),
        [moveBox, addBox],
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleContext = () => {
        setDropdownOpen(!dropdownOpen);
    };

    if (isDragging && hideSourceOnDrag) {
        return <div ref={drag} />;
    }
  
    const onClick = () => {
        controls.start('error');
    };

    //useEffect(() => {
    //    setHasDropOver(isOver);
    //    console.log(`IsOver changed ${isOver}`);
    //}, [isOver]);

    useEffect(() => {
        (async () => {
            controls.start('error');
        })();
    }, [error]);

    useEffect(() => {
        (async () => {
            if (loading) {
                controls.start('flash');
            } else {
                controls.start('stopFlash');
            }
        })();
    }, [loading]);

    useEffect(() => {
        (async () => {
            if (combining) {
                controls.start('spin');
            } else {
                controls.start('stopSpin');
            }
        })();
    }, [combining]);

    useEffect(() => {
        (async () => {
            if (isDragging) {
                controls.start('hide');
            } else {
                await controls.start('show');
                if (loading)
                    controls.start('flash');
            }
        })();
    }, [isDragging]);

    const customVariants: Variants = {
        error: () => ({
            rotate: [0, -10, 10, -10, 10, 0],
            transition: {
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                duration: 0.5,
                repeat: 0,
                ease: 'easeInOut',
                repeatDelay: 0.5
            }
        }),
        hide: () => ({
            opacity: [0],
            transition: {
                times: [1],
                duration: 0,
                repeat: 0,
                ease: 'linear'
            }
        }),
        show: () => ({
            opacity: [1],
            transition: {
                times: [1],
                duration: 0,
                repeat: 0,
                ease: 'linear'
            }
        }),
        flash: () => ({
            opacity: [0, 1],
            transition: {
                times: [0, 1],
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                repeatDelay: 0
            }
        }),
        stopFlash: () => ({
            opacity: [1],
            transition: {
                times: [1],
                duration: 0.1,
                repeat: 0,
                ease: 'easeInOut'
            }
        }),
        spin: () => ({
            rotate: [0, 361],
            transition: {
                times: [0, 1],
                duration: 0.3,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeIn',
                repeatDelay: 0
            }
        }),
        stopSpin: () => ({
            rotate: [0],
            transition: {
                times: [1],
                duration: 0.3,
                repeat: 0,
                ease: 'easeOut',
                repeatDelay: 0.5
            }
        }),
        reset: {
            rotate: 0
        }
    };

    const controls = useAnimation();
  
    return (
        <ItemRenderer
            element={element}
            type={ItemTypes.MAIN_ELEMENT}
            dragging={isDragging}
            ref={dragDrop}
            top={top}
            left={left}
            hasDropOver={isOver}
            initialOffset={{ x: 0, y: 0 }}
            currentOffset={{ x: 0, y: 0 }}
            onContextMenu={handleContext}
            onBlur={() => setDropdownOpen(false)}
            onClick={onClick}
            variants={customVariants}
            animate={controls}
            disabled={loading}
            exit={{
                opacity: 0,
                scale: 0,
                transition: {
                    duration: 1,
                }
            }}>
            <Dropdown show={dropdownOpen} onToggle={(nextShow) => setDropdownOpen(nextShow)}>
                <Dropdown.Menu>
                    {element.recipes.map((recipe) => {
                        if (recipe.a.name === '' || recipe.b.name === '') {
                            return (
                                <Dropdown.Item key={`${recipe.result}`} href="#">
                                    <div className="main-element btn btn-outline-dark btn-light">
                                        {recipe.emoji} {recipe.display[settings.language]}
                                    </div>
                                </Dropdown.Item>);
                        }
                        return (
                            <Dropdown.Item key={`${recipe.a.name}${recipe.b.name}`} href="#">
                                <div key={`${recipe.a.name}`} className="main-element btn btn-outline-dark btn-light">
                                    {recipe.a.emoji} {recipe.a.display[settings.language]}
                                </div>
                  +
                                <div key={`${recipe.b.name}`} className="main-element btn btn-outline-dark btn-light">
                                    {recipe.b.emoji} {recipe.b.display[settings.language]}
                                </div>
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </ItemRenderer>
    );
};
