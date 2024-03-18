import { FC, ReactNode, createContext, useState } from 'react';
import { RecipeElement } from '../../common/types';

export const ElementsContext = createContext<{
    elements: RecipeElement[]
    setElements: (elements: RecipeElement[]) => void,
        }>({
            elements: [],
            setElements: (elements: RecipeElement[]) => { console.log('DEFAULT STILL RUN', elements); }
        });

interface ElementsProviderProps {
    children?: ReactNode
}

export const ElementsProvider: FC<ElementsProviderProps> = ({
    children
}) => {
    const [elements, setElements] = useState<RecipeElement[]>([]);

    return (
        <ElementsContext.Provider
            value={{
                elements,
                setElements
            }}
        >
            {children}
        </ElementsContext.Provider>
    );
};
  
