import { useState, type FC, useEffect, useContext, Fragment, ChangeEventHandler } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { BackgroundType, BackgroundTypeList, Language, languageDisplay, languages } from '../../common/settings';
import { getFromStore } from '../language';
import { LoadingContext } from '../providers/LoadingProvider';

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
    const [fullscreen, setFullscreen] = useState<boolean>(settings?.fullscreen ?? false);
    const [darkMode, setDarkMode] = useState<boolean>(settings?.dark ?? true);
    const [background, setBackground] = useState<BackgroundType>(settings?.background ?? 'line');
    const [language, setLanguage] = useState<Language>(settings?.language ?? 'english');

    useEffect(() => {
        (async() => {
            try {
                setDisplays(await window.DisplayAPI.getDisplays());
                setCurrentDisplay(await window.DisplayAPI.getCurrentDisplay());
            } catch (e) {
                console.error('Failed to load settings (oops)');
                console.error(e);
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
                console.log(fullscreen);
                window.DisplayAPI.setFullscreen(fullscreen);
            } catch (e) {
                console.error('Failed to change fullscreen', e);
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
                console.log(darkMode);
            } catch (e) {
                console.error('Failed to change darkMode', e);
            }
        })();
    }, [darkMode]);

    useEffect(() => {
        (async() => {
            try {
                if (currentDisplay !== undefined) {
                    setSettings({
                        ...settings,
                        currentDisplay: currentDisplay.id
                    });
                    console.log(currentDisplay.id);
                    window.DisplayAPI.moveToDisplay(currentDisplay);
                }
            } catch (e) {
                console.error('Failed to move to display', e);
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
                console.log(language);
            } catch (e) {
                console.error('Failed to move to display', e);
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
                console.log(background);
            } catch (e) {
                console.error('Failed to change background', e);
            }
        })();
    }, [background]);

    const onDisplaySelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        if (e.target.value === 'none') {
            console.log('Ignoring select');
        } else {
            let selectedId: number | undefined = undefined;
            try {
                selectedId = parseInt(e.target.value);
            } catch (e) {
                console.error('Failed to parse number?', e);
                return;
            }
            if (selectedId === undefined)
                return;
            const display = displays.find((d) => d.id === selectedId);
            if (display === undefined) {
                console.log('Failed to find selected display');
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

    return (
        <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={darkMode ? 'dark' : 'light'}>
            <Modal.Header closeButton data-bs-theme={darkMode ? 'dark' : 'light'}>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div className='row'>
                        <div className='col-6 col-md-5 col-lg-3'>
                            <div className="form-check form-switch form-switch-lg">
                                <input className="form-check-input" type="checkbox" role="switch" id="setFullscreen" onChange={() => setFullscreen(!fullscreen)} checked={fullscreen}/>
                                <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setFullscreen">Fullscreen</label>
                            </div>
                        </div>
                        <div className='col-6 col-md-7 col-lg-9'>
                            <Form.Select aria-label="Fullscreen display" onChange={onDisplaySelect} value={currentDisplay === undefined ? 'none' : currentDisplay.id} disabled={!fullscreen}>
                                {<option disabled key="none" value="none">Please select a screen</option>}
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
                                <label className="form-check-label h5 pt-2 mb-0 ps-3" htmlFor="setDarkMode">Dark Mode</label>
                            </div>
                        </div>
                    </div>
                    <div className='row mb-4'>
                        <div className='col-6 col-md-5 col-lg-3 pt-1'>
                            <h5 className='text-end'>Background</h5>
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
                    <div className='row'>
                        <div className='col-6 col-md-5 col-lg-3'>
                            <h5 className='text-end'>Language</h5>
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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleHide}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
