import { useState, type ChangeEventHandler, type FC, useEffect, useContext, MouseEventHandler } from 'react';
import { useDrop } from 'react-dnd';
import { RecipeElement } from '../../common/types';
import { SideElement } from './SideElement';
import { DragItem, ItemTypes } from '../types';
import { getXY } from '../utils';
import { SettingsContext } from '../providers/SettingsProvider';
import { IoArrowDown, IoArrowUp, IoFilterOutline } from 'react-icons/io5';
import { getFromStore } from '../language';

export interface ContainerProps {
  removeBox: (id: string) => void,
  moveBox: (id: string, left: number, top: number) => Promise<void>
  elements: RecipeElement[],
}

const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];

const filterOptions = ['all', 'base', 'firstDiscovered'];

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    moveBox,
    elements
}) => {
    const [filteredElements, setFilteredElements] = useState<RecipeElement[]>(elements);
    const [sortBy, setSortBy] = useState<number>(0);
    const [sortAscending, setSortAscending] = useState<boolean>(false);
    const [filter, setFilter] = useState<number>(0);
    const [searchText, setSearchText] = useState<string>('');
    const { settings } = useContext(SettingsContext);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.ELEMENT],
            drop(item: DragItem, monitor) {
                if (monitor.didDrop()) {
                    return;
                }
                console.log(`removing ${item.id}`);
                if (item.id !== undefined) {
                    const { x, y } = getXY(item, monitor);
                    moveBox(item.id, x, y).then(() => {
                        (new Promise(resolve => setTimeout(resolve, 100))).then(() => {
                            removeBox(item.id);
                        });
                    });
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                isOverCurrent: monitor.isOver({ shallow: true }),
            }),
        }),
        [removeBox],
    );

    const filterList = (list: RecipeElement[], searchText: string, currentFilter: string): RecipeElement[] => {
        let filteredTemp = list;
        if (searchText !== '') {
            filteredTemp = filteredTemp.filter((element) => {
                // for (const name of Object.values(element.display)) {
                //     console.log(`Comparing ${name.toLocaleLowerCase()} to ${value}`);
                //     if (name.toLocaleLowerCase().search(value) !== -1) {
                //         return true;
                //     }
                // }
                if (element.display[settings.language].toLocaleLowerCase().search(searchText) !== -1) {
                    return true;
                }
                if (element.emoji === searchText) {
                    return true;
                }
                return false;
            });
        }
        const steamId = window.SteamAPI.getSteamId() ?? 'NO_STEAM_ID';
        if (currentFilter !== 'all') {
            filteredTemp = filteredTemp.filter((element) => {
                if (currentFilter === 'base') {
                    return element.recipes[0].base;
                } else if (currentFilter === 'firstDiscovered') {
                    let firstDiscovered = false;
                    for (const recipe of element.recipes) {
                        if (recipe.who_discovered === steamId || recipe.first) {
                            firstDiscovered = true;
                            break;
                        }
                    }
                    return firstDiscovered;
                }
                return true;
            });
        }
        return filteredTemp;
    };

    useEffect(() => {
        let filteredTemp = filterList(elements.map((x) => x), searchText, filterOptions[filter]);
        filteredTemp = sortList(filteredTemp.map((x) => x), sortByOptions[sortBy], sortAscending);
        setFilteredElements(filteredTemp);
    }, [searchText, filter]);

    const sortList = (list: RecipeElement[], sortByOption: string, sortAscending: boolean): RecipeElement[] => {
        let sortedTemp = list.sort((a, b) => {
            // const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];
            let aDepth = Infinity;
            let bDepth = Infinity;
            let aOrder = Infinity;
            let bOrder = Infinity;
            for (const recipe of a.recipes) {
                if (recipe.depth < aDepth)
                    aDepth = recipe.depth;
                if (recipe.order < aOrder)
                    aOrder = recipe.order;
            }
            for (const recipe of b.recipes) {
                if (recipe.depth < bDepth)
                    bDepth = recipe.depth;
                if (recipe.order < bOrder)
                    bOrder = recipe.order;
            }
            if (sortByOption === 'discovered') {
                // This one is inverted to go from most recent
                //console.log('Sorting discovered', aOrder < bOrder ? 1 : aOrder > bOrder ? -1 : 0, a.name, b.name, aOrder, bOrder);
                return aOrder < bOrder ? -1 : aOrder > bOrder ? 1 : 0;
            } else if (sortByOption === 'name') {
                //console.log('Sorting name', a.name < b.name ? -1 : a.name > b.name ? 1 : 0, a.name, b.name);
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            } else if (sortByOption === 'emoji') {
                //console.log('Sorting emoji', a.emoji < b.emoji ? -1 : a.emoji > b.emoji ? 1 : 0, a.emoji, b.emoji);
                return a.emoji < b.emoji ? -1 : a.emoji > b.emoji ? 1 : 0;
            } else if (sortByOption === 'depth') {
                //console.log('Sorting depth', aDepth < bDepth ? -1 : aDepth > bDepth ? 1 : 0, a.name, b.name, aDepth, bDepth);
                return aDepth < bDepth ? -1 : aDepth > bDepth ? 1 : 0;
            }
            return 0;
        });
        if (sortAscending) {
            sortedTemp = sortedTemp.reverse();
        }
        return sortedTemp;
    };

    useEffect(() => {
        const sortByOption = sortByOptions[sortBy];
        console.log('sorting by...', sortByOption, sortAscending);
        console.log('before sort', filteredElements);
        const sortedTemp = sortList(filteredElements.map((x) => x), sortByOption, sortAscending);
        console.log('after sort', sortedTemp);
        setFilteredElements(sortedTemp);
    }, [sortBy, sortAscending]);

    const onSearchType: ChangeEventHandler<HTMLInputElement> = (e) => {
        setSearchText(e.target.value.toLocaleLowerCase());
    };

    useEffect(() => {
        let filteredTemp = filterList(elements.map((x) => x), searchText, filterOptions[filter]);
        filteredTemp = sortList(filteredTemp.map((x) => x), sortByOptions[sortBy], sortAscending);
        setFilteredElements(filteredTemp);
    }, [elements]);

    const onFilterClick: MouseEventHandler<HTMLDivElement> = () => {
        let newFilter = filter + 1;
        if (newFilter >= filterOptions.length) {
            newFilter = 0;
        }
        setFilter(newFilter);
    };

    const onSortClick: MouseEventHandler<HTMLDivElement> = () => {
        let newSortBy = sortBy + 1;
        if (newSortBy >= sortByOptions.length) {
            newSortBy = 0;
        }
        setSortBy(newSortBy);
    };

    const onDirectionClick: MouseEventHandler<HTMLDivElement> = () => {
        setSortAscending(!sortAscending);
    };
    
    return (
        <div className='side-container vh-100 d-flex flex-column position-sticky z-side'>
            <div ref={drop} className={`${isOver ? 'is-over' : ''} overflow-y-scroll overflow-x-hidden h-100`}>
                {filteredElements.filter((item) => {
                    let discovered = false;
                    for (const recipe of item.recipes) {
                        if (recipe.discovered) {
                            discovered = true;
                            break;
                        }
                    }
                    return discovered;
                }).map((element) => {
                    //console.log(element.name, element);
                    return (<SideElement key={element.name} element={element} removeBox={removeBox} />);
                })}
            </div>
            <div className='footer mt-auto'>
                <div className='row mx-0'>
                    <div className='col-5 d-grid gap-0 px-0'>
                        <div
                            className='btn btn-no-radius btn-left-hover'
                            onClick={onFilterClick}>
                            <IoFilterOutline/> {getFromStore(filterOptions[filter], settings.language)}
                        </div>
                    </div>
                    <div className='col-2 d-grid gap-0 px-0'>
                        <div
                            className='btn btn-no-radius btn-left-hover'
                            onClick={onDirectionClick}>
                            { sortAscending ? <IoArrowUp/> : <IoArrowDown/> }
                        </div>
                    </div>
                    <div className='col-5 d-grid gap-0 px-0'>
                        <div className='btn btn-no-radius btn-right-hover' onClick={onSortClick}>
                            {getFromStore('sortBy', settings.language)} {getFromStore(sortByOptions[sortBy], settings.language)}
                        </div>
                    </div>
                </div>
                <div className='row mx-0'>
                    <div className="px-2 mb-3 mt-1">
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            value={searchText}
                            onChange={onSearchType}
                            placeholder={getFromStore('search', settings.language).replace('{0}', `${elements.length}`)}/>
                    </div>
                </div>
            </div>
        </div>
    );
};