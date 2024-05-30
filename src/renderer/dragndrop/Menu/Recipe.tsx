import { FC } from 'react';
import { getObjectFromStore } from '../../language';
import { ItemRenderer } from '../../ItemRenderer';
import { ItemTypes } from '../../types';
import { capitalize, mockElement } from '../../utils';

export interface SimpleName {
    name: string,
    emoji: string
}

export interface RecipeProps {
    className: string
    recipe: {
        a: SimpleName
        b: SimpleName
        result: SimpleName
    }
}

export const Recipe: FC<RecipeProps> = ({
    className,
    recipe
}) => {
    return (
        <div className={className}>
            <ItemRenderer
                element={mockElement({
                    name: recipe.a.name,
                    display: getObjectFromStore(`recipes.${recipe.a.name}`, capitalize(recipe.a.name)),
                    emoji: recipe.a.emoji,
                    depth: 0,
                    first: 0,
                    who_discovered: '',
                    base: 1
                })}
                type={ItemTypes.RECIPE_ELEMENT}
                dragging={false}/>
            <span className='fs-3 side-text'>+</span>
            <ItemRenderer
                element={mockElement({
                    name: recipe.b.name,
                    display: getObjectFromStore(`recipes.${recipe.b.name}`, capitalize(recipe.b.name)),
                    emoji: recipe.b.emoji,
                    depth: 0,
                    first: 0,
                    who_discovered: '',
                    base: 1
                })}
                type={ItemTypes.RECIPE_ELEMENT}
                dragging={false}/>
            <span className='fs-3 side-text'>=</span>
            <ItemRenderer
                element={mockElement({
                    name: recipe.result.name,
                    display: getObjectFromStore(`recipes.${recipe.result.name}`, capitalize(recipe.result.name)),
                    emoji: recipe.result.emoji,
                    depth: 0,
                    first: 0,
                    who_discovered: '',
                    base: 1
                })}
                type={ItemTypes.RECIPE_ELEMENT}
                dragging={false}/>
        </div>
    );
};
