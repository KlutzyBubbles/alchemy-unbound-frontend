import { type FC, useContext, ReactNode, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import { SoundContext } from '../providers/SoundProvider';
import { InfoContext } from '../providers/InfoProvider';

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

    return (
        <Modal show={show} onHide={onCancel} centered size="xl" data-bs-theme={settings.theme} style={{
            background: '#000000dd'
        }}>
            <Modal.Header closeButton data-bs-theme={settings.theme}>
                <Modal.Title>{getFromStore('confirm', settings.language)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onCancel} className='me-auto'>
                    {getFromStore('cancel', settings.language)}
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    {getFromStore('confirm', settings.language)}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
