import { useState, type FC, useEffect, useContext, Fragment, ChangeEventHandler } from 'react';
import { Button, Collapse, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { BackgroundType, BackgroundTypeList, DEFAULT_SETTINGS, Language, languageDisplay, languages } from '../../common/settings';
import { getFromStore } from '../language';
import { LoadingContext } from '../providers/LoadingProvider';
import { IoVolumeHighOutline, IoVolumeLowOutline, IoVolumeMediumOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import { ConfirmModal } from './ConfirmDialog';
import logger from 'electron-log/renderer';

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
    const [darkMode, setDarkMode] = useState<boolean>(settings?.dark ?? DEFAULT_SETTINGS.dark);
    const [offline, setOffline] = useState<boolean>(settings?.offline ?? DEFAULT_SETTINGS.offline);
    const [background, setBackground] = useState<BackgroundType>(settings?.background ?? DEFAULT_SETTINGS.background);
    const [language, setLanguage] = useState<Language>(settings?.language ?? DEFAULT_SETTINGS.language);
    const [volume, setVolume] = useState<number>(settings?.volume ?? DEFAULT_SETTINGS.volume);
    const [muted, setMuted] = useState<boolean>(settings?.muted ?? DEFAULT_SETTINGS.muted);
    const [fps, setFPS] = useState<number>(settings?.fps ?? DEFAULT_SETTINGS.fps);
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

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
                setDarkMode(settings.dark);
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
                setSettings({
                    ...settings,
                    dark: darkMode
                });
            } catch (e) {
                logger.error('Failed to change darkMode', e);
            }
        })();
    }, [darkMode]);

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
        if (e.target.value === 'none') {
            //console.log('Ignoring select');
        } else {
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
            if (display === undefined) {
                //console.log('Failed to find selected display');
            } else {
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

    const handleHideInside = () => {
        setSettings({
            ...settings,
            volume: volume,
            muted: muted,
            fps: fps
        });
        handleHide();
    };

    const handleAdvanced = () => {
        setAdvanced(!advanced);
    };

    const onResetConfirm = () => {
        setShowResetConfirm(false);
        console.log('RESET CONFIRMED');
    };

    const onResetCancel = () => {
        setShowResetConfirm(false);
        console.log('RESET CANCELLED');
    };

    return (
        <Fragment>
            <ConfirmModal onCancel={onResetCancel} onConfirm={onResetConfirm} show={showResetConfirm}>
                <h5>Are you sure you want to reset your save data?</h5>
                <p>A backup will be created however this will NOT be saved to steam cloud</p>
            </ConfirmModal>
            <Modal show={show} onHide={handleHideInside} centered size="xl" data-bs-theme={darkMode ? 'dark' : 'light'}>
                <Modal.Header closeButton data-bs-theme={darkMode ? 'dark' : 'light'}>
                    <Modal.Title>{getFromStore('settings', settings.language)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className='row'>
                            <div className='col-6 col-md-5 col-lg-3'>
                                <div className="form-check form-switch form-switch-lg">
                                    <input className="form-check-input" type="checkbox" role="switch" id="setFullscreen" onChange={() => setFullscreen(!fullscreen)} checked={fullscreen}/>
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setFullscreen">{getFromStore('fullscreen', settings.language)}</label>
                                </div>
                            </div>
                            <div className='col-6 col-md-7 col-lg-9'>
                                <Form.Select aria-label="Fullscreen display" onChange={onDisplaySelect} value={currentDisplay === undefined ? 'none' : currentDisplay.id} disabled={!fullscreen}>
                                    {<option disabled key="none" value="none">{getFromStore('selectScreen', settings.language)}</option>}
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
                                    <input className="form-check-input" type="checkbox" role="switch" id="setDarkMode" onChange={() => setDarkMode(!darkMode)} checked={darkMode}/>
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setDarkMode">{getFromStore('darkMode', settings.language)}</label>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <div className="form-check form-switch form-switch-lg">
                                    <input className="form-check-input" type="checkbox" role="switch" id="setOffline" onChange={() => setOffline(!offline)} checked={offline} disabled/>
                                    <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setOffline">{getFromStore('offline', settings.language)}</label>
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-6 col-md-5 col-lg-3 pt-1'>
                                <h5 className='text-end'>{getFromStore('background', settings.language)}</h5>
                            </div>
                            <div className='col-6 col-md- col-lg-9'>
                                <div className="btn-group" role="group" aria-label="Basic outlined example">
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
                                                    <label className="btn btn-outline-primary" htmlFor={`${type}Background`}>{getFromStore(`${type}Background`, settings.language)}</label>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-6 col-md-5 col-lg-3'>
                                <h5 className='text-end'>{getFromStore('language', settings.language)}</h5>
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
                                <h5 className='text-end'>{getFromStore('volume', settings.language)}</h5>
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
                                        <h5 className='text-end'>{getFromStore('fps', settings.language)}</h5>
                                    </div>
                                    <div className='col-6 col-md-7 col-lg-9 d-flex'>
                                        <h5 className='float-start mb-2 fs-2 d-flex pe-2'>{fps}</h5>
                                        <input type="range" className="form-range mt-2" min="15" max="360" step="1" value={fps} disabled={background === 'blank'} onChange={(e) => setFPS(parseInt(e.target.value))}/>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-6 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-primary disabled'>{getFromStore('importButton', settings.language)}</div>
                                    </div>
                                    <div className='col-6 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-primary disabled'>{getFromStore('exportButton', settings.language)}</div>
                                    </div>
                                    <div className='col-12 col-md-4 col-lg-4 pt-2 d-grid'>
                                        <div className='btn btn-outline-danger' onClick={() => setShowResetConfirm(true)}>{getFromStore('resetButton', settings.language)}</div>
                                    </div>
                                </div>
                            </div>
                        </Collapse>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => window.GenericAPI.quit()} className='me-auto'>
                        {getFromStore('quit', settings.language)}
                    </Button>
                    <Button variant={advanced ? 'primary' : 'outline-primary'} onClick={handleAdvanced}>
                        {getFromStore('advanced', settings.language)}
                    </Button>
                    <Button variant="primary" onClick={handleHideInside}>
                        {getFromStore('saveChanges', settings.language)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};
