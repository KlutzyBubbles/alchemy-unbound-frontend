import { type FC, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { getFromStore } from '../language';


export interface StoreModalProps {
  show: boolean
  handleHide: () => void
}

export const StoreModal: FC<StoreModalProps> = ({
    show,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);

    const testButton = async () => {
        try {
            const temp = await window.ServerAPI.initTransaction('fillHints');
            logger.info('Test button', temp);
        } catch (error) {
            logger.error('Test button error', error);
        }
    };

    return (
        <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.theme}>
            <Modal.Header closeButton>
                <Modal.Title>{getFromStore('info.store.title', settings.language)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Some store stuff</p>
            </Modal.Body>
            <Modal.Footer>
                <div
                    className='btn btn-sm btn-advanced float-start me-auto mb-2 fs-2 d-flex px-2 py-0'
                    onClick={testButton}>
                    <h1 className='mx-2 my-0'><HiOutlineWrenchScrewdriver /><span className='fs-3 ms-3'>Click Me</span></h1>
                </div>
            </Modal.Footer>
        </Modal>
    );
};
