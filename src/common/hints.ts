import { Recipe } from './types';

export type Hint = {
    hintsLeft: number,
    hint: Recipe | undefined,
}

export const DEFAULT_MAX_HINTS = 10;

export const DEFAULT_HINT: Hint = {
    hintsLeft: 3,
    hint: undefined
};
