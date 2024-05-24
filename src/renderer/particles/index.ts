import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { blankOptions } from './blank';
import { lineOptions } from './line';
import { bubbleOptions } from './bubble';
import { BackgroundType, ThemeType } from '../../common/settings';
import { beachOptions } from './beach';
// import { bounceOptions } from './bounce';

export const options: {
    [K in BackgroundType]: (theme: ThemeType, fps: number) => RecursivePartial<IOptions>
} = {
    blank: blankOptions,
    line: lineOptions,
    bubble: bubbleOptions,
    themeSand: beachOptions,
    // bounce: bounceOptions
};

export default options;
