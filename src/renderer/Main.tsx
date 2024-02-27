import { Container, Row } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { DropContainer } from './DropContainer';

declare global {
    interface Window {
        electron: any;
    }
}

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid={true} className='h-100 p-0'>
                <Row className='h-100 p-0 m-0'>
                    <DropContainer hideSourceOnDrag={false}/>
                </Row>
            </Container>
        </DndProvider>
    )
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);