import type { FC } from 'react';
import { useContext } from 'react';
import { ModalOption } from '../../Container';
import { SettingsContext } from '../../providers/SettingsProvider';
import { getFromStore } from '../../language';
import { InfoContext } from '../../providers/InfoProvider';

export interface CreditInfoProps {
    openModal: (option: ModalOption) => void
    credits: number
}

export const CreditInfo: FC<CreditInfoProps> = ({
    openModal,
    credits,
}) => {
    const { settings } = useContext(SettingsContext);
    const { fileVersions } = useContext(InfoContext);

    const creditClick = () => {
        openModal('store');
    };

    // btn btn-info float-end mb-2 fs-2 d-flex p-2
    return (
        <div
            className='btn btn-no-outline float-end mb-2 me-2 d-flex flex-shrink-1 p-2 z-mainButtons'
            onClick={creditClick}>
            <div className='fs-3'>
                {fileVersions.databaseInfo.type !== 'custom' ? '∞': <span className={credits <= 0 ? 'text-danger' : ''}>{credits}</span>} {getFromStore('creditsLeft', settings.language)}
            </div>
        </div>
    );
};
