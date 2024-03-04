import { Container, Row } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { DropContainer } from './DropContainer';
import { SettingsProvider } from './SettingsProvider';
import { DEFAULT_SETTINGS } from '../common/settings';
import { useEffect, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { InfoModal } from './InfoModal';
import { GleamyProvider } from 'gleamy';

export type ModalOption = 'settings' | 'info' | 'none'

function App() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [currentModal, setCurrentModal] = useState<ModalOption>('none');

    useEffect(() => {
        (async() => {
            try {
                const settings = await window.SettingsAPI.getSettings();
                console.log(settings);
                setSettings(settings);
            } catch (e) {
                console.error('Failed to load settings (oops)');
                console.error(e);
            }
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
        <DndProvider backend={HTML5Backend}>
            <GleamyProvider>
                <SettingsProvider value={settings}>
                    <Container fluid={true} className='h-100 p-0 bg-light overflow-hidden'>
                        <Row className='h-100 p-0 m-0'>
                            <DropContainer hideSourceOnDrag={false} openModal={openModal}/>
                        </Row>
                        <SettingsModal show={currentModal === 'settings'} handleHide={handleModalClose} />
                        <InfoModal show={currentModal === 'info'} handleHide={handleModalClose} />
                    </Container>
                </SettingsProvider>
            </GleamyProvider>
        </DndProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
