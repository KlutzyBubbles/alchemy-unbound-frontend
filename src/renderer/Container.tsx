import { Container, Row } from 'react-bootstrap';
import { DropContainer } from './dragndrop/DropContainer';
import { FC, Fragment, useContext, useEffect, useState } from 'react';
import { SettingsModal } from './modals/SettingsModal';
import { InfoModal } from './modals/InfoModal';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { IOptions, RecursivePartial } from '@tsparticles/engine';
import options from './particles';
import { SettingsContext } from './providers/SettingsProvider';

export type ModalOption = 'settings' | 'info' | 'none'

export const ContentContainer: FC = () => {
    const { settings } = useContext(SettingsContext);
    const [currentModal, setCurrentModal] = useState<ModalOption>('none');
    const [currentParticles, setCurrentParticles] = useState<RecursivePartial<IOptions>>(options[settings.background](settings.dark, settings.fps));
    const [particleReady, setParticleReady] = useState<boolean>(false);

    useEffect(() => {
        (async() => {
            await initParticlesEngine(async (engine) => {
                await loadFull(engine);
            });
            setParticleReady(true);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            console.log('Settings updated to', settings);
            setParticleReady(false);
            setCurrentParticles(options[settings.background](settings.dark, settings.fps));
            await initParticlesEngine(async (engine) => {
                await loadFull(engine);
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
                console.error('Close saving failed', e);
            }
        }
        setCurrentModal('none');
    };

    const openModal = (option: ModalOption) => setCurrentModal(option);

    return (
        <Container fluid={true} className='h-100 p-0 bg-light overflow-hidden' data-bs-theme={settings.dark ? 'dark' : 'light'}>
            <Row className='h-100 p-0 m-0'>
                {particleReady ? <Particles
                    className='z-particles'
                    id="backgroundParticles"
                    options={currentParticles}
                /> : <Fragment/>}
                <DropContainer hideSourceOnDrag={false} openModal={openModal}/>
            </Row>
            <SettingsModal show={currentModal === 'settings'} handleHide={handleModalClose} />
            <InfoModal show={currentModal === 'info'} handleHide={handleModalClose} />
        </Container>
    );
};
