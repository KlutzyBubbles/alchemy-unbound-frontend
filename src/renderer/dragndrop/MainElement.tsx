import { useState, type FC, type ReactNode, useEffect, useContext, useRef, Fragment } from 'react';
import { ConnectableElement, DragSourceOptions, useDrag, useDrop } from 'react-dnd';
import { Recipe, RecipeElement } from '../../common/types';
import Dropdown from 'react-bootstrap/Dropdown';
import { getXY, mockElement } from '../utils';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Variants, useAnimation } from 'framer-motion';
import { Box, DragItem, ItemTypes } from '../types';
import { ItemRenderer } from '../ItemRenderer';
import { SoundContext } from '../providers/SoundProvider';
import logger from 'electron-log/renderer';
import { IoLockOpenOutline, IoLockClosedOutline } from 'react-icons/io5';

export interface BoxProps {
  dragId: string
  left: number
  top: number
  element: RecipeElement
  addBox: (x: number, y: number, element: RecipeElement, combining: boolean) => Promise<string>
  moveBox: (id: string, left: number, top: number) => Promise<void>
  rawCombine: (a: string, bName: string) => Promise<void>,
  combine: (a: string, b: string) => Promise<void>,
  lockBox: (id: string, locked: boolean) => Promise<void>,
  stopState: (key: string, state: keyof Box) => void,
  removeBox: (id: string) => void,
  onHoverEnd?: (event: MouseEvent) => void
  onHoverStart?: (event: MouseEvent) => void
  combining: boolean,
  newCombine: boolean,
  newDiscovery: boolean,
  firstDiscovery: boolean,
  copyHeld: boolean,
  removeHeld: boolean,
  loading: boolean,
  error: number,
  locked: boolean,
  children?: ReactNode
}

export const MainElement: FC<BoxProps> = ({
    dragId,
    left,
    top,
    element,
    newDiscovery,
    addBox,
    moveBox,
    rawCombine,
    stopState,
    combine,
    lockBox,
    removeBox,
    onHoverEnd,
    onHoverStart,
    copyHeld,
    removeHeld,
    combining,
    loading,
    locked,
    error,
}) => {
    const { playSound } = useContext(SoundContext);
    const dragDrop = (node: ConnectableElement, options?: DragSourceOptions) => {
        drag(node, options);
        drop(node, options);
    };
    const [recipes, setRecipes] = useState<Recipe[]>(element.recipes ?? []);
    const [copyFlipFlop, setCopyFlipFlop] = useState<boolean>(true);
    const [draggingState, setDraggingState] = useState<boolean>(true);
    const mounted = useRef(false);
    
    const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
        () => ({
            type: locked ? ItemTypes.LOCKED_ELEMENT : ItemTypes.ELEMENT,
            item: () => {
                return { type: copyHeld ? ItemTypes.COPY_ELEMENT : locked ? ItemTypes.LOCKED_ELEMENT : ItemTypes.ELEMENT, id: dragId, left, top, element: element };
            },
            collect: (monitor) => {
                setDraggingState(monitor.isDragging());
                return{
                    isDragging: monitor.isDragging(),
                };
            },
            options: {
                force: Math.random(),
                dropEffect: locked ? 'copy' : copyHeld ? 'copy' : 'move'
            } as DragSourceOptions
        }),
        [element, dragId, left, top, copyHeld, locked, setDraggingState],
    );

    useEffect(() => {
        if (!draggingState) {
            setCopyFlipFlop(false);
        } else {
            if (copyHeld) {
                setCopyFlipFlop(true);
                logger.info('dragging with copy');
            }
        }
    }, [draggingState]);

    useEffect(() => {
        if (newDiscovery && mounted.current) {
            controls.start('newItem').then(() => {
                if (mounted.current) {
                    controls.start('newItemAway').then(() => {
                        stopState(dragId, 'newDiscovery');
                    });
                }
            });
        }
    }, [newDiscovery]);

    useEffect(() => {
        mounted.current = true;
        preview(getEmptyImage(), { captureDraggingState: true });
        return () => { mounted.current = false; };
    }, []);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: locked ? [] : [ItemTypes.ELEMENT, ItemTypes.COPY_ELEMENT, ItemTypes.SIDE_ELEMENT],
            drop(item: DragItem, monitor) {
                if (monitor.didDrop()) {
                    return;
                }
                const { x, y } = getXY(item, monitor);
                if (item.type === ItemTypes.SIDE_ELEMENT) {
                    // Create a new and place it
                    rawCombine(dragId, item.element.name).then(() => {
                        logger.info('combined: ', dragId, item.element.name);
                    }).catch((e) => {
                        logger.error('Side element combining error', e);
                    });
                } else if (item.type === ItemTypes.COPY_ELEMENT) {
                    // Create a new and place it
                    addBox(x, y, item.element, false);
                } else {
                    // Moving an existing item
                    moveBox(item.id, x, y);
                    if (dragId !== item.id) {
                        combine(dragId, item.id).then(() => {
                            logger.info('combined: ', dragId, item.id);
                        }).catch((e) => {
                            logger.error('Main element combining error', e);
                        });
                    }
                }
            },
            canDrop: (item: DragItem, monitor) => {
                if (monitor.getItem().id === dragId) {
                    return false;
                }
                return true;
            },
            collect: (monitor) => ({
                isOver: !locked && monitor.isOver() && (monitor.getItem().id !== dragId),
                isOverCurrent: !locked && monitor.isOver({ shallow: true }) && (monitor.getItem().id !== dragId),
            }),
        }),
        [moveBox, addBox, locked],
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleContext = async () => {
        try {
            setRecipes(await window.RecipeAPI.getRecipesFor(element.name));
        } catch (e) {
            logger.error('Context getting failed', e);
        }
        setDropdownOpen(!dropdownOpen);
    };
  
    const onClick = () => {
        if (removeHeld && !locked) {
            removeBox(dragId);
        }
    };

    useEffect(() => {
        (async () => {
            if (mounted.current) {
                controls.start('error');
            }
        })();
    }, [error]);

    useEffect(() => {
        (async () => {
            if (mounted.current) {
                if (loading) {
                    controls.start('flash');
                } else {
                    controls.start('stopFlash');
                }
            }
        })();
    }, [loading]);

    useEffect(() => {
        (async () => {
            if (mounted.current) {
                if (combining) {
                    controls.start('spin');
                } else {
                    controls.start('stopSpin');
                }
            }
        })();
    }, [combining]);

    useEffect(() => {
        (async () => {
            if (mounted.current) {
                if (draggingState && !copyFlipFlop && !locked) {
                    console.log('hidingingnig');
                    controls.start('hide');
                } else {
                    await controls.start('show');
                    if (loading && mounted.current) {
                        controls.start('flash');
                    }
                }
            }
        })();
    }, [draggingState, copyHeld, locked, copyFlipFlop]);

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
            opacity: [0.15, 1],
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
        newItem: () => ({
            backgroundSize: ['0%', '100%'],
            transition: {
                times: [0, 0.4],
                duration: 3,
                repeat: 0,
                // repeatType: 'mirror',
                ease: 'easeIn',
                repeatDelay: 0
            }
        }),
        newItemAway: () => ({
            backgroundSize: ['100%', '0%'],
            transition: {
                times: [0, 1],
                duration: 1,
                repeat: 0,
                ease: 'easeIn',
                repeatDelay: 0
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
            type={locked ? ItemTypes.LOCKED_ELEMENT : ItemTypes.MAIN_ELEMENT}
            dragging={isDragging}
            draggingRenderer={isDragging && !copyFlipFlop && !locked}
            ref={dragDrop}
            top={top}
            left={left}
            hasDropOver={isOver}
            newDiscovery={newDiscovery}
            initialOffset={{ x: 0, y: 0 }}
            currentOffset={{ x: 0, y: 0 }}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            onContextMenu={handleContext}
            onBlur={() => setDropdownOpen(false)}
            onClick={onClick}
            onMouseDown={() => {
                if (!removeHeld) {
                    playSound('pickup', 0.5);
                }
            }}
            variants={customVariants}
            animate={controls}
            disabled={loading}
            locked={locked}
            lockedVisibility={locked}
            exit={{
                opacity: 0,
                scale: 0,
                zIndex: 27,
                transition: {
                    duration: 0.3,
                }
            }}>
            <Dropdown show={dropdownOpen} onToggle={(nextShow) => setDropdownOpen(nextShow)}>
                <Dropdown.Menu>
                    <Dropdown.ItemText>
                        <button className={`btn badge text-bg-${locked ? 'secondary' : 'primary'} rounded-pill`} onClick={() => lockBox(dragId, !locked)}>{locked ? (<IoLockClosedOutline/>) : (<IoLockOpenOutline/>)}</button>
                        {element.base ? (<div className='badge text-bg-secondary rounded-pill float-end fs-6 ms-2'>Base</div>) : (<Fragment/>)}
                        {element.ai ? (<div className='badge text-bg-success rounded-pill float-end fs-6 ms-2'>AI</div>) : (<Fragment/>)}
                    </Dropdown.ItemText>
                    {recipes.filter((item) => item.discovered).map((recipe) => {
                        if (recipe.a.name === '' || recipe.b.name === '') {
                            return (
                                <Dropdown.ItemText key={`${recipe.result}`}>
                                    <ItemRenderer
                                        element={mockElement(recipe)}
                                        type={ItemTypes.RECIPE_ELEMENT}
                                        dragging={false}/>
                                </Dropdown.ItemText>);
                        }
                        return (
                            <Dropdown.ItemText key={`${recipe.a.name}${recipe.b.name}`}>
                                <ItemRenderer
                                    element={mockElement(recipe.a)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                                    +
                                <ItemRenderer
                                    element={mockElement(recipe.b)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                            </Dropdown.ItemText>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </ItemRenderer>
    );
};
