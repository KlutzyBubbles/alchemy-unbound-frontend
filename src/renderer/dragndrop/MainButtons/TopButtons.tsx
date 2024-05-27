import { useContext, type FC } from 'react';
import { IoMenuOutline } from 'react-icons/io5';
import { ModalOption } from '../../Container';
import { CreditInfo } from './Credits';
import { getFromStore } from '../../language';
import { SettingsContext } from '../../providers/SettingsProvider';
import { InfoContext } from '../../providers/InfoProvider';

export interface TopButtonProps {
    openModal: (option: ModalOption) => void
    credits: number
}

export const TopButtons: FC<TopButtonProps> = ({
    openModal,
    credits
}) => {
    const { settings } = useContext(SettingsContext);
    const { fileVersions } = useContext(InfoContext);

    return (
        <div className='z-mainButtons d-flex'>
            <div
                className='btn btn-no-outline float-start mb-2 fs-1 d-flex flex-shrink-1 p-2 z-mainButtons'
                // onClick={openMenu}
                data-bs-toggle="offcanvas" data-bs-target="#sideMenu"><IoMenuOutline /></div>
            <div className='flex-grow-1 text-secondary mt-3'>
                <h4 className='text-center'>{getFromStore(`saves.${fileVersions.databaseInfo.type}`, settings.language)}</h4>
            </div>
            <CreditInfo openModal={openModal} credits={credits}/>
        </div>
    );
};
