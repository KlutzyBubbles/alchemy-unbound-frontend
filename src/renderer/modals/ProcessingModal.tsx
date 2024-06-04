import { type FC, useContext, ReactNode, } from 'react';
import { Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';

export interface ProcessingModalProps {
  show: boolean,
  onCancel: () => void,
  children: ReactNode
}

export const ProcessingModal: FC<ProcessingModalProps> = ({
    show,
    onCancel,
    children
}) => {
    const { settings } = useContext(SettingsContext);

    return (
        <Modal show={show} onHide={onCancel} centered size="xl" data-bs-theme={settings.theme} style={{
            background: '#000000dd'
        }}>
            <Modal.Header closeButton data-bs-theme={settings.theme}>
                <Modal.Title>{getFromStore('dialog.processingTitle', settings.language)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
        </Modal>
    );
};
