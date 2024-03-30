import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const blankOptions:(theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType) => {
    return {
        fpsLimit: 1,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
    };
};
