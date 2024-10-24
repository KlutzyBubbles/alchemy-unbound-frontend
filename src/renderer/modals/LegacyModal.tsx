import { type FC, useContext } from 'react';
import { SettingsContext } from '../providers/SettingsProvider';
import { ModalWrapper } from './ModalWrapper';
import { getFromStore } from '../language';

export interface NoServerModalProps {
  show: boolean
  handleHide: () => void
}

export const NoServerModal: FC<NoServerModalProps> = ({
    show,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);
    return <ModalWrapper show={show} title={'dialog.noServer'} handleHide={handleHide}>
        <p>{getFromStore('dialog.noServerA', settings.language)}</p>
        <p>{getFromStore('dialog.noServerB', settings.language)}</p>
    </ModalWrapper>;
};
