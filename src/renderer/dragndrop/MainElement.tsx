import { useState, type FC, type ReactNode, useEffect, useContext, useRef } from 'react';
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

export interface BoxProps {
  dragId: string
  left: number
  top: number
  element: RecipeElement
  addBox: (x: number, y: number, element: RecipeElement, combining: boolean) => Promise<string>
  moveBox: (id: string, left: number, top: number) => Promise<void>
  rawCombine: (a: string, bName: string) => Promise<void>,
  combine: (a: string, b: string) => Promise<void>,
  stopState: (key: string, state: keyof Box) => void,
  removeBox: (id: string) => void,
  combining: boolean,
  newCombine: boolean,
  newDiscovery: boolean,
  firstDiscovery: boolean,
  shift: boolean,
  control: boolean,
  alt: boolean,
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
    newDiscovery,
    addBox,
    moveBox,
    rawCombine,
    stopState,
    combine,
    removeBox,
    control,
    alt,
    combining,
    loading,
    error,
}) => {
    const { playSound } = useContext(SoundContext);
    const dragDrop = (node: ConnectableElement, options?: DragSourceOptions) => {
        drag(node, options);
        drop(node, options);
    };
    const [recipes, setRecipes] = useState<Recipe[]>(element.recipes);
    const mounted = useRef(false);
    
    const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>(
        () => ({
            type: ItemTypes.ELEMENT,
            item: () => {
                return { type: control ? ItemTypes.COPY_ELEMENT : ItemTypes.ELEMENT, id: dragId, left, top, element: element, control };
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            options: {
                force: Math.random(),
                dropEffect: control ? 'copy' : 'move'
            } as DragSourceOptions
        }),
        [element, dragId, left, top, control],
    );

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
            accept: [ItemTypes.ELEMENT, ItemTypes.COPY_ELEMENT, ItemTypes.SIDE_ELEMENT],
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
                isOver: monitor.isOver() && (monitor.getItem().id !== dragId),
                isOverCurrent: monitor.isOver({ shallow: true }) && (monitor.getItem().id !== dragId),
            }),
        }),
        [moveBox, addBox],
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
        if (alt) {
            removeBox(dragId);
        }
        // controls.start('error');
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
                if (isDragging && !control) {
                    controls.start('hide');
                } else {
                    await controls.start('show');
                    if (loading && mounted.current) {
                        controls.start('flash');
                    }
                }
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
            type={ItemTypes.MAIN_ELEMENT}
            dragging={isDragging && !control}
            ref={dragDrop}
            top={top}
            left={left}
            hasDropOver={isOver}
            newDiscovery={newDiscovery}
            initialOffset={{ x: 0, y: 0 }}
            currentOffset={{ x: 0, y: 0 }}
            onContextMenu={handleContext}
            onBlur={() => setDropdownOpen(false)}
            onClick={onClick}
            onMouseDown={() => {
                if (!alt) {
                    playSound('pickup', 0.5);
                }
            }}
            variants={customVariants}
            animate={controls}
            disabled={loading}
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
                    {recipes.filter((item) => item.discovered).map((recipe) => {
                        if (recipe.a.name === '' || recipe.b.name === '') {
                            return (
                                <Dropdown.Item key={`${recipe.result}`} href="#">
                                    <ItemRenderer
                                        element={mockElement(recipe)}
                                        type={ItemTypes.RECIPE_ELEMENT}
                                        dragging={false}/>
                                </Dropdown.Item>);
                        }
                        return (
                            <Dropdown.Item key={`${recipe.a.name}${recipe.b.name}`} href="#">
                                <ItemRenderer
                                    element={mockElement(recipe.a)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                                    +
                                <ItemRenderer
                                    element={mockElement(recipe.b)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </ItemRenderer>
    );
};
