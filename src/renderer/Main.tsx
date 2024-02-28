import { Container, Row } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { DropContainer } from './DropContainer';
import { SettingsContext } from './SettingsContext';
import { DEFAULT_SETTINGS } from '../common/settings';
import { useEffect, useState } from 'react';

function App() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        (async() => {
            try {
                setSettings(await window.SettingsAPI.getSettings())
            } catch (e) {
                console.error('Failed to load settings (oops)')
                console.error(e)
            }
        })()
    }, [setSettings])

    return (
        <DndProvider backend={HTML5Backend}>
            <SettingsContext.Provider value={settings}>
                <Container fluid={true} className='h-100 p-0 bg-light'>
                    <Row className='h-100 p-0 m-0'>
                        <DropContainer hideSourceOnDrag={false}/>
                    </Row>
                </Container>
            </SettingsContext.Provider>
        </DndProvider>
    )
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);