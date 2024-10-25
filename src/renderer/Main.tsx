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
import { InfoProvider } from './providers/InfoProvider';

function App() {
    log.info('Info from app renderer');
    return (
        <DndProvider backend={TouchBackend} options={{ enableTouchEvents: false, enableMouseEvents: true }}>
            <InfoProvider>
                <SettingsProvider>
                    <LoadingProvider>
                        <SoundProvider>
                            <UpdateProvider>
                                <ContentContainer/>
                            </UpdateProvider>
                        </SoundProvider>
                    </LoadingProvider>
                </SettingsProvider>
            </InfoProvider>
        </DndProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
