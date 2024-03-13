import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from './providers/SettingsProvider';
import { ContentContainer } from './Container';
import { LoadingProvider } from './providers/LoadingProvider';
import { SoundProvider } from './providers/SoundProvider';
import log from 'electron-log/renderer';

export type ModalOption = 'settings' | 'info' | 'none'

function App() {
    log.info('Info from app renderer');
    return (
        <DndProvider backend={TouchBackend} options={{ enableTouchEvents: false, enableMouseEvents: true }}>
            <SettingsProvider>
                <LoadingProvider>
                    <SoundProvider>
                        <ContentContainer/>
                    </SoundProvider>
                </LoadingProvider>
            </SettingsProvider>
        </DndProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
