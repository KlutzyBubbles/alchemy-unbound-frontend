import { useState, type ChangeEventHandler, type FC, useContext, MouseEventHandler, useRef, Fragment, useEffect } from 'react';
import { RecipeElement } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import { IoArrowDown, IoArrowUp, IoFilterOutline } from 'react-icons/io5';
import { getFromStore } from '../language';
import logger from 'electron-log/renderer';
import { SideList } from './SideList';
import { ModalOption } from '../Container';
import { InfoContext } from '../providers/InfoProvider';

export interface ContainerProps {
  removeBox: (id: string) => void,
  addBox: (element: RecipeElement, combining: boolean) => Promise<string>
  moveBox: (id: string, left: number, top: number) => Promise<void>
  refreshRecipes: () => Promise<void>
  openModal: (option: ModalOption, onClose?: () => void) => void
  sizeChange: number,
  elements: RecipeElement[],
}

const sortByOptions = ['discovered', 'name', 'emoji', 'depth'];

const filterOptions = ['all', 'base', 'firstDiscovered'];

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    moveBox,
    addBox,
    refreshRecipes,
    openModal,
    sizeChange,
    elements                     
}) => {
    const timeout = useRef<NodeJS.Timeout>(undefined);
    const [sortBy, setSortBy] = useState<number>(0);
    const [sortAscending, setSortAscending] = useState<boolean>(false);
    const [filter, setFilter] = useState<number>(0);
    const [searchText, setSearchText] = useState<string>('');
    const [searchTextFinal, setSearchTextFinal] = useState<string>('');
    const { settings } = useContext(SettingsContext);
    const { fileVersions } = useContext(InfoContext);

    useEffect(() => {
        logger.warn('STARTTTING', elements.length);
        // logger.warn(elements);
    });

    const onSearchType: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (['send help', 'help me', 'please help', 'halp'].includes(e.target.value.toLocaleLowerCase())) {
            logger.debug('Activating send help achievement');
            window.SteamAPI.activateAchievement('help');
        }
        setSearchText(e.target.value.toLocaleLowerCase());
        if (timeout.current !== undefined) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            const value = e.target.value.toLocaleLowerCase();
            setSearchTextFinal(value);
        }, 500);
    };

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
            {fileVersions.databaseInfo.type === 'custom' ? <div className='btn btn-success display-block m-2 py-0' onClick={() => openModal('addItem', () => refreshRecipes())}><h2>+</h2></div> : <Fragment></Fragment>}
            <SideList
                removeBox={removeBox}
                addBox={addBox}
                moveBox={moveBox}
                elements={elements}
                filter={filter} 
                searchText={searchTextFinal}
                sortBy={sortBy}
                sortAscending={sortAscending}
                sizeChange={sizeChange}
                performance={settings.performance}/>
            <div className='footer mt-auto'>
                <div className='row mx-0'>
                    <div className='col-5 d-grid gap-0 px-0'>
                        <div
                            className='btn btn-no-radius btn-left-hover px-1'
                            onClick={onFilterClick}>
                            <IoFilterOutline/> {getFromStore(`side.${filterOptions[filter]}`, settings.language)}
                        </div>
                    </div>
                    <div className='col-2 d-grid gap-0 px-0'>
                        <div
                            className='btn btn-no-radius btn-left-hover px-1'
                            onClick={onDirectionClick}>
                            { sortAscending ? <IoArrowUp/> : <IoArrowDown/> }
                        </div>
                    </div>
                    <div className='col-5 d-grid gap-0 px-0'>
                        <div 
                            className='btn btn-no-radius btn-right-hover px-1'
                            onClick={onSortClick}>
                            {getFromStore('side.sortBy', settings.language)} {getFromStore(`side.${sortByOptions[sortBy]}`, settings.language)}
                        </div>
                    </div>
                </div>
                <div className='row mx-0'>
                    <div className="p-0 m-0">
                        <input
                            type="search"
                            className="form-control form-control-lg override-focus border-start-0 border-end-0 border-bottom-0 rounded-0"
                            value={searchText}
                            onChange={onSearchType}
                            placeholder={getFromStore('side.search', settings.language).replace('{0}', `${elements.filter((item) => {
                                for (const recipe of item.recipes) {
                                    if (recipe.discovered)
                                        return true;
                                }
                                return false;
                            }).length}`)}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
