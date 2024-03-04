import { useState, type ChangeEventHandler, type FC, useEffect, useContext } from 'react';
import { useDrop } from 'react-dnd';
import { RecipeElement } from '../common/types';
import { SideElement } from './SideElement';
import { DragItem, ItemTypes } from './types';
import { getXY } from './Utils';
import { SettingsContext } from './SettingsProvider';
import { motion } from 'framer-motion';
import { IoInformationCircleOutline, IoSettingsOutline } from 'react-icons/io5';

export interface ContainerProps {
  // refreshRecipes: () => void
  // hideSourceOnDrag: boolean
  removeBox: (id: string) => void,
  moveBox: (id: string, left: number, top: number) => Promise<void>
  elements: RecipeElement[],
}

export const SideContainer: FC<ContainerProps> = ({
    removeBox,
    moveBox,
    elements
}) => {
    const [filteredElements, setFilteredElements] = useState<RecipeElement[]>(elements);
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

    const onSearchType: ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.value.toLocaleLowerCase();
        if (value === '') {
            setFilteredElements(elements);
        } else {
            setFilteredElements(elements.filter((element) => {
                // for (const name of Object.values(element.display)) {
                //     console.log(`Comparing ${name.toLocaleLowerCase()} to ${value}`);
                //     if (name.toLocaleLowerCase().search(value) !== -1) {
                //         return true;
                //     }
                // }
                if (element.display[settings.language].toLocaleLowerCase().search(value) !== -1) {
                    return true;
                }
                if (element.emoji === value) {
                    return true;
                }
                return false;
            }));
        }
    };

    useEffect(() => {
        setFilteredElements(elements);
    }, [elements]);

    //style={styles}>
    return (
        <div className='vh-100 d-flex flex-column position-sticky z-side'>
            <div ref={drop} style={{ background: isOver ? 'red' : 'white' }} className='overflow-y-scroll overflow-x-hidden h-100'>
                {filteredElements.map((element) => {
                    return (<SideElement key={element.name} element={element} removeBox={removeBox} />);
                })}
            </div>
            <div className='footer mt-auto'>
                <div className='row mx-0'>
                    <div className='col-6 d-grid gap-0 px-0'>
                        <motion.div
                            className='btn btn-no-radius btn-primary'>
                            <IoSettingsOutline/>
                        </motion.div>
                    </div>
                    <div className='col-6 d-grid gap-0 px-0'>
                        <div className='btn btn-no-radius btn-primary' onClick={() => console.log('click')}><IoInformationCircleOutline /></div>
                    </div>
                </div>
                <div className='row mx-0'>
                    <div className="px-2 mb-3 mt-1">
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            onChange={onSearchType}
                            placeholder={`Search ${elements.length} elements`}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
