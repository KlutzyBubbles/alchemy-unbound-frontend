import { useState, type FC, useEffect, useContext, Fragment, ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import { Button, Collapse, Form, Modal } from 'react-bootstrap';
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
import * as bootstrap from 'bootstrap';
import { DEFAULT_INFO, Info } from '../../common/info';

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
    const [lockKeybind, setLockKeybind] = useState<string>(settings?.keybinds.lock ?? DEFAULT_SETTINGS.keybinds.lock);
    const [copyKeybind, setCopyKeybind] = useState<string>(settings?.keybinds.copy ?? DEFAULT_SETTINGS.keybinds.copy);
    const [removeKeybind, setRemoveKeybind] = useState<string>(settings?.keybinds.remove ?? DEFAULT_SETTINGS.keybinds.remove);
    const [info, setInfo] = useState<Info>(DEFAULT_INFO);
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
        (async () => {
            if (show) {
                try {
                    setInfo(await window.InfoAPI.getInfo());
                } catch (e) {
                    logger.error('Failed to load info', e);
                }
            }
        })();
    }, [show]);

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
                    <Modal.Title>
                        <h2 className='mb-0 ms-2'>{getFromStore('menu.options', settings.language)}</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => e.preventDefault()}>
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
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setOffline">
                                        {getFromStore('settings.items.offline', settings.language)} ({getFromStore('settings.items.offlineOrig', settings.language)})
                                    </label>
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
                                                if (item !== 'light' && item !== 'dark') {
                                                    return info.themesUnlocked.includes(item);
                                                }
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
                                        BackgroundTypeList.filter((item) => {
                                            if (item !== 'blank' && item !== 'line' && item !== 'bubble') {
                                                return info.themesUnlocked.includes(item);
                                            }
                                            return true;
                                        }).map((type) => {
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
                                            onFocus={() => console.log('focus3')}
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
                                            onFocus={() => console.log('focus2')}
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
                                            onFocus={() => console.log('focus1')}
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
                                <div className='row mb-2'></div>
                                <div className='row'>
                                    <div className='col-12 d-grid'>
                                        <div className='btn btn-outline-danger' onClick={() => setShowResetConfirm(true)}>{getFromStore('settings.buttons.reset', settings.language)}</div>
                                    </div>
                                </div>
                            </div>
                        </Collapse>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={advanced ? 'primary' : 'outline-primary'} onClick={handleAdvanced} className='me-auto'>
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
