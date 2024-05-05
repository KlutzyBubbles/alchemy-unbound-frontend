import { useState, type FC, useEffect, useContext, CSSProperties } from 'react';
import { useDrop } from 'react-dnd';
import { RecipeElement } from '../../common/types';
import { SideElement } from './SideElement';
import { DragItem, ItemTypes } from '../types';
import { getXY } from '../utils';
import { SettingsContext } from '../providers/SettingsProvider';
import { SoundContext } from '../providers/SoundProvider';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

export interface SideListProps {
    removeBox: (id: string) => void,
    addBox: (element: RecipeElement, combining: boolean) => Promise<string>
    moveBox: (id: string, left: number, top: number) => Promise<void>
    elements: RecipeElement[],
    filter: number,
    searchText: string,
    sortBy: number,
    sortAscending: boolean,
    performance: boolean
}

const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];

const filterOptions = ['all', 'base', 'firstDiscovered'];

export const SideList: FC<SideListProps> = ({
    removeBox,
    moveBox,
    addBox,
    elements,
    filter,
    searchText,
    sortBy,
    sortAscending,
    performance
}) => {
    const [filteredElements, setFilteredElements] = useState<RecipeElement[]>(elements);
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);

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

    const filterList = async (list: RecipeElement[], searchText: string, currentFilter: string): Promise<RecipeElement[]> => {
        let filteredTemp = list;
        filteredTemp = filteredTemp.filter((item) => {
            let discovered = false;
            for (const recipe of item.recipes) {
                if (recipe.discovered) {
                    discovered = true;
                    break;
                }
            }
            return discovered;
        });
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

    useEffect(() => {
        runFilter();
    }, [filter, searchText]);

    const runFilter = async () => {
        let filteredTemp = await filterList(elements.map((x) => x), searchText, filterOptions[filter]);
        filteredTemp = await sortList(filteredTemp.map((x) => x), sortByOptions[sortBy], sortAscending);
        setFilteredElements(filteredTemp);
    };

    const runSort = async () => {
        const sortByOption = sortByOptions[sortBy];
        const sortedTemp = await sortList(filteredElements.map((x) => x), sortByOption, sortAscending);
        setFilteredElements(sortedTemp);
    };

    const sortList = async (list: RecipeElement[], sortByOption: string, sortAscending: boolean): Promise<RecipeElement[]> => {
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

    useEffect(() => {
        runSort();
    }, [sortBy, sortAscending]);

    useEffect(() => {
        runFilter();
    }, [elements]);

    return (
        <div ref={drop} className={`${isOver ? 'is-over' : ''} ${performance ? '' : 'overflow-y-scroll overflow-x-hidden'} h-100`}>
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
                                        <SideElement key={filteredElements[index].name} element={filteredElements[index]} removeBox={removeBox} addBox={addBox} performance={false} />
                                    </div>
                                )}
                            </FixedSizeList>
                        );
                    }}
                </AutoSizer>) : 
                filteredElements.map((element) => {
                    return (
                        <SideElement key={element.name} element={element} removeBox={removeBox} addBox={addBox} performance={performance} />
                    );
                })
            }
        </div>
    );
};
