import { Container, Row } from 'react-bootstrap';
import { DropContainer } from './dragndrop/DropContainer';
import { FC, useContext, useEffect, useState } from 'react';
import { SettingsModal } from './modals/SettingsModal';
import { InfoModal } from './modals/InfoModal';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { Container as ParticleContainer } from '@tsparticles/engine';
import options from './particles';
import { SettingsContext } from './providers/SettingsProvider';

export type ModalOption = 'settings' | 'info' | 'none'

export const ContentContainer: FC = () => {
    const { settings } = useContext(SettingsContext);
    const [currentModal, setCurrentModal] = useState<ModalOption>('none');

    const particlesLoaded = async (container: ParticleContainer) => {
        console.log(container);
    };

    useEffect(() => {
        (async() => {
            initParticlesEngine(async (engine) => {
                await loadFull(engine);
            });
        })();
    }, []);

    const handleModalClose = () => {
        if (currentModal === 'settings') {
            window.SettingsAPI.saveSettings();
        }
        setCurrentModal('none');
    };

    const openModal = (option: ModalOption) => setCurrentModal(option);

    return (
        <Container fluid={true} className='h-100 p-0 bg-light overflow-hidden' data-bs-theme={settings.dark ? 'dark' : 'light'}>
            <Row className='h-100 p-0 m-0'>
                <Particles
                    className='z-particles'
                    id="backgroundParticles"
                    particlesLoaded={particlesLoaded}
                    options={options[settings.background](settings.dark)}
                />
                <DropContainer hideSourceOnDrag={false} openModal={openModal}/>
            </Row>
            <SettingsModal show={currentModal === 'settings'} handleHide={handleModalClose} />
            <InfoModal show={currentModal === 'info'} handleHide={handleModalClose} />
        </Container>
    );
};
