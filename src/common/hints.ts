import { Recipe } from './types';

export type Hint = {
    maxHints: number,
    hintsLeft: number,
    hint: Recipe | undefined,
}

export const DEFAULT_HINT: Hint = {
    maxHints: 10,
    hintsLeft: 3,
    hint: undefined
};
