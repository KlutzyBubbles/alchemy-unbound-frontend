import { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { IoAlertCircleOutline, IoCartOutline, IoCheckmarkOutline, IoDownloadOutline, IoExitOutline, IoPulseOutline, IoSaveOutline, IoSettingsOutline, IoStatsChartOutline, IoSwapHorizontalOutline } from 'react-icons/io5';
import { motion, useAnimation } from 'framer-motion';
import { ModalOption } from '../../Container';
import { BsGithub, BsDiscord } from 'react-icons/bs';
import { getFromStore } from '../../language';
import { SoundContext } from '../../providers/SoundProvider';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { UpdateContext } from '../../providers/UpdateProvider';
import { DatabaseType } from '../../../common/types/saveFormat';
import { MenuModalItem } from './MenuModalItem';
import { Recipe } from './Recipe';
import { closeCanvas } from '../../utils/dom';
import { InfoContext } from '../../providers/InfoProvider';
import { ProcessingModal } from '../../modals/ProcessingModal';
import { LoadingContext } from '../../providers/LoadingProvider';

export interface SideMenuProps {
    openModal: (option: ModalOption) => void
}

export const SideMenu: FC<SideMenuProps> = ({
    openModal
}) => {
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);
    const { setShouldUpdate } = useContext(UpdateContext);
    const { fileVersions } = useContext(InfoContext);
    const { setLoadingVisible } = useContext(LoadingContext);
    const [errorText, setErrorText] = useState<string>('');
    const [switchOpen, setSwitchOpen] = useState<boolean>(false);
    const [showIOProcessing, setShowIOProcessing] = useState<boolean>(false);
    const [processingText, setProcessingText] = useState<string>('dialog.processing');
    const [cancelled, setCancelled] = useState<boolean>(false);
    const [successText, setSuccessText] = useState<string>('');
    const [importOrExport, setImportOrExport] = useState<string>('');
    const ioTimerRef = useRef<NodeJS.Timeout>(undefined);
    
    useEffect(() => {
        return () => {
            if (ioTimerRef.current !== undefined) {
                clearTimeout(ioTimerRef.current);
            }
        };
    }, []);

    const onSettingsMouseEnter = () => {
        settingsControls.start('start');
        playSound('click2', 0.5);
    };

    const onSettingsMouseLeave = () => {
        settingsControls.start('reset');
    };

    const onMouseOver = () => {
        playSound('click2', 0.5);
    };

    const exportFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            setImportOrExport('export');
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

    const importFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            setImportOrExport('import');
            setShowIOProcessing(true);
            if (!cancelled) {
                setProcessingText('dialog.importing');
                const result = await window.ImportExportAPI.import();
                setShowIOProcessing(false);
                setCancelled(false);
                if (result) {
                    closeCanvas();
                    setSuccessText(getFromStore('settings.imported', settings.language));
                    setShouldUpdate(true);
                    newTimer();
                }
            } else {
                setProcessingText('dialog.alreadyProcessing');
            }
        } catch (e) {
            logger.error('Failed to import file', e);
            setShowIOProcessing(false);
            setCancelled(false);
            setErrorText(e.message);
            newTimer();
        }
    };

    const onCancelBefore = () => {
        if (showIOProcessing) {
            setCancelled(true);
            setShowIOProcessing(false);
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
        setImportOrExport('');
    };

    const settingsVariants = {
        start: () => ({
            rotate: [0, 90],
            transition: {
                duration: 0.2,
                repeat: 0,
                ease: 'easeInOut',
                repeatDelay: 0.5
            }
        }),
        reset: {
            rotate: [90, 0],
            transition: {
                duration: 0.2,
                repeat: 0,
                ease: 'easeInOut'
            }
        }
    };
  
    const settingsControls = useAnimation();

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

    const importIcon = () => {
        const icon = (
            <div
                className='float-end fs-2 d-flex p-2'>
                <IoDownloadOutline />
            </div>
        );
        if (importOrExport === '' || importOrExport !== 'import') {
            return icon;
        }
        if (errorText !== '') {
            return errorIcon;
        }
        if (successText !== '') {
            return successIcon;
        }
        return icon;
    };

    const exportIcon = () => {
        const icon = (
            <div
                className='float-end fs-2 d-flex p-2'>
                <IoSaveOutline />
            </div>
        );
        if (importOrExport === '' || importOrExport !== 'export') {
            return icon;
        }
        if (errorText !== '') {
            return errorIcon;
        }
        if (successText !== '') {
            return successIcon;
        }
        return icon;
    };

    const optionClick = () => {
        closeCanvas();
        openModal('settings');
    };

    const switchClick = async () => {
        setSwitchOpen(!switchOpen);
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

    return (
        <Fragment>
            <ProcessingModal onCancel={onCancelBefore} show={showIOProcessing}>
                <p><span className="spinner-grow spinner-grow-sm me-2" aria-hidden="true"></span>{getFromStore(processingText, settings.language)}</p>
            </ProcessingModal>
            <div className="offcanvas offcanvas-start side-menu" tabIndex={-1} id="sideMenu" aria-labelledby="sideMenuLabel" data-bs-keyboard="false">
                <div className="offcanvas-header pb-0">
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body p-0">
                    <img src="image://logo.png" className="img-fluid px-4 user-select-none" alt="Logo"/>
                    <ul className="navbar-nav justify-content-between">
                        <div className='my-3'/>
                        <li className="nav-item btn btn-no-radius btn-left-hover"
                            onMouseEnter={onSettingsMouseEnter}
                            onMouseLeave={onSettingsMouseLeave}
                            onClick={optionClick}>
                            <div className="nav-link d-flex">
                                <div className='mx-auto pt-half'>
                                    <h2 className='m-0'>{getFromStore('menu.options', settings.language)}</h2>
                                </div>
                                <motion.div
                                    className='float-end fs-2 d-flex p-2'
                                    variants={settingsVariants}
                                    animate={settingsControls}>
                                    <IoSettingsOutline/>
                                </motion.div>
                            </div>
                        </li>
                        <MenuModalItem
                            openModal={openModal}
                            itemId='stats'
                            icon={<IoStatsChartOutline />}/>
                        <MenuModalItem
                            openModal={openModal}
                            itemId='store'
                            icon={<IoCartOutline />}/>
                        <div className='my-3'/>
                        <li className="nav-item btn btn-no-radius btn-left-hover"
                            onMouseEnter={onMouseOver}
                            onClick={switchClick}
                            data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                            <div className="nav-link d-flex">
                                <div className='mx-auto pt-half'>
                                    <h2 className='m-0'>{getFromStore('menu.switch', settings.language)}</h2>
                                </div>
                                <div
                                    className='float-end fs-2 d-flex p-2'>
                                    <IoSwapHorizontalOutline />
                                </div>
                            </div>
                        </li>
                        <div className="collapse" id="collapseExample">
                            <div>
                                <div className='row mx-0'>
                                    <div className="col-6 nav-item btn btn-no-radius btn-left-hover"
                                        onMouseEnter={onMouseOver}
                                        onClick={() => switchProfile('base')}>
                                        <div className="nav-link d-flex">
                                            <div className='mx-auto pt-half'>
                                                <h2 className='m-0'>{getFromStore('saves.baseButton', settings.language)}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 nav-item btn btn-no-radius btn-right-hover"
                                        onMouseEnter={onMouseOver}
                                        onClick={() => switchProfile('custom')}>
                                        <div className="nav-link d-flex">
                                            <div className='mx-auto pt-half'>
                                                <h2 className='m-0'>{getFromStore('saves.customButton', settings.language)}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row mx-0 mb-3'>
                                    <div className="col-6 nav-item btn btn-no-radius btn-left-hover"
                                        onMouseEnter={onMouseOver}
                                        onClick={() => switchProfile('daily')}>
                                        <div className="nav-link d-flex">
                                            <div className='mx-auto pt-half'>
                                                <h2 className='m-0'>{getFromStore('saves.dailyButton', settings.language)}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 nav-item btn btn-no-radius btn-right-hover"
                                        onMouseEnter={onMouseOver}
                                        onClick={() => switchProfile('weekly')}>
                                        <div className="nav-link d-flex">
                                            <div className='mx-auto pt-half'>
                                                <h2 className='m-0'>{getFromStore('saves.weeklyButton', settings.language)}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {fileVersions.databaseInfo.type === 'base' ? <Fragment>
                            <li className="nav-item btn btn-no-radius btn-left-hover"
                                onMouseEnter={onMouseOver}
                                onClick={exportFile}>
                                <div className="nav-link d-flex">
                                    <div className='mx-auto pt-half'>
                                        <h2 className='m-0'>{getFromStore('settings.buttons.export', settings.language)}</h2>
                                    </div>
                                    {exportIcon()}
                                </div>
                            </li>
                            <li className="nav-item btn btn-no-radius btn-left-hover"
                                onMouseEnter={onMouseOver}
                                onClick={importFile}>
                                <div className="nav-link d-flex">
                                    <div className='mx-auto pt-half'>
                                        <h2 className='m-0'>{getFromStore('settings.buttons.import', settings.language)}</h2>
                                    </div>
                                    {importIcon()}
                                </div>
                            </li>
                        </Fragment> : <Fragment />}
                    </ul>
                </div>
                <div className='footer mt-auto'>
                    <div className='row'>
                        <Recipe
                            className='col-12 d-flex mt-2 mx-2 justify-content-center'
                            recipe={{
                                a: {
                                    name: 'game',
                                    emoji: '🎮'
                                },
                                b: {
                                    name: 'hacker',
                                    emoji: '👨‍💻'
                                },
                                result: {
                                    name: 'klutzybubbles',
                                    emoji: '🤹'
                                }
                            }}/>
                        <Recipe
                            className='col-12 d-flex mt-2 mx-2 justify-content-center'
                            recipe={{
                                a: {
                                    name: 'game',
                                    emoji: '🎮'
                                },
                                b: {
                                    name: 'art',
                                    emoji: '🎨'
                                },
                                result: {
                                    name: 'piney',
                                    emoji: '🌲'
                                }
                            }}/>
                    </div>
                    <div
                        className='btn btn-sm btn-danger float-start my-3 ms-3 fs-2 d-flex p-2 me-2'
                        onClick={() => window.GenericAPI.quit()}>
                        <h2 className='mx-2'><IoExitOutline /></h2>
                    </div>
                    <a
                        href="https://discord.com/invite/wBcwzxTTXN"
                        target="_blank"
                        className='btn btn-sm btn-discord float-end my-3 me-3 fs-2 d-flex p-2 me-2'
                        rel="noreferrer">
                        <h2 className='mx-2'><BsDiscord /></h2>
                    </a>
                    <a
                        href="https://github.com/KlutzyBubbles/alchemy-unbound"
                        target="_blank"
                        className='btn btn-sm btn-github float-end my-3 me-2 fs-2 d-flex p-2'
                        rel="noreferrer">
                        <h2 className='mx-2'><BsGithub /></h2>
                    </a>
                    <a
                        href="https://status.alchemyunbound.net"
                        target="_blank"
                        className='btn btn-sm btn-status float-end my-3 me-2 fs-2 d-flex p-2'
                        rel="noreferrer">
                        <h2 className='mx-2'><IoPulseOutline /></h2>
                    </a>
                </div>
            </div>
        </Fragment>
    );
};

/*

                    <Collapse in={switchOpen}>
                        <Fragment>
                            <div>
                                <div className='row'>
                                    <div className="col-6 nav-item btn btn-no-radius btn-left-hover"
                                        onMouseEnter={onMouseOver}
                                        onClick={switchClick}>
                                        <div className="nav-link d-flex">
                                            <div className='mx-auto pt-half'>
                                                <h2 className='m-0'>{getFromStore('menu.switch', settings.language)}</h2>
                                            </div>
                                            <div
                                                className='float-end fs-2 d-flex p-2'>
                                                <IoSwapHorizontalOutline />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    </Collapse>
*/
