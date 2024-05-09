import update from 'immutability-helper';
import type { FC } from 'react';
import { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';

import { MainElement } from './MainElement';
import { CombineOutput, LocalErrorCode, Recipe, RecipeElement, ServerErrorCode } from '../../common/types';
import { CustomDragLayer } from './DragLayer';
import Split from 'react-split';
import { SideContainer } from './SideContainer';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { ModalOption } from '../Container';
import { Box, DragItem, ItemTypes } from '../types';
import { getAllRecipes, getBaseFirst, getOrderDepth, getXY, makeId } from '../utils';
import { SoundContext } from '../providers/SoundProvider';
import logger from 'electron-log/renderer';
import { UpdateContext } from '../providers/UpdateProvider';
import { hasProp } from '../../common/utils';
import { LoadingContext } from '../providers/LoadingProvider';
import { itemRecipeCheck, unlockCheck } from '../utils/achievements';
import { MainButtons } from './MainButtons';
import { SettingsContext } from '../providers/SettingsProvider';
import { IoMenuOutline } from 'react-icons/io5';

export interface ContainerProps {
  openModal: (option: ModalOption) => void
}

export const DropContainer: FC<ContainerProps> = ({
    openModal
}) => {
    const [elements, setElements] = useState<RecipeElement[]>([]);
    const [copyHeld, setCopyHeld] = useState<boolean>(false);
    const [removeHeld, setRemoveHeld] = useState<boolean>(false);
    const [rateLimited, setRateLimited] = useState<boolean>(false);
    const [deprecated, setDeprecated] = useState<boolean>(false);
    const { setLoading } = useContext(LoadingContext);
    const { playSound } = useContext(SoundContext);
    const mainElement = useRef<HTMLDivElement>();
    const { shouldUpdate, setShouldUpdate } = useContext(UpdateContext);
    const [refreshHint, setRefreshHint] = useState<number>(0);
    const currentHover = useRef<string>(undefined);
    const speedTimerRef = useRef<NodeJS.Timeout>(undefined);
    const { settings } = useContext(SettingsContext);
    const [boxes, setBoxes] = useState<{
        [key: string]: Box
    }>({});

    async function refreshRecipes() {
        const working = await getAllRecipes();
        setElements(working);
    }

    useEffect(() => {
        refreshRecipes();
        mainElement.current.focus();
        
        document.addEventListener('keydown', handleKeyDown2, false);
        document.addEventListener('keyup', handleKeyUp2, false);
        return () => {
            if (speedTimerRef.current !== undefined) {
                clearTimeout(speedTimerRef.current);
            }
            document.removeEventListener('keydown', handleKeyDown2, false);
            document.removeEventListener('keyup', handleKeyUp2, false);
        };
    }, []);

    useEffect(() => {
        if (rateLimited) {
            if (speedTimerRef.current !== undefined) {
                clearTimeout(speedTimerRef.current);
            }
            const timer = setTimeout(() => setRateLimited(false), 6969);
            speedTimerRef.current = timer;
        }
    }, [rateLimited]);

    useEffect(() => {
        (async () => {
            if (shouldUpdate) {
                await refreshRecipes();
                setBoxes(() => { return {}; });
                setShouldUpdate(false);
                setLoading(true);
            }
        })();
    }, [shouldUpdate]);

    const mergeState = async <K extends keyof Box, T extends Box[K]>(a: string, b: string | undefined, state: K, value: T) => {
        if (b === undefined) {
            setBoxes((boxes) => {
                if (hasProp(boxes, a)) {
                    return update(boxes, {
                        [a]: {
                            $merge: { [state]: value },
                        },
                    });
                }
                return boxes;
            });
        } else {
            setBoxes((boxes) => {
                if (hasProp(boxes, a) && hasProp(boxes, b)) {
                    return update(boxes, {
                        [a]: {
                            $merge: { [state]: value },
                        },
                        [b]: {
                            $merge: { [state]: value },
                        },
                    });
                }
                return boxes;
            });
        }
    };

    const addError = async (a: string, b?: string) => {
        if (hasProp(boxes, a)) {
            if (b === undefined) {
                setBoxes((boxes) => {
                    return update(boxes, {
                        [a]: {
                            $apply: (v) => {
                                v.error += 1;
                                return v;
                            },
                        },
                    });
                });
            } else {
                if (hasProp(boxes, b)) {
                    setBoxes((boxes) => {
                        return update(boxes, {
                            [a]: {
                                $apply: (v) => {
                                    v.error += 1;
                                    return v;
                                },
                            },
                            [b]: {
                                $apply: (v) => {
                                    v.error += 1;
                                    return v;
                                },
                            },
                        });
                    });
                }
            }
        }
    };

    const devButton = () => {
        logger.warn('This is a dev button and shouldnt be visible');
    };

    const backendCombine = async (aName: string, bName: string): Promise<{
        newDiscovery: boolean,
        firstDiscovery: boolean,
        recipe: Recipe,
        recipes: Recipe[]
    }> => {
        logger.debug(`backendCombine(${aName}, ${bName})`);
        let combinedResult: CombineOutput | undefined = undefined;
        try {
            combinedResult = await window.ServerAPI.combine(aName, bName);
        } catch (error) {
            logger.error('Failed combining from main', error);
            await window.ErrorAPI.registerError({
                a: aName,
                b: bName,
                message: error.toString(),
                type: 'combine',
                code: LocalErrorCode.UNKNOWN
            });
        }
        if (combinedResult === undefined) {
            logger.debug('Combine failed in offline mode');
        } else {
            if (combinedResult.result.deprecated) {
                setDeprecated(true);
            }
            if (combinedResult.result.responseCode === 429) {
                setRateLimited(true);
            }
            if (combinedResult.type === 'error') {
                /*
                STEAM_TICKET_INVALID = 5,
                TOKEN_EXPIRED = 6,
                STEAM_SERVERS_DOWN = 7,
                AB_NUMBER = 8,
                MAX_DEPTH = 9,
                STEAM_ERROR = 10,
                ITEM_UNKNOWN = 11
                TRANSLATION_ERROR = 12
                */
                const errorCode = combinedResult.result.code;
                if (errorCode <= 7 || errorCode === ServerErrorCode.STEAM_ERROR) {
                    // Soft / Unknown error that shouldn't ever make it here.
                    logger.error(`Found error code ${errorCode} where it shouln't be. Please report this if you see it`);
                } else {
                    if (errorCode === ServerErrorCode.AB_NUMBER) {
                        logger.error(`Combine a/b is number '${aName}', '${bName}'`);
                    } else if (errorCode === ServerErrorCode.MAX_DEPTH) {
                        window.SteamAPI.activateAchievement('baited');
                        logger.error(`Combine a/b is max depth '${aName}', '${bName}'`);
                    } else if (errorCode === ServerErrorCode.ITEM_UNKNOWN) {
                        logger.error(`Combine a/b is unknown (this is usually because of modified save files / updates) '${aName}', '${bName}'`);
                    } else if (errorCode === ServerErrorCode.TRANSLATION_ERROR) {
                        logger.error(`Combine a/b translation failed, just try again '${aName}', '${bName}'`);
                    } else {
                        logger.error(`Combine a/b unknown error '${aName}', '${bName}'`);
                    }
                    await window.ErrorAPI.registerError({
                        a: aName,
                        b: bName,
                        type: 'combine',
                        code: errorCode
                    });
                }
            } else {
                const combined = combinedResult.result;
                if (combinedResult === undefined) {
                    logger.debug('Combine failed in offline mode (two)');
                } else {
                    logger.debug('Found recipe', combined);
                    if (combined.recipe.result === '69') {
                        window.SteamAPI.activateAchievement('nice');
                    }
                    if (['egg', 'idea'].includes(combined.recipe.result)) {
                        await itemRecipeCheck(combined.recipe.result);
                    }
                    const currentHint = await window.HintAPI.getHint(false);
                    if (currentHint !== undefined && combined.recipe.result === currentHint.result) {
                        await window.HintAPI.hintComplete();
                    }
                    if (combined.hintAdded || (currentHint !== undefined && combined.recipe.result === currentHint.result)) {
                        setRefreshHint((value) => {
                            return value + 1;
                        });
                    }
                    const stats = await window.StatsAPI.getStats();
                    if (combined.newDiscovery) {
                        playSound('new-discovery');
                        if (combined.recipe.base) {
                            stats.baseRecipesFound += 1;
                        } else {
                            stats.aiRecipesFound += 1;
                        }
                    }
                    if (combined.firstDiscovery) {
                        playSound('first-discovery');
                        stats.firstDiscoveries += 1;
                    }
                    if (combined.recipe.base) {
                        if (combined.recipe.depth > stats.baseHighestDepth) {
                            stats.baseHighestDepth = combined.recipe.depth;
                        }
                    } else {
                        if (combined.recipe.depth > stats.aiHighestDepth) {
                            stats.aiHighestDepth = combined.recipe.depth;
                        }
                    }
                    const elementList = elements.filter((value) => value.name === combined.recipe.result);
                    logger.debug('found elements', elementList);
                    let recipes: Recipe[] = [];
                    if (elementList.length === 0) {
                        logger.debug('No existing element found');
                        recipes.push(combined.recipe);
                    } else {
                        if (elementList.length > 1) {
                            logger.warn('Elements list is more than 1, it should only be 1');
                        }
                        const element = elementList[0];
                        logger.debug('time to check', element.recipes);
                        recipes = element.recipes;
                        let recipeExists = false;
                        let newResultCount = 0;
                        let newResult = false;
                        for (const r of element.recipes) {
                            if (r.discovered) {
                                newResultCount += 1;
                            }
                        }
                        for (const r of element.recipes) {
                            if (((r.a.name === combined.recipe.a.name && r.b.name === combined.recipe.b.name) || (r.a.name === combined.recipe.b.name && r.b.name === combined.recipe.a.name))) {
                                logger.debug('recipeExists', r, combined.recipe);
                                if (combined.newDiscovery && newResultCount <= 1) {
                                    newResult = true;
                                }
                                recipeExists = true;
                                break;
                            }
                        }
                        if (!recipeExists) {
                            recipes.push(combined.recipe);
                        }
                        if (newResult) {
                            if (combined.recipe.base) {
                                stats.baseResultsFound += 1;
                            } else {
                                stats.aiResultsFound += 1;
                            }
                        }
                    }
                    stats.itemsCombined += 1;
                    unlockCheck(stats);
                    await window.StatsAPI.setStats(stats);
                    // setStats(stats);
                    return {
                        newDiscovery: combined.newDiscovery,
                        firstDiscovery: combined.firstDiscovery,
                        recipe: combined.recipe,
                        recipes
                    };
                }
            }
        }
    };

    const rawCombine = async (a: string, bName: string) => {
        let workingBoxes: {
            [key: string]: Box
        } = {};
        await new Promise<void>((resolve) => {
            setBoxes((boxes) => {
                logger.debug(`rawCombine(${a}, ${bName})`, boxes);
                workingBoxes = boxes;
                resolve();
                return boxes;
            });
        });
        if (hasProp(workingBoxes, a)) {
            try {
                mergeState(a, undefined, 'loading', true);
                const backendResult = await backendCombine(workingBoxes[a].element.name, bName);
                if (backendResult === undefined) {
                    mergeState(a, undefined, 'loading', false);
                    return;
                }
                const { recipe, newDiscovery, firstDiscovery } = backendResult;
                mergeState(a, undefined, 'loading', false);
                playSound('drop', 0.5);
                const updatedRecipes = await window.RecipeAPI.getRecipesFor(recipe.result);
                const steamId = await window.SteamAPI.getSteamId() ?? 'NO_STEAM_ID';
                setBoxes((boxes) => {
                    if (newDiscovery !== undefined 
                        && firstDiscovery !== undefined
                        && recipe !== undefined
                        && recipe.result !== undefined
                        && recipe.display !== undefined
                        && recipe.emoji !== undefined
                        && updatedRecipes !== undefined) {
                        try {
                            const ordering = getOrderDepth(updatedRecipes);
                            const filtering = getBaseFirst(updatedRecipes, steamId);
                            const temp = update(boxes, {
                                [a]: {
                                    $merge: {
                                        newDiscovery: newDiscovery,
                                        firstDiscovery: firstDiscovery,
                                        element: {
                                            name: recipe.result,
                                            display: recipe.display,
                                            emoji: recipe.emoji,
                                            first: filtering.first,
                                            base: filtering.base,
                                            sortOrder: ordering.order,
                                            sortDepth: ordering.depth,
                                            recipes: updatedRecipes
                                        }
                                    },
                                }
                            });
                            logger.debug('result', temp);
                            return temp;
                        } catch (e) {
                            logger.error('Failed to update boxes', e);
                        }
                    } else {
                        return boxes;
                    }
                });
                await refreshRecipes();
            } catch(e) {
                mergeState(a, undefined, 'loading', false);
                addError(a, undefined);
                logger.error('Error raw combining', e);
            }
        } else {
            logger.warn('One of the items doesn\'t exist anymore');
            throw('One of the items doesn\'t exist anymore');
        }
    };

    const stopState = async (key: string, state: keyof Box) => {
        if (hasProp(boxes, key)) {
            try {
                mergeState(key, undefined, state, false);
            } catch(e) {
                logger.error('Error stopping state', e);
            }
        }
    };

    const combine = async (a: string, b: string) => {
        let workingBoxes: {
            [key: string]: Box
        } = {};
        await new Promise<void>((resolve) => {
            setBoxes((boxes) => {
                logger.debug(`combineInternal(${a}, ${b})`, boxes);
                workingBoxes = boxes;
                resolve();
                return boxes;
            });
        });
        logger.debug(`combine(${a}, ${b})`, workingBoxes);
        if (hasProp(workingBoxes, a) && hasProp(workingBoxes, b)) {
            try {
                mergeState(a, b, 'loading', true);
                const backendResult = await backendCombine(workingBoxes[a].element.name, workingBoxes[b].element.name);
                if (backendResult === undefined) {
                    mergeState(a, b, 'loading', false);
                    return;
                }
                const { recipe, recipes, newDiscovery, firstDiscovery } = backendResult;
                mergeState(a, b, 'loading', false);
                playSound('drop', 0.5);
                logger.debug('updatingboxes', {
                    name: recipe.result,
                    display: recipe.display,
                    emoji: recipe.emoji,
                    recipes: recipes
                });
                const updatedRecipes = await window.RecipeAPI.getRecipesFor(recipe.result);
                const steamId = await window.SteamAPI.getSteamId() ?? 'NO_STEAM_ID';
                logger.debug('Resulintg updaterd recipes', recipe.result, updatedRecipes);
                setBoxes((boxes) => {
                    if (newDiscovery !== undefined 
                        && firstDiscovery !== undefined
                        && recipe !== undefined
                        && recipe.result !== undefined
                        && recipe.display !== undefined
                        && recipe.emoji !== undefined
                        && updatedRecipes !== undefined) {
                        try {
                            const ordering = getOrderDepth(updatedRecipes);
                            const filtering = getBaseFirst(updatedRecipes, steamId);
                            const temp = update(boxes, {
                                [a]: {
                                    $merge: {
                                        newDiscovery: newDiscovery,
                                        firstDiscovery: firstDiscovery,
                                        element: {
                                            name: recipe.result,
                                            display: recipe.display,
                                            emoji: recipe.emoji,
                                            first: filtering.first,
                                            base: filtering.base,
                                            sortOrder: ordering.order,
                                            sortDepth: ordering.depth,
                                            recipes: updatedRecipes
                                        }
                                    },
                                }
                            });
                            delete temp[b];
                            return temp;
                        } catch (e) {
                            logger.error('Failed to update boxes', e);
                        }
                    } else {
                        return boxes;
                    }
                });
                await refreshRecipes();
            } catch(e) {
                mergeState(a, b, 'loading', false);
                addError(a, b);
                logger.error('Error combining', e);
            }
        } else {
            logger.error('One or more of the items doesn\'t exist anymore');
            throw('One or more of the items doesn\'t exist anymore');
        }
    };

    const removeBox = useCallback((id: string) => {
        setBoxes((boxes) => {
            if (hasProp(boxes, id)) {
                const temp = {...boxes};
                if (hasProp(boxes, id)) {
                    delete temp[id];
                }
                return temp;
            }
            return boxes;
        });
    }, [setBoxes]);

    const moveBox = useCallback((id: string, left: number, top: number): Promise<void> => {
        return new Promise((resolve) => {
            setBoxes((boxes) => {
                if (hasProp(boxes, id)) {
                    resolve();
                    return update(boxes, {
                        [id]: {
                            $merge: { left, top },
                        },
                    });
                } else {
                    resolve();
                    return boxes;
                }
            });
        });
    }, [setBoxes]);

    const lockBox = useCallback((id: string, locked: boolean): Promise<void> => {
        return new Promise((resolve) => {
            setBoxes((boxes) => {
                if (hasProp(boxes, id)) {
                    resolve();
                    return update(boxes, {
                        [id]: {
                            $merge: { locked },
                        },
                    });
                } else {
                    resolve();
                    return boxes;
                }
            });
        });
    }, [setBoxes]);

    const invertLock = useCallback((id: string): Promise<void> => {
        return new Promise((resolve) => {
            setBoxes((boxes) => {
                if (hasProp(boxes, id)) {
                    resolve();
                    return update(boxes, {
                        [id]: {
                            $merge: { locked: !boxes[id].locked },
                        },
                    });
                } else {
                    resolve();
                    return boxes;
                }
            });
        });
    }, [setBoxes]);
    
    const addBox = useCallback((x: number, y: number, element: RecipeElement, combining: boolean): Promise<string> => {
        return new Promise((resolve) => {
            const newId = makeId(10);
            setBoxes((boxes) => {
                return {
                    ...boxes,
                    [newId]: {
                        top: y,
                        left: x,
                        combining: combining,
                        newCombining: false,
                        loading: false,
                        locked: false,
                        newDiscovery: false,
                        firstDiscovery: false,
                        error: 0,
                        element: element
                    }
                };
            });
            const wait: () => void = () => {
                setBoxes((value) => {
                    if (hasProp(value, newId)) {
                        resolve(newId);
                    } else {
                        setTimeout(wait, 200);
                    }
                    return value;
                });
            };
            setTimeout(wait, 200);
        });
    }, [setBoxes]);

    const addBoxRandomLocation = useCallback((element: RecipeElement, combining: boolean): Promise<string> => {
        const width = mainElement.current.clientWidth;
        const height = mainElement.current.clientHeight;

        const boxSizing = 0.4;
        const boxWidth = width * boxSizing;
        const boxHeight = height * boxSizing;

        const boxX = (width / 2) - (boxWidth / 2);
        const boxY = (height / 2) - (boxHeight / 2);

        const randomX =  Math.floor(Math.random() * boxWidth);
        const randomY =  Math.floor(Math.random() * boxHeight);

        return addBox(boxX + randomX, boxY + randomY, element, combining);
    }, [addBox]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_props, drop] = useDrop(
        () => ({
            accept: [ItemTypes.ELEMENT, ItemTypes.COPY_ELEMENT, ItemTypes.SIDE_ELEMENT, ItemTypes.LOCKED_ELEMENT],
            drop(item: DragItem, monitor) {
                if (monitor.didDrop()) {
                    return;
                }
                let { x, y } = getXY(item, monitor);
                if (item.type === ItemTypes.SIDE_ELEMENT) {
                    // Create a new and place it
                    if (item.offset !== undefined) {
                        x -= item.offset.x;
                        y -= item.offset.y;
                    }
                    addBox(x, y, item.element, false);
                } else if (item.type === ItemTypes.COPY_ELEMENT || item.type === ItemTypes.LOCKED_ELEMENT) {
                    addBox(x, y, item.element, false);
                } else {
                    // Moving an existing item
                    moveBox(item.id, x, y);
                }
                return undefined;
            }
        }),
        [moveBox],
    );

    const elementVariants = {
        error: () => ({
            rotate: [0, -20, 20, -20, 20, 0],
            transition: {
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                duration: 0.5,
                repeat: 0,
                ease: 'easeInOut',
                repeatDelay: 0.5
            },
        }),
        reset: {
            rotate: 0
        }
    };

    const handleKeyDown2: EventListenerOrEventListenerObject = (e) => {
        console.log('keydown', e);
        const event = e as KeyboardEvent;
        if (event.key === settings.keybinds.copy) {
            setCopyHeld(true);
        }
        if (event.key === settings.keybinds.remove) {
            setRemoveHeld(true);
        }
        if (event.key === settings.keybinds.lock) {
            if (currentHover.current !== undefined) {
                invertLock(currentHover.current);
            }
        }
    };

    const handleKeyUp2: EventListenerOrEventListenerObject = (e) => {
        console.log('keyup', e);
        const event = e as KeyboardEvent;
        if (event.key === settings.keybinds.copy) {
            setCopyHeld(false);
        }
        if (event.key === settings.keybinds.remove) {
            setRemoveHeld(false);
        }
    };

    const clearAll = () => {
        setBoxes({});
    };

    const openMenu = () => {
        console.log('openMenu');
    };

    const elementControls = useAnimation();

    return (
        <Fragment>
            <Split
                sizes={[75, 25]}
                className="split p-0 m-0"
                gutterSize={2}
                snapOffset={0}
            >
                <div
                    className='main-container'
                    ref={mainElement}
                    tabIndex={0}
                >
                    <div ref={drop} className='d-flex flex-column vh-100 h-100 w-100 overflow-hidden z-main'>
                        <div
                            className='btn btn-no-outline float-start mb-2 fs-1 d-flex p-2 position-fixed z-mainButtons'
                            onClick={openMenu}
                            data-bs-toggle="offcanvas" data-bs-target="#sideMenu"><IoMenuOutline /></div>
                        <AnimatePresence>
                            {boxes === undefined ? (<Fragment/>) : Object.keys(boxes).filter((v) => v !== undefined).map((key) => {
                                const { left, top, element, combining, newCombining, loading, error, newDiscovery, firstDiscovery, locked } = boxes[key];
                                return (
                                    <motion.div
                                        key={key}
                                        custom={key}
                                        variants={elementVariants}
                                        animate={elementControls}>
                                        <MainElement
                                            key={key}
                                            dragId={key}
                                            left={left}
                                            top={top}
                                            element={element}
                                            combining={combining}
                                            newCombine={newCombining}
                                            newDiscovery={newDiscovery}
                                            firstDiscovery={firstDiscovery}
                                            copyHeld={copyHeld}
                                            removeHeld={removeHeld}
                                            loading={loading}
                                            locked={locked}
                                            error={error}
                                            onHoverStart={() => currentHover.current = key}
                                            onHoverEnd={() => currentHover.current = undefined}
                                            addBox={addBox}
                                            removeBox={removeBox}
                                            moveBox={moveBox}
                                            lockBox={lockBox}
                                            stopState={stopState}
                                            rawCombine={rawCombine}
                                            combine={combine}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <CustomDragLayer/>
                        <MainButtons
                            clearAll={clearAll}
                            openModal={openModal}
                            refreshHint={refreshHint}
                            deprecated={deprecated}
                            rateLimited={rateLimited}
                            devButton={devButton}/>
                    </div>
                </div>
                <SideContainer
                    elements={elements}
                    removeBox={removeBox}
                    moveBox={moveBox}
                    addBox={addBoxRandomLocation}/>
            </Split>
        </Fragment>
    );
};
