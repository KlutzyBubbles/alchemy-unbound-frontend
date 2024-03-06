import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from './providers/SettingsProvider';
import { GleamyProvider } from 'gleamy';
import { ContentContainer } from './Container';
import { LoadingProvider } from './providers/LoadingProvider';

export type ModalOption = 'settings' | 'info' | 'none'

function App() {
    return (
        <DndProvider backend={TouchBackend} options={{ enableTouchEvents: false, enableMouseEvents: true }}>
            <GleamyProvider>
                <SettingsProvider>
                    <LoadingProvider>
                        <ContentContainer/>
                    </LoadingProvider>
                </SettingsProvider>
            </GleamyProvider>
        </DndProvider>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
