import { FC, ReactElement, useContext } from 'react';
import { ModalOption } from '../../Container';
import { getFromStore } from '../../language';
import { SoundContext } from '../../providers/SoundProvider';
import { SettingsContext } from '../../providers/SettingsProvider';
import * as bootstrap from 'bootstrap';

export interface MenuModalItemProps {
    openModal: (option: ModalOption) => void
    itemId: ModalOption
    icon: ReactElement
}

export const MenuModalItem: FC<MenuModalItemProps> = ({
    openModal,
    itemId,
    icon
}) => {
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);

    const onMouseOver = () => {
        playSound('click2', 0.5);
    };

    const closeCanvas = () => {
        const myOffCanvas = document.getElementById('sideMenu');
        const openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
        openedCanvas?.hide();
    };

    const itemClick = () => {
        closeCanvas();
        openModal(itemId);
    };

    return (
        <li className="nav-item btn btn-no-radius btn-left-hover"
            onMouseEnter={onMouseOver}
            onClick={itemClick}>
            <div className="nav-link d-flex">
                <div className='mx-auto pt-half'>
                    <h2 className='m-0'>{getFromStore(`menu.${itemId}`, settings.language)}</h2>
                </div>
                <div
                    className='float-end fs-2 d-flex p-2'>
                    {icon}
                </div>
            </div>
        </li>
    );
};
