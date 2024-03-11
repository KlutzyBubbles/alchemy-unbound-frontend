import { type FC, useContext, ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';

export interface ConfirmModalProps {
  show: boolean,
  onConfirm: () => void,
  onCancel: () => void,
  //dark: boolean,
  children: ReactNode
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
    show,
    onConfirm,
    onCancel,
    //dark,
    children
}) => {
    const { settings } = useContext(SettingsContext);
    return (
        <Modal show={show} onHide={onCancel} centered size="xl" data-bs-theme={settings.dark ? 'dark' : 'light'} style={{
            background: '#000000dd'
        }}>
            <Modal.Header closeButton data-bs-theme={settings.dark ? 'dark' : 'light'}>
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
