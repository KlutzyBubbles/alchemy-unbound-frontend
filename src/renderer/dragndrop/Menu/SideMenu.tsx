import { FC, useContext, useEffect, useRef, useState } from 'react';
import { IoAlertCircleOutline, IoCartOutline, IoCheckmarkOutline, IoDownloadOutline, IoExitOutline, IoPulseOutline, IoSaveOutline, IoSettingsOutline, IoStatsChartOutline, IoSwapHorizontalOutline } from 'react-icons/io5';
import { motion, useAnimation } from 'framer-motion';
import { ModalOption } from '../../Container';
import { BsGithub, BsDiscord } from 'react-icons/bs';
import { getFromStore } from '../../language';
import { SoundContext } from '../../providers/SoundProvider';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { UpdateContext } from '../../providers/UpdateProvider';
import * as bootstrap from 'bootstrap';
import { DatabaseType } from 'src/common/types/saveFormat';
import { MenuModalItem } from './MenuModalItem';
import { Recipe } from './Recipe';

export interface SideMenuProps {
    openModal: (option: ModalOption) => void
}

export const SideMenu: FC<SideMenuProps> = ({
    openModal
}) => {
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);
    const { setShouldUpdate } = useContext(UpdateContext);
    const [errorText, setErrorText] = useState<string>('');
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
        playSound('click2', 0.8);
    };

    const onSettingsMouseLeave = () => {
        settingsControls.start('reset');
    };

    const onMouseOver = () => {
        playSound('click2', 0.8);
    };

    const exportFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            setImportOrExport('export');
            const result = await window.ImportExportAPI.export();
            if (result) {
                setSuccessText(getFromStore('settings.exported', settings.language));
                newTimer();
            }
        } catch (e) {
            logger.error('Failed to export file', e);
            setErrorText(e.message);
            newTimer();
        }
    };

    const importFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            setImportOrExport('import');
            const result = await window.ImportExportAPI.import();
            if (result) {
                setSuccessText(getFromStore('settings.imported', settings.language));
                setShouldUpdate(true);
                newTimer();
            }
        } catch (e) {
            logger.error('Failed to import file', e);
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
            className='float-end fs-2 d-flex p-2'>
            <IoAlertCircleOutline />
        </div>
    );

    const successIcon = (
        <div
            className='float-end fs-2 d-flex p-2'>
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

    const closeCanvas = () => {
        const myOffCanvas = document.getElementById('sideMenu');
        const openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
        openedCanvas?.hide();
    };

    const optionClick = () => {
        closeCanvas();
        openModal('settings');
    };

    const switchClick = async () => {
        closeCanvas();
        const versions = await window.GenericAPI.getFileVersions();
        let newType: DatabaseType = 'base';
        let newDb = 'db';
        if (versions.databaseInfo.type === 'base') {
            newType = 'custom';
            newDb = 'custom';
        }
        await window.ProfileAPI.switchProfile(newDb, { type: newType });
        setShouldUpdate(true);
    };

    return (
        <div className="offcanvas offcanvas-start side-menu" tabIndex={-1} id="sideMenu" aria-labelledby="sideMenuLabel">
            <div className="offcanvas-header pb-0">
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-0">
                <img src="image://logo.png" className="img-fluid px-4" alt="Logo"/>
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
                    </li>
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
    );
};
