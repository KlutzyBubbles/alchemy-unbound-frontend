import { useState, type FC, useEffect, useContext, Fragment } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { SettingsContext } from '../../providers/SettingsProvider';
import { BackgroundType, BackgroundTypeList, ThemeType, ThemeTypeList, DEFAULT_SETTINGS, Language, languageDisplay, languages, Settings, Keybinds } from '../../../common/settings';
import { getFromStore } from '../../language';
import { LoadingContext } from '../../providers/LoadingProvider';
import { IoVolumeHighOutline, IoVolumeLowOutline, IoVolumeMediumOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import { ConfirmModal } from '../ConfirmDialog';
import logger from 'electron-log/renderer';
import { UpdateContext } from '../../providers/UpdateProvider';
import { InfoContext } from '../../providers/InfoProvider';
import * as bootstrap from 'bootstrap';
import { DEFAULT_INFO, Info } from '../../../common/info';
import { ModalWrapper } from '../ModalWrapper';
import { MainSelector } from './MainSelector';
import { Switch } from './Switch';
import { KeybindSelector } from './KeybindSelector';

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
    const [volume, setVolume] = useState<number>(settings?.volume ?? DEFAULT_SETTINGS.volume);
    const [muted, setMuted] = useState<boolean>(settings?.muted ?? DEFAULT_SETTINGS.muted);
    const [fps, setFPS] = useState<number>(settings?.fps ?? DEFAULT_SETTINGS.fps);
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [keybindChanged, setKeybindChanged] = useState<boolean>(false);
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
    const [info, setInfo] = useState<Info>(DEFAULT_INFO);
    const { setShouldUpdate, updateKeybind } = useContext(UpdateContext);
    const { hasSupporterTheme, hasThemePack } = useContext(InfoContext);

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
                setKeybindChanged(false);
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
                // setFullscreen(settings.fullscreen);
                const display = displays.find((d) => d.id === settings.currentDisplay);
                if (display !== undefined && settings.fullscreen) {
                    setCurrentDisplay(display);
                }
                // setTheme(settings.theme);
                // setBackground(settings.background);
                // setLanguage(settings.language);
            }
        })();
    }, [loading]);

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

    const changeValue = async <K extends keyof Settings, V extends typeof settings[K]>(key: K, value: V) => {
        try {
            setSettings({
                ...settings,
                [key]: value
            });
        } catch (e) {
            logger.error('Failed to change background', e);
        }
    };

    const changeKeybindSub = async <K extends keyof Keybinds, V extends typeof settings.keybinds[K]>(key: K, value: V) => {
        try {
            await changeValue('keybinds', {
                ...settings.keybinds,
                [key]: value
            });
            setKeybindChanged(true);
        } catch (e) {
            logger.error('Failed to change background', e);
        }
    };

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

    const handleHideInside = () => {
        console.log('keybind settings hide', {
            ...settings,
            volume: volume,
            muted: muted,
            fps: fps,
        });
        setSettings({
            ...settings,
            volume: volume,
            muted: muted,
            fps: fps,
        });
        if (keybindChanged) {
            console.log('CHANGING KEYBIND');
            updateKeybind();
        }
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

    const footerContent = <>
        <Button variant={advanced ? 'primary' : 'outline-primary'} onClick={handleAdvanced} className='me-auto'>
            {getFromStore('settings.buttons.advanced', settings.language)}
        </Button>
        <Button variant="primary" onClick={handleHideInside}>
            {getFromStore('settings.buttons.saveChanges', settings.language)}
        </Button>
    </>;

    return (
        <Fragment>
            <ConfirmModal onCancel={onResetCancel} onConfirm={onResetConfirm} show={showResetConfirm}>
                <h5>{getFromStore('settings.resetTitle', settings.language)}</h5>
                <p>{getFromStore('settings.resetText', settings.language)}</p>
            </ConfirmModal>
            <ModalWrapper show={show} title={'menu.options'} footerContent={footerContent} handleHide={handleHideInside}>
                <Fragment>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <div className='row'>
                            <Switch
                                title={'settings.items.fullscreen'}
                                defaultValue={settings?.fullscreen ?? DEFAULT_SETTINGS.fullscreen}
                                onChange={(value) => {
                                    changeValue('fullscreen', value);
                                    try {
                                        window.DisplayAPI.setFullscreen(value);
                                    } catch (e) {
                                        logger.error('Failed to change fullscreen', e);
                                    }
                                }}
                                className='col-6 col-md-5 col-lg-3'/>
                            <div className='col-6 col-md-7 col-lg-9'>
                                <Form.Select aria-label="Fullscreen display" onChange={onDisplaySelect} value={currentDisplay === undefined ? 'none' : currentDisplay.id} disabled={!settings.fullscreen}>
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
                            <Switch
                                title={'settings.items.offline'}
                                defaultValue={settings?.offline ?? DEFAULT_SETTINGS.offline}
                                onChange={(value) => changeValue('offline', value)}
                                className='col-12 col-xl-6'/>
                            <Switch
                                title={'settings.items.performance'}
                                defaultValue={settings?.performance ?? DEFAULT_SETTINGS.performance}
                                onChange={(value) => changeValue('performance', value)}
                                className='col-12 col-xl-6'/>
                        </div>
                        <MainSelector<ThemeType>
                            title={'settings.items.theme'}
                            defaultValue={settings?.theme ?? DEFAULT_SETTINGS.theme}
                            values={ThemeTypeList.filter((item) => {
                                if (item === 'supporter') {
                                    return hasSupporterTheme;
                                } else {
                                    if (item !== 'light' && item !== 'dark') {
                                        if (hasThemePack) {
                                            return true;
                                        }
                                        return info.themesUnlocked.includes(item);
                                    }
                                    return true;
                                }
                            })}
                            onChange={(value) => changeValue('theme', value)}
                            getDisplay={(value) => getFromStore(`settings.themes.${value}`, settings.language)} />
                        <MainSelector<BackgroundType>
                            title={'settings.items.background'}
                            defaultValue={settings?.background ?? DEFAULT_SETTINGS.background}
                            values={BackgroundTypeList.filter((item) => {
                                if (item !== 'blank' && item !== 'line' && item !== 'bubble') {
                                    if (hasThemePack) {
                                        return true;
                                    }
                                    return info.themesUnlocked.includes(item);
                                }
                                return true;
                            })}
                            onChange={(value) => changeValue('background', value)}
                            getDisplay={(value) => getFromStore(`settings.backgrounds.${value}`, settings.language)} />
                        <MainSelector<Language>
                            title={'settings.items.language'}
                            defaultValue={settings?.language ?? DEFAULT_SETTINGS.language}
                            values={languages}
                            onChange={(value) => changeValue('language', value)}
                            getDisplay={(value) => `${languageDisplay[value].native} (${languageDisplay[value].english})`} />
                        
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
                                        <input type="range" className="form-range mt-2" min="15" max="360" step="1" value={fps} disabled={settings.background === 'blank'} onChange={(e) => setFPS(parseInt(e.target.value))}/>
                                    </div>
                                </div>
                                <div className='row mb-2'>
                                    <div className='col-12'>
                                        <h3 className='text-center'>{getFromStore('settings.keybinds', settings.language)}</h3>
                                    </div>
                                </div>
                                <KeybindSelector
                                    title={'settings.items.lockKeybind'}
                                    defaultValue={settings.keybinds.lock}
                                    resetValue={DEFAULT_SETTINGS.keybinds.lock}
                                    onChange={(value) => changeKeybindSub('lock', value)} />
                                <KeybindSelector
                                    title={'settings.items.copyKeybind'}
                                    defaultValue={settings.keybinds.copy}
                                    resetValue={DEFAULT_SETTINGS.keybinds.copy}
                                    onChange={(value) => changeKeybindSub('copy', value)} />
                                <KeybindSelector
                                    title={'settings.items.removeKeybind'}
                                    defaultValue={settings.keybinds.remove}
                                    resetValue={DEFAULT_SETTINGS.keybinds.remove}
                                    onChange={(value) => changeKeybindSub('remove', value)} />
                                <div className='row mb-2'></div>
                                <div className='row'>
                                    <div className='col-12 d-grid'>
                                        <div className='btn btn-outline-danger' onClick={() => setShowResetConfirm(true)}>{getFromStore('settings.buttons.reset', settings.language)}</div>
                                    </div>
                                </div>
                            </div>
                        </Collapse>
                    </Form>
                </Fragment>
            </ModalWrapper>
        </Fragment>
    );
};
