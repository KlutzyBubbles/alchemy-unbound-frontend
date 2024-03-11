import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';

export const blankOptions:(dark: boolean, fps: number) => RecursivePartial<IOptions> = (dark: boolean, fps: number) => {
    return {
        fpsLimit: fps,
        background: {
            color: {
                value: getColor('background', dark),
            },
        },
    };
};
