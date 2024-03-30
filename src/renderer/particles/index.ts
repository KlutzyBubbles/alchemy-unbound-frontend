import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { blankOptions } from './blank';
import { lineOptions } from './line';
import { BackgroundType, ThemeType } from '../../common/settings';

export const options: {
    [K in BackgroundType]: (theme: ThemeType, fps: number) => RecursivePartial<IOptions>
} = {
    blank: blankOptions,
    line: lineOptions
};

export default options;
