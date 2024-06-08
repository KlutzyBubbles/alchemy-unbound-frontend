import { useState, type FC, useEffect, useContext, CSSProperties, UIEventHandler, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { RecipeElement, SideElement } from '../../common/types';
import { SideElementContainer } from './SideElement';
import { DragItem, ItemTypes } from '../types';
import { getXY } from '../utils';
import { SettingsContext } from '../providers/SettingsProvider';
import { SoundContext } from '../providers/SoundProvider';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import logger from 'electron-log/renderer';

export interface SideListProps {
    removeBox: (id: string) => void,
    addBox: (element: RecipeElement, combining: boolean) => Promise<string>
    moveBox: (id: string, left: number, top: number) => Promise<void>
    elements: RecipeElement[],
    filter: number,
    searchText: string,
    sortBy: number,
    sortAscending: boolean,
    sizeChange: number,
    performance: boolean
}

const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];

const filterOptions = ['all', 'base', 'firstDiscovered'];

function recipeToSideElement(elements: RecipeElement[]): SideElement[] {
    return elements.filter((item) => {
        let discovered = false;
        for (const recipe of item.recipes) {
            if (recipe.discovered) {
                discovered = true;
                break;
            }
        }
        return discovered;
    }).map((item) => {
        return {
            name: item.name,
            display: item.display,
            emoji: item.emoji,
            sortDepth: item.sortDepth,
            sortOrder: item.sortOrder,
            base: item.base,
            ai: item.ai,
            first: item.first
        };
    });
}

export const SideList: FC<SideListProps> = ({
    removeBox,
    moveBox,
    addBox,
    elements,
    filter,
    searchText,
    sortBy,
    sortAscending,
    sizeChange,
    performance
}) => {
    const [elementHolder, setElementHolder] = useState<SideElement[]>(recipeToSideElement(elements));
    const [filteredElements, setFilteredElements] = useState<SideElement[]>(elements);
    const [itemsDisplayed, setItemsDisplayed] = useState<number>(100);
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);
    const elementRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.ELEMENT, ItemTypes.LOCKED_ELEMENT],
            drop(item: DragItem, monitor) {
                if (monitor.didDrop()) {
                    return;
                }
                if (item.id !== undefined) {
                    playSound('side-drop');
                    if (item.type !== ItemTypes.LOCKED_ELEMENT) {
                        const { x, y } = getXY(item, monitor);
                        moveBox(item.id, x, y).then(() => {
                            (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
                                removeBox(item.id);
                            });
                        });
                    }
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }),
        [removeBox],
    );

    const filterList = async (list: SideElement[], searchText: string, currentFilter: string): Promise<SideElement[]> => {
        let filteredTemp = list;
        //filteredTemp = filteredTemp.filter((item) => {
        //    let discovered = false;
        //    for (const recipe of item.recipes) {
        //        if (recipe.discovered) {
        //            discovered = true;
        //            break;
        //        }
        //    }
        //    return discovered;
        //});
        if (searchText !== '') {
            const sanitizedSearch = searchText.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');
            filteredTemp = filteredTemp.filter((element) => {
                if (element.display[settings.language].toLocaleLowerCase().search(sanitizedSearch) !== -1) {
                    return true;
                }
                if (element.emoji === searchText) {
                    return true;
                }
                return false;
            });
        }
        if (currentFilter !== 'all') {
            if (currentFilter === 'base') {
                filteredTemp = filteredTemp.filter((element) => element.base);
            } else if (currentFilter === 'firstDiscovered') {
                filteredTemp = filteredTemp.filter((element) => element.first);
            }
        }
        return filteredTemp;
    };

    const runFilter = async (elements: SideElement[]) => {
        let filteredTemp = await filterList(elements.map((x) => x), searchText, filterOptions[filter]);
        filteredTemp = await sortList(filteredTemp.map((x) => x), sortByOptions[sortBy], sortAscending);
        return filteredTemp;
        //setFilteredElements(filteredTemp);
    };

    const runSort = async (elements: SideElement[]) => {
        const sortByOption = sortByOptions[sortBy];
        const sortedTemp = await sortList(elements.map((x) => x), sortByOption, sortAscending);
        return sortedTemp;
        // setFilteredElements(sortedTemp);
    };

    const sortList = async (list: SideElement[], sortByOption: string, sortAscending: boolean): Promise<SideElement[]> => {
        let sortedTemp = list.sort((a, b) => {
            // const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];
            if (sortByOption === 'discovered') {
                // This one is inverted to go from most recent
                //console.log('Sorting discovered', aOrder < bOrder ? 1 : aOrder > bOrder ? -1 : 0, a.name, b.name, aOrder, bOrder);
                return a.sortOrder < b.sortOrder ? -1 : a.sortOrder > b.sortOrder ? 1 : 0;
            } else if (sortByOption === 'name') {
                //console.log('Sorting name', a.name < b.name ? -1 : a.name > b.name ? 1 : 0, a.name, b.name);
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            } else if (sortByOption === 'emoji') {
                //console.log('Sorting emoji', a.emoji < b.emoji ? -1 : a.emoji > b.emoji ? 1 : 0, a.emoji, b.emoji);
                return a.emoji < b.emoji ? -1 : a.emoji > b.emoji ? 1 : 0;
            } else if (sortByOption === 'depth') {
                //console.log('Sorting depth', aDepth < bDepth ? -1 : aDepth > bDepth ? 1 : 0, a.name, b.name, aDepth, bDepth);
                return a.sortDepth < b.sortDepth ? -1 : a.sortDepth > b.sortDepth ? 1 : 0;
            }
            return 0;
        });
        if (sortAscending) {
            sortedTemp = sortedTemp.reverse();
        }
        return sortedTemp;
    };

    const scrollToTop = () => {
        if (elementRef.current !== undefined && elementRef.current !== null) {
            elementRef.current.scrollTo(0, 0);
        }
    };

    useEffect(() => {
        (async() => {
            try {
                const temp = await runFilter(elementHolder);
                setFilteredElements(temp);
                scrollToTop();
                setItemsDisplayed(100);
            } catch (e) {
                logger.error('Failed to filter for filter / search', e);
            }
        })();
    }, [filter, searchText]);

    useEffect(() => {
        (async() => {
            try {
                const temp = await runSort(elementHolder);
                setFilteredElements(temp);
                scrollToTop();
                setItemsDisplayed(100);
            } catch (e) {
                logger.error('Failed to sort for sort', e);
            }
        })();
    }, [sortBy, sortAscending]);

    useEffect(() => {
        const tempElements = recipeToSideElement(elements);
        const currentElements = structuredClone(elementHolder);
        let needsFilter = false;
        let newItems = false;
        for (const tempElement of tempElements) {
            const index = currentElements.findIndex((item) => item.name === tempElement.name);
            if (index !== -1) {
                const wasFirst = currentElements[index].first;
                if (wasFirst !== true && wasFirst !== tempElement.first) {
                    currentElements[index].first = true;
                    needsFilter = true;
                }
            } else {
                currentElements.push(tempElement);
                newItems = true;
                needsFilter = true;
            }
        }
        for (let i = currentElements.length - 1; i >= 0; i--) {
            const currentElement = currentElements[i];
            const index = tempElements.findIndex((item) => item.name === currentElement.name);
            if (index === -1) {
                currentElements.splice(i, 1);
                needsFilter = true;
            }
        }
        if (newItems) {
            setElementHolder(currentElements);
        }
        if (needsFilter) {
            (async() => {
                try {
                    const temp = await runFilter(currentElements);
                    setFilteredElements(temp);
                    scrollToTop();
                    setItemsDisplayed(100);
                } catch (e) {
                    logger.error('Failed to filter for new elements', e);
                }
            })();
        }
    }, [elements]);

    const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.clientHeight <= e.currentTarget.scrollTop + 50;
        if (bottom) {
            setItemsDisplayed((itemsDisplayed) => {
                return itemsDisplayed + 100;
            });
        }
    };

    useEffect(() => {
        logger.info('items changeeed');
        if (itemsDisplayed < elementHolder.length) {
            logger.info('length');
            if (elementRef.current !== undefined) {
                logger.info('current');
                if (elementRef.current.scrollHeight <= elementRef.current.clientHeight) {
                    logger.info('Increasing for space');
                    setItemsDisplayed((itemsDisplayed) => {
                        return itemsDisplayed + 100;
                    });
                }
            }
        }
    }, [itemsDisplayed, elementHolder, sizeChange]);

    return (
        <div ref={(ref) => {
            drop(ref);
            elementRef.current = ref;
        }} className={`pb-2 ${isOver ? 'is-over' : ''} ${performance ? '' : 'overflow-y-scroll overflow-x-hidden'} h-100`}
        onScroll={onScroll}>
            {performance ? (
                <AutoSizer>
                    {({ height, width }: Size) => {
                        // Use these actual sizes to calculate your percentage based sizes
                        return (
                            <FixedSizeList
                                height={height}
                                width={width}
                                itemCount={filteredElements.length}
                                itemSize={50}>
                                {({ index, style }: { index: number; style: CSSProperties; }) => (
                                    <div style={style}>
                                        <SideElementContainer key={filteredElements[index].name} element={filteredElements[index]} removeBox={removeBox} addBox={addBox} performance={false} />
                                    </div>
                                )}
                            </FixedSizeList>
                        );
                    }}
                </AutoSizer>) : 
                filteredElements.filter((item, index) => index <= itemsDisplayed).map((element) => {
                    return (
                        <SideElementContainer key={element.name} element={element} removeBox={removeBox} addBox={addBox} performance={performance} />
                    );
                })
            }
        </div>
    );
};
