import { useState, type FC, useEffect, useContext, Fragment, ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import { Alert, Button, Collapse, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { BackgroundType, BackgroundTypeList, ThemeType, ThemeTypeList, DEFAULT_SETTINGS, Language, languageDisplay, languages } from '../../common/settings';
import { getFromStore } from '../language';
import { LoadingContext } from '../providers/LoadingProvider';
import { IoRefreshOutline, IoVolumeHighOutline, IoVolumeLowOutline, IoVolumeMediumOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import { ConfirmModal } from './ConfirmDialog';
import logger from 'electron-log/renderer';
import { UpdateContext } from '../providers/UpdateProvider';
import { InfoContext } from '../providers/InfoProvider';
import { KEY_VALUES_TO_LEAVE } from '../types';

export interface SettingsModalProps {
  show: boolean
  handleHide: () => void
}

export const SettingsModal: FC<SettingsModalProps> = ({
    show,
    handleHide
}) => {
    const { settings, setSettings } = useContext(SettingsContext);
    const { loading } = useContext(LoadingContext);
    const [displays, setDisplays] = useState<Electron.Display[]>([]);
    const [currentDisplay, setCurrentDisplay] = useState<Electron.Display>(undefined);
    const [fullscreen, setFullscreen] = useState<boolean>(settings?.fullscreen ?? DEFAULT_SETTINGS.fullscreen);
    const [theme, setTheme] = useState<ThemeType>(settings?.theme ?? DEFAULT_SETTINGS.theme);
    const [offline, setOffline] = useState<boolean>(settings?.offline ?? DEFAULT_SETTINGS.offline);
    const [background, setBackground] = useState<BackgroundType>(settings?.background ?? DEFAULT_SETTINGS.background);
    const [language, setLanguage] = useState<Language>(settings?.language ?? DEFAULT_SETTINGS.language);
    const [volume, setVolume] = useState<number>(settings?.volume ?? DEFAULT_SETTINGS.volume);
    const [muted, setMuted] = useState<boolean>(settings?.muted ?? DEFAULT_SETTINGS.muted);
    const [fps, setFPS] = useState<number>(settings?.fps ?? DEFAULT_SETTINGS.fps);
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>('');
    const [successText, setSuccessText] = useState<string>('');
    const [lockKeybind, setLockKeybind] = useState<string>(settings?.keybinds.lock ?? DEFAULT_SETTINGS.keybinds.lock);
    const [copyKeybind, setCopyKeybind] = useState<string>(settings?.keybinds.copy ?? DEFAULT_SETTINGS.keybinds.copy);
    const [removeKeybind, setRemoveKeybind] = useState<string>(settings?.keybinds.remove ?? DEFAULT_SETTINGS.keybinds.remove);
    const { setShouldUpdate } = useContext(UpdateContext);
    const { hasSupporterTheme } = useContext(InfoContext);

    useEffect(() => {
        (async() => {
            try {
                setDisplays(await window.DisplayAPI.getDisplays());
                setCurrentDisplay(await window.DisplayAPI.getCurrentDisplay());
            } catch (e) {
                logger.error('Failed to load settings (oops)', e);
            }
        })();
    }, []);

    useEffect(() => {
        (async() => {
            if (loading === false) {
                setFullscreen(settings.fullscreen);
                const display = displays.find((d) => d.id === settings.currentDisplay);
                if (display !== undefined && settings.fullscreen) {
                    setCurrentDisplay(display);
                }
                setTheme(settings.theme);
                setBackground(settings.background);
                setLanguage(settings.language);
            }
        })();
    }, [loading]);

    useEffect(() => {
        (async() => {
            try {
                setSettings({
                    ...settings,
                    fullscreen: fullscreen
                });
                window.DisplayAPI.setFullscreen(fullscreen);
            } catch (e) {
                logger.error('Failed to change fullscreen', e);
            }
        })();
    }, [fullscreen]);

    useEffect(() => {
        (async() => {
            try {
                if (theme === 'light') {
                    window.SteamAPI.activateAchievement('flashbang');
                }
                setSettings({
                    ...settings,
                    theme: theme
                });
            } catch (e) {
                logger.error('Failed to change darkMode', e);
            }
        })();
    }, [theme]);

    useEffect(() => {
        (async() => {
            try {
                setSettings({
                    ...settings,
                    offline: offline
                });
            } catch (e) {
                logger.error('Failed to change offline', e);
            }
        })();
    }, [offline]);

    useEffect(() => {
        (async() => {
            try {
                if (currentDisplay !== undefined) {
                    setSettings({
                        ...settings,
                        currentDisplay: currentDisplay.id
                    });
                    window.DisplayAPI.moveToDisplay(currentDisplay);
                }
            } catch (e) {
                logger.error('Failed to move to display', e);
            }
        })();
    }, [currentDisplay]);

    useEffect(() => {
        (async() => {
            try {
                setSettings({
                    ...settings,
                    language: language
                });
            } catch (e) {
                logger.error('Failed to move to display', e);
            }
        })();
    }, [language]);

    useEffect(() => {
        (async() => {
            try {
                setSettings({
                    ...settings,
                    background: background
                });
            } catch (e) {
                logger.error('Failed to change background', e);
            }
        })();
    }, [background]);

    const onDisplaySelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        if (e.target.value !== 'none') {
            let selectedId: number | undefined = undefined;
            try {
                selectedId = parseInt(e.target.value);
            } catch (e) {
                logger.error('Failed to parse display selected', e);
                return;
            }
            if (selectedId === undefined)
                return;
            const display = displays.find((d) => d.id === selectedId);
            if (display !== undefined) {
                setCurrentDisplay(display);
            }
        }
    };

    const onLanguageSelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setLanguage(e.target.value as Language);
    };

    const onBackgroundChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setBackground(e.currentTarget.value as BackgroundType);
    };

    const onThemeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setTheme(e.currentTarget.value as ThemeType);
    };

    const handleHideInside = () => {
        setSettings({
            ...settings,
            volume: volume,
            muted: muted,
            fps: fps,
            keybinds: {
                lock: lockKeybind,
                copy: copyKeybind,
                remove: removeKeybind
            }
        });
        handleHide();
    };

    const handleAdvanced = () => {
        setAdvanced(!advanced);
    };

    const onResetConfirm = async () => {
        setShowResetConfirm(false);
        try {
            await window.ImportExportAPI.reset();
            setShouldUpdate(true);
        } catch (e) {
            logger.error('Failed resetting data', e);
        }
    };

    const onResetCancel = () => {
        setShowResetConfirm(false);
    };

    const exportFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            const result = await window.ImportExportAPI.export();
            if (!result) {
                setErrorText(getFromStore('settings.userCancelled', settings.language));
            } else {
                setSuccessText(getFromStore('settings.exported', settings.language));
            }
        } catch (e) {
            logger.error('Failed to export file', e);
            setErrorText(e.message);
        }
    };

    const importFile = async () => {
        try {
            setErrorText('');
            setSuccessText('');
            const result = await window.ImportExportAPI.import();
            if (!result) {
                setErrorText(getFromStore('settings.userCancelled', settings.language));
            } else {
                setSuccessText(getFromStore('settings.imported', settings.language));
                setShouldUpdate(true);
            }
        } catch (e) {
            logger.error('Failed to import file', e);
            setErrorText(e.message);
        }
    };

    const setKeybind = (event: React.KeyboardEvent<HTMLInputElement>, setFunc: Dispatch<SetStateAction<string>>, defaultKey: string) => {
        event.preventDefault();
        const key = event.key;
        if (key === 'Unidentified') {
            setFunc(defaultKey);
        } else {
            setFunc(event.key);
        }
    };

    const getReadable = (key: string): string => {
        if (KEY_VALUES_TO_LEAVE.includes(key)) {
            return key;
        }
        if (key === ' ') {
            return 'Space';
        }
        return key.toLocaleUpperCase();
    };

    return (
        <Fragment>
            <ConfirmModal onCancel={onResetCancel} onConfirm={onResetConfirm} show={showResetConfirm}>
                <h5>{getFromStore('settings.resetTitle', settings.language)}</h5>
                <p>{getFromStore('settings.resetText', settings.language)}</p>
            </ConfirmModal>
            <Modal show={show} onHide={handleHideInside} centered size="xl" data-bs-theme={theme}>
                <Modal.Header closeButton data-bs-theme={theme}>
                    <Modal.Title>{getFromStore('settings.title', settings.language)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className='row'>
                            <div className='col-6 col-md-5 col-lg-3'>
                                <div className="form-check form-switch form-switch-lg">
                                    <input className="form-check-input" type="checkbox" role="switch" id="setFullscreen" onChange={() => setFullscreen(!fullscreen)} checked={fullscreen}/>
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setFullscreen">{getFromStore('settings.items.fullscreen', settings.language)}</label>
                                </div>
                            </div>
                            <div className='col-6 col-md-7 col-lg-9'>
                                <Form.Select aria-label="Fullscreen display" onChange={onDisplaySelect} value={currentDisplay === undefined ? 'none' : currentDisplay.id} disabled={!fullscreen}>
                                    {<option disabled key="none" value="none">{getFromStore('settings.selectScreen', settings.language)}</option>}
                                    {displays.map((display) => {
                                        return (<option
                                            key={display.id}
                                            value={display.id}>{display.label} ({display.size.width * display.scaleFactor}x{display.size.height * display.scaleFactor})
                                        </option>);
                                    })}
                                </Form.Select>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <div className="form-check form-switch form-switch-lg">
                                    <input className="form-check-input" type="checkbox" role="switch" id="setOffline" onChange={() => setOffline(!offline)} checked={offline}/>
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setOffline">{getFromStore('settings.items.offline', settings.language)}</label>
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-6 col-md-5 col-lg-3 pt-1'>
                                <h5 className='text-end'>{getFromStore('settings.items.theme', settings.language)}</h5>
                            </div>
                            <div className='col-6 col-md- col-lg-9'>
                                <div className="btn-group" role="group">
                                    {
                                        ThemeTypeList.filter((item) => {
                                            if (item === 'supporter') {
                                                return hasSupporterTheme;
                                            } else {
                                                return true;
                                            }
                                        }).map((type) => {
                                            return (
                                                <Fragment 
                                                    key={`${type}Theme`}>
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        key={`${type}Theme`}
                                                        name={`${type}Theme`}
                                                        id={`${type}Theme`}
                                                        value={type}
                                                        onChange={onThemeChange}
                                                        checked={theme === type}/>
                                                    <label className="btn btn-outline-primary" htmlFor={`${type}Theme`}>{getFromStore(`settings.themes.${type}`, settings.language)}</label>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-6 col-md-5 col-lg-3 pt-1'>
                                <h5 className='text-end'>{getFromStore('settings.items.background', settings.language)}</h5>
                            </div>
                            <div className='col-6 col-md- col-lg-9'>
                                <div className="btn-group" role="group">
                                    {
                                        BackgroundTypeList.map((type) => {
                                            return (
                                                <Fragment 
                                                    key={`${type}Background`}>
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        key={`${type}Background`}
                                                        name={`${type}Background`}
                                                        id={`${type}Background`}
                                                        value={type}
                                                        onChange={onBackgroundChange}
                                                        checked={background === type}/>
                                                    <label className="btn btn-outline-primary" htmlFor={`${type}Background`}>{getFromStore(`settings.backgrounds.${type}`, settings.language)}</label>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-6 col-md-5 col-lg-3'>
                                <h5 className='text-end'>{getFromStore('settings.items.language', settings.language)}</h5>
                            </div>
                            <div className='col-6 col-md-7 col-lg-9'>
                                <Form.Select aria-label="Language" onChange={onLanguageSelect} value={language}>
                                    {languages.map((language) => {
                                        return (<option
                                            key={language}
                                            value={language}>
                                            {languageDisplay[language].native} ({languageDisplay[language].english})
                                        </option>);
                                    })}
                                </Form.Select>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6 col-md-5 col-lg-3 pt-2'>
                                <h5 className='text-end'>{getFromStore('settings.items.volume', settings.language)}</h5>
                            </div>
                            <div className='col-6 col-md-7 col-lg-9 d-flex'>
                                <div className={`btn ${muted ? 'btn-offline' : 'btn-no-outline'} float-start mb-2 fs-2 d-flex p-2`} onClick={() => setMuted(!muted)}>
                                    {muted ? (<IoVolumeMuteOutline />) :
                                        volume > 0.7 ? (<IoVolumeHighOutline />) : volume > 0.3 ? (<IoVolumeMediumOutline />) : volume === 0 ? (<IoVolumeMuteOutline />) : (<IoVolumeLowOutline />)}
                                </div>
                                <input type="range" className="form-range mt-3" min="0" max="1" step="0.02" value={volume} disabled={muted} onChange={(e) => setVolume(parseFloat(e.target.value))}/>
                            </div>
                        </div>
                        <Collapse in={advanced}>
                            <div>
                                <div className='row mb-4'>
                                    <div className='col-6 col-md-5 col-lg-3 pt-2'>
                                        <h5 className='text-end'>{getFromStore('settings.items.fps', settings.language)}</h5>
                                    </div>
                                    <div className='col-6 col-md-7 col-lg-9 d-flex'>
                                        <h5 className='float-start mb-2 fs-2 d-flex pe-2'>{fps}</h5>
                                        <input type="range" className="form-range mt-2" min="15" max="360" step="1" value={fps} disabled={background === 'blank'} onChange={(e) => setFPS(parseInt(e.target.value))}/>
                                    </div>
                                </div>
                                <div className='row mb-2'>
                                    <div className='col-12'>
                                        <h3 className='text-center'>{getFromStore('settings.keybinds', settings.language)}</h3>
                                    </div>
                                </div>
                                <div className='row mb-4'>
                                    <div className='col-6 col-md-5 col-lg-3'>
                                        <h5 className='text-end'>{getFromStore('settings.items.lockKeybind', settings.language)}</h5>
                                    </div>
                                    <div className='col-5 col-md-6 col-lg-8'>
                                        <input
                                            type="text"
                                            className="form-control override-focus"
                                            value={getReadable(lockKeybind)}
                                            onChange={() => {}} // here for error
                                            onKeyDown={(e) => setKeybind(e, setLockKeybind, DEFAULT_SETTINGS.keybinds.lock)}
                                            placeholder={getFromStore('settings.items.lockKeybind', settings.language)}/>
                                    </div>
                                    <div className='col-1 px-0'>
                                        <Button variant="danger" onClick={() => setLockKeybind(DEFAULT_SETTINGS.keybinds.lock)}>
                                            <IoRefreshOutline/>
                                        </Button>
                                    </div>
                                </div>
                                <div className='row mb-4'>
                                    <div className='col-6 col-md-5 col-lg-3'>
                                        <h5 className='text-end'>{getFromStore('settings.items.copyKeybind', settings.language)}</h5>
                                    </div>
                                    <div className='col-5 col-md-6 col-lg-8'>
                                        <input
                                            type="text"
                                            className="form-control override-focus"
                                            value={getReadable(copyKeybind)}
                                            onChange={() => {}} // here for error
                                            onKeyDown={(e) => setKeybind(e, setCopyKeybind, DEFAULT_SETTINGS.keybinds.copy)}
                                            placeholder={getFromStore('settings.items.copyKeybind', settings.language)}/>
                                    </div>
                                    <div className='col-1 px-0'>
                                        <Button variant="danger" onClick={() => setCopyKeybind(DEFAULT_SETTINGS.keybinds.copy)}>
                                            <IoRefreshOutline/>
                                        </Button>
                                    </div>
                                </div>
                                <div className='row mb-4'>
                                    <div className='col-6 col-md-5 col-lg-3'>
                                        <h5 className='text-end'>{getFromStore('settings.items.removeKeybind', settings.language)}</h5>
                                    </div>
                                    <div className='col-5 col-md-6 col-lg-8'>
                                        <input
                                            type="text"
                                            className="form-control override-focus"
                                            value={getReadable(removeKeybind)}
                                            onChange={() => {}} // here for error
                                            onKeyDown={(e) => setKeybind(e, setRemoveKeybind, DEFAULT_SETTINGS.keybinds.remove)}
                                            placeholder={getFromStore('settings.items.removeKeybind', settings.language)}/>
                                    </div>
                                    <div className='col-1 px-0'>
                                        <Button variant="danger" onClick={() => setRemoveKeybind(DEFAULT_SETTINGS.keybinds.remove)}>
                                            <IoRefreshOutline/>
                                        </Button>
                                    </div>
                                </div>
                                <div className='row mb-2'>
                                    <div className='col-12'>
                                        <h3 className='text-center'>{getFromStore('settings.importExport', settings.language)}</h3>
                                    </div>
                                </div>
                                <div className='row px-3'>
                                    {errorText !== '' ?
                                        <Alert variant="danger" onClose={() => setErrorText('')} dismissible>
                                            <span>{errorText}</span>
                                        </Alert>
                                        : (<Fragment/>)}
                                </div>
                                <div className='row px-3'>
                                    {successText !== '' ?
                                        <Alert variant="success" onClose={() => setSuccessText('')} dismissible>
                                            <span>{successText}</span>
                                        </Alert>
                                        : (<Fragment/>)}
                                </div>
                                <div className='row'>
                                    <div className='col-6 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-primary' onClick={importFile}>{getFromStore('settings.buttons.import', settings.language)}</div>
                                    </div>
                                    <div className='col-6 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-primary' onClick={exportFile}>{getFromStore('settings.buttons.export', settings.language)}</div>
                                    </div>
                                    <div className='col-12 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-outline-danger' onClick={() => setShowResetConfirm(true)}>{getFromStore('settings.buttons.reset', settings.language)}</div>
                                    </div>
                                </div>
                            </div>
                        </Collapse>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => window.GenericAPI.quit()} className='me-auto'>
                        {getFromStore('settings.buttons.quit', settings.language)}
                    </Button>
                    <Button variant={advanced ? 'primary' : 'outline-primary'} onClick={handleAdvanced}>
                        {getFromStore('settings.buttons.advanced', settings.language)}
                    </Button>
                    <Button variant="primary" onClick={handleHideInside}>
                        {getFromStore('settings.buttons.saveChanges', settings.language)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};
