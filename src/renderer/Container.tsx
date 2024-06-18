import { Container, Row } from 'react-bootstrap';
import { DropContainer } from './dragndrop/DropContainer';
import { FC, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { SettingsModal } from './modals/settings/SettingsModal';
import Particles, { initParticlesEngine } from '@tsparticles/react';
// import { loadSlim } from '@tsparticles/slim';
import { loadAll } from '@tsparticles/all';
import type { IOptions, RecursivePartial } from '@tsparticles/engine';
import options from './particles';
import { SettingsContext } from './providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { LoadingContext } from './providers/LoadingProvider';
import { SideMenu } from './dragndrop/Menu/SideMenu';
import { StatsModal } from './modals/stats/StatsModal';
import { StoreModal } from './modals/store/StoreModal';
import { ItemModal } from './modals/CustomItemModal';
import { SaveResetModal } from './modals/SaveResetModal';
import { InfoContext } from './providers/InfoProvider';
import { DEFAULT_SETTINGS } from '../common/settings';

export type ModalOption = 'settings' | 'info' | 'stats' | 'store' | 'addItem' | 'v2' | 'none';

export const ContentContainer: FC = () => {
    const { settings } = useContext(SettingsContext);
    const { loadingVisible } = useContext(LoadingContext);
    const { fileVersions, isLegacy } = useContext(InfoContext);
    const [currentModal, setCurrentModal] = useState<ModalOption>('none');
    const [currentParticles, setCurrentParticles] = useState<RecursivePartial<IOptions>>(options[settings.background ?? DEFAULT_SETTINGS.background](settings.theme ?? DEFAULT_SETTINGS.theme, settings.fps ?? DEFAULT_SETTINGS.fps));
    const [particleReady, setParticleReady] = useState<boolean>(false);
    const [refreshValues, setRefreshValues] = useState<number>(0);
    const modalCallback = useRef(undefined);

    useEffect(() => {
        (async() => {
            await initParticlesEngine(async (engine) => {
                //await loadSlim(engine);
                await loadAll(engine);
            });
            setParticleReady(true);
        })();
    }, []);

    useEffect(() => {
        if (!loadingVisible && isLegacy && fileVersions.databaseInfo.type === 'base') {
            setCurrentModal('v2');
        }
    }, [loadingVisible]);

    useEffect(() => {
        (async () => {
            setParticleReady(false);
            setCurrentParticles(options[settings.background ?? DEFAULT_SETTINGS.background](settings.theme ?? DEFAULT_SETTINGS.theme, settings.fps ?? DEFAULT_SETTINGS.fps));
            await initParticlesEngine(async (engine) => {
                //await loadSlim(engine);
                await loadAll(engine);
            });
            setParticleReady(true);
        })();
    }, [settings]);

    const handleModalClose = async () => {
        if (currentModal === 'settings') {
            try {
                await window.SettingsAPI.setSettings(settings);
                await window.SettingsAPI.saveSettings();
            } catch(e) {
                logger.error('Close settings saving failed', e);
            }
        }
        if (modalCallback.current !== undefined) {
            modalCallback.current();
            modalCallback.current = undefined;
        }
        setCurrentModal('none');
    };

    const refreshValuesFunc = () => {
        setRefreshValues((value) => {
            return value + 1;
        });
    };

    const openModal = (option: ModalOption, onClose?: () => void) => {
        modalCallback.current = onClose;
        setCurrentModal(option);
    };

    if (loadingVisible) {
        return (
            <div data-bs-theme={settings.theme}>
                <Container fluid={true} className='p-0 loading-fullscreen full-size overflow-hidden' data-bs-theme={settings.theme}>
                    <div className='overlay'>
                        <div className='d-flex justify-content-center'>
                            <div className="spinner-border spinner-lg" role="loading"/>
                        </div>
                    </div>
                </Container>
            </div>
        );
    } else {
        return (
            <div data-bs-theme={settings.theme}>
                <Container fluid={true} className='h-100 p-0 bg-theme overflow-hidden' data-bs-theme={settings.theme}>
                    <Row className='h-100 p-0 m-0'>
                        {particleReady ? <Particles
                            className='z-particles'
                            id="backgroundParticles"
                            options={currentParticles}
                        /> : <Fragment/>}
                        <DropContainer refreshValues={refreshValues} openModal={openModal}/>
                    </Row>
                    <SideMenu openModal={openModal} />
                    <SettingsModal show={currentModal === 'settings'} handleHide={handleModalClose} />
                    <StatsModal show={currentModal === 'stats'} handleHide={handleModalClose} />
                    <SaveResetModal show={currentModal === 'v2'} handleHide={handleModalClose} />
                    <ItemModal
                        show={currentModal === 'addItem'}
                        handleHide={handleModalClose}
                        refreshValues={refreshValuesFunc} />
                    <StoreModal
                        show={currentModal === 'store'}
                        handleHide={handleModalClose}
                        refreshValues={refreshValuesFunc}/>
                </Container>
            </div>
        );
    }
};
