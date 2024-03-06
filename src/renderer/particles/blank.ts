import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';

export const blankOptions:(dark: boolean) => RecursivePartial<IOptions> = (dark: boolean) => {
    return {
        background: {
            color: {
                value: getColor('background', dark),
            },
        },
    };
};
