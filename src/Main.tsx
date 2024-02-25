import { Col, Container, Row } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { DropContainer } from './DropContainer';
import { SideElement } from './SideElement';
import { useState, useEffect } from 'react';
import { Recipe } from './main/database';

declare global {
    interface Window {
        electron: any;
    }
}

function App() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    async function getAllRecipes() {
        const data = await window.electron.getAllRecipes();

        if (data) {
            setRecipes(data);
        }
    }

    useEffect(() => {
        getAllRecipes();
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid={true} className='h-100 p-0'>
                <Row className='h-100'>
                    <Col><DropContainer hideSourceOnDrag={false}/></Col>
                    <Col xs={6} sm={4} md={3} lg={2} className='border-start border-primary bg-white z-500 position-sticky'>
                        Hello There
                        {recipes.map((recipe) => {
                            return (<SideElement key={recipe.result} {...recipe} />)
                        })}
                    </Col>
                </Row>
            </Container>
        </DndProvider>
    )
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);