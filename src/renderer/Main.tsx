import '@popperjs/core'; 
import 'bootstrap';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from './providers/SettingsProvider';
import { ContentContainer } from './Container';
import { LoadingProvider } from './providers/LoadingProvider';
import { SoundProvider } from './providers/SoundProvider';
import log from 'electron-log/renderer';
import { UpdateProvider } from './providers/UpdateProvider';
import { StatsProvider } from './providers/StatsProvider';
import { ElementsProvider } from './providers/ElementProvider';
import { InfoProvider } from './providers/InfoProvider';

export type ModalOption = 'settings' | 'info' | 'none'

function App() {
    log.info('Info from app renderer');
    return (
        <DndProvider backend={TouchBackend} options={{ enableTouchEvents: false, enableMouseEvents: true }}>
            <InfoProvider>
                <SettingsProvider>
                    <StatsProvider>
                        <ElementsProvider>
                            <LoadingProvider>
                                <SoundProvider>
                                    <UpdateProvider>
                                        <ContentContainer/>
                                    </UpdateProvider>
                                </SoundProvider>
                            </LoadingProvider>
                        </ElementsProvider>
                    </StatsProvider>
                </SettingsProvider>
            </InfoProvider>
        </DndProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
