import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';

export const blankOptions:(dark: boolean, fps: number) => RecursivePartial<IOptions> = (dark: boolean) => {
    return {
        fpsLimit: 1,
        background: {
            color: {
                value: getColor('background', dark),
            },
        },
    };
};
