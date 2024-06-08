import { useState, type FC, useEffect, useContext, Fragment, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import logger from 'electron-log/renderer';
import { ModalWrapper } from './ModalWrapper';
import { ProcessingModal } from './ProcessingModal';
import { IoAlertCircleOutline, IoCheckmarkOutline, IoSaveOutline } from 'react-icons/io5';
import { ConfirmModal } from './ConfirmDialog';
import { UpdateContext } from '../providers/UpdateProvider';
import * as bootstrap from 'bootstrap';
import { LoadingContext } from '../providers/LoadingProvider';
import { closeCanvas } from '../utils/dom';
import { DatabaseType } from '../../common/types/saveFormat';
import { InfoContext } from '../providers/InfoProvider';

export interface SaveResetModalProps {
  show: boolean
  handleHide: () => void
}

export const SaveResetModal: FC<SaveResetModalProps> = ({
    show,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);
    const [errorText, setErrorText] = useState<string>('');
    const [showIOProcessing, setShowIOProcessing] = useState<boolean>(false);
    const [processingText, setProcessingText] = useState<string>('dialog.processing');
    const [cancelled, setCancelled] = useState<boolean>(false);
    const [successText, setSuccessText] = useState<string>('');
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
    const ioTimerRef = useRef<NodeJS.Timeout>(undefined);
    const { setShouldUpdate } = useContext(UpdateContext);
    const { setLoadingVisible } = useContext(LoadingContext);
    const { fileVersions } = useContext(InfoContext);

    const errorIcon = (
        <div
            className='float-end fs-2 d-flex p-2 text-danger'>
            <IoAlertCircleOutline />
        </div>
    );

    const successIcon = (
        <div
            className='float-end fs-2 d-flex p-2 text-success'>
            <IoCheckmarkOutline />
        </div>
    );

    useEffect(() => {
        return () => {
            if (ioTimerRef.current !== undefined) {
                clearTimeout(ioTimerRef.current);
            }
        };
    }, []);

    const exportFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            setShowIOProcessing(true);
            if (!cancelled) {
                setProcessingText('dialog.exporting');
                const result = await window.ImportExportAPI.export();
                setShowIOProcessing(false);
                setCancelled(false);
                if (result) {
                    setSuccessText(getFromStore('settings.exported', settings.language));
                    newTimer();
                }
            } else {
                setProcessingText('dialog.alreadyProcessing');
            }
        } catch (e) {
            logger.error('Failed to export file', e);
            setShowIOProcessing(false);
            setCancelled(false);
            setErrorText(e.message);
            newTimer();
        }
    };
    
    const newTimer = () => {
        if (ioTimerRef.current !== undefined) {
            clearTimeout(ioTimerRef.current);
        }
        const timer = setTimeout(clearText, 5000);
        ioTimerRef.current = timer;
    };
    
    const clearText = () => {
        setErrorText('');
        setSuccessText('');
    };

    const exportIcon = () => {
        const icon = (
            <div
                className='float-end fs-2 d-flex p-2'>
                <IoSaveOutline />
            </div>
        );
        if (errorText !== '') {
            return errorIcon;
        }
        if (successText !== '') {
            return successIcon;
        }
        return icon;
    };
    
    const onCancelBefore = () => {
        if (showIOProcessing) {
            setCancelled(true);
            setShowIOProcessing(false);
        }
    };

    const onResetConfirm = async () => {
        setShowResetConfirm(false);
        handleHide();
        try {
            await window.ImportExportAPI.reset();
            const myOffCanvas = document.getElementById('sideMenu');
            const openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
            openedCanvas?.hide();
            setShouldUpdate(true);
        } catch (e) {
            logger.error('Failed resetting data', e);
        }
    };

    const onResetCancel = () => {
        setShowResetConfirm(false);
    };

    const switchProfile = async (type: DatabaseType) => {
        closeCanvas();
        let newDb: string = type;
        if (type === 'base') {
            newDb = 'db';
        }
        try {
            logger.silly('Setting loading visible');
            setLoadingVisible(true);
            await window.ProfileAPI.switchProfile(newDb, { type });
            logger.silly('Setting should update');
            setShouldUpdate(true);
            setLoadingVisible(false);
        } catch (error) {
            console.error('switch profile renderer', error);
            logger.silly('Setting loading NOT visible');
            setLoadingVisible(false);
        }
    };

    return <ModalWrapper show={show} title={'dialog.v2migrate'} handleHide={handleHide}>
        <Fragment>
            <ConfirmModal onCancel={onResetCancel} onConfirm={onResetConfirm} show={showResetConfirm}>
                <h5>{getFromStore('settings.resetTitle', settings.language)}</h5>
                <p>{getFromStore('settings.resetText', settings.language)}</p>
            </ConfirmModal>
            <ProcessingModal onCancel={onCancelBefore} show={showIOProcessing}>
                <p><span className="spinner-grow spinner-grow-sm me-2" aria-hidden="true"></span>{getFromStore(processingText, settings.language)}</p>
            </ProcessingModal>
            <div className='row mb-2'>
                <div className='col-12'>
                    <p className='text-center'>{getFromStore('dialog.migrateA', settings.language)}</p>
                    <p className='text-center'>{getFromStore('dialog.migrateB', settings.language)}</p>
                </div>
            </div>
            <div className='row mb-4'>
                <div className='col-4 d-grid'>
                    <Button size='lg' variant="outline-primary" disabled={fileVersions.databaseInfo.type === 'base'} onClick={() => switchProfile('base')} className='d-flex'>
                        <div className='mx-auto pt-half'>
                            <h2 className='m-0'>{getFromStore('dialog.switchTo', settings.language)} {getFromStore('saves.baseButton', settings.language)}</h2>
                        </div>
                    </Button>
                </div>
                <div className='col-4 d-grid'>
                    <Button size='lg' variant="outline-primary" disabled={fileVersions.databaseInfo.type !== 'base'} onClick={exportFile} className='d-flex'>
                        <div className='mx-auto pt-half'>
                            <h2 className='m-0'>{getFromStore('settings.buttons.export', settings.language)}</h2>
                        </div>
                        {exportIcon()}
                    </Button>
                </div>
                <div className='col-4 d-grid'>
                    <Button size='lg' variant='outline-danger' onClick={() => setShowResetConfirm(true)} className='d-flex'>
                        <div className='mx-auto pt-half'>
                            <h2 className='m-0'>{getFromStore('settings.buttons.reset', settings.language)}</h2>
                        </div>
                    </Button>
                </div>
            </div>
        </Fragment>
    </ModalWrapper>;
};
