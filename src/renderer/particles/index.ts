import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { blankOptions } from './blank';
import { lineOptions } from './line';
import { BackgroundType } from 'src/common/settings';

export const options: {
    [K in BackgroundType]: (dark: boolean) => RecursivePartial<IOptions>
} = {
    blank: blankOptions,
    line: lineOptions
};

export default options;
