import { type FC, useContext, ReactNode, useEffect, Fragment } from 'react';
import { Button } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import { SoundContext } from '../providers/SoundProvider';
import { InfoContext } from '../providers/InfoProvider';
import { ModalWrapper } from './ModalWrapper';

export interface ConfirmModalProps {
  show: boolean,
  onConfirm: () => void,
  onCancel: () => void,
  children: ReactNode
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
    show,
    onConfirm,
    onCancel,
    children
}) => {
    const { playSound } = useContext(SoundContext);
    const { hasSupporterTheme } = useContext(InfoContext);
    const { settings } = useContext(SettingsContext);
    
    useEffect(() => {
        if (show) {
            if (hasSupporterTheme && settings.theme === 'supporter') {
                playSound('reset');
            }
        }
    }, [show]);

    const footerContent = <Fragment>
        <Button variant="danger" onClick={onCancel} className='me-auto'>
            {getFromStore('dialog.cancel', settings.language)}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
            {getFromStore('dialog.confirm', settings.language)}
        </Button>
    </Fragment>;

    return <ModalWrapper show={show} title={'dialog.confirm'} footerContent={footerContent} handleHide={onCancel} style={{
        background: '#000000dd'
    }}>
        {children}
    </ModalWrapper>;
};
