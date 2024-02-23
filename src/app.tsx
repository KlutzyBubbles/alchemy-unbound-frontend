import { Col, Container, Row } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { DropContainer } from './DropContainer';
import { SideElement } from './SideElement';

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid={true} className='h-100 p-0'>
                <Row className='h-100'>
                    <Col><DropContainer hideSourceOnDrag={false}/></Col>
                    <Col xs={6} sm={4} md={3} lg={2} className='border-start border-primary bg-white z-500 position-sticky'>
                        Hello There
                        <SideElement name='test'/>
                        <SideElement name='test1'/>
                        <SideElement name='test2'/>
                        <SideElement name='test3'/>
                        <SideElement name='test4'/>
                        <SideElement name='test5'/>
                    </Col>
                </Row>
            </Container>
        </DndProvider>
    )
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);