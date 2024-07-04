import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { blankOptions } from './blank';
import { lineOptions } from './line';
import { bubbleOptions } from './bubble';
import { BackgroundType, ThemeType } from '../../common/settings';
import { beachOptions } from './beach';
import { blossomOptions } from './blossom';
import { cloudOptions } from './cloud';
// import { bounceOptions } from './bounce';

export const options: {
    [K in BackgroundType]: (theme: ThemeType, fps: number, width?: number) => RecursivePartial<IOptions>
} = {
    blank: blankOptions,
    line: lineOptions,
    bubble: bubbleOptions,
    themeSand: beachOptions,
    themePink: blossomOptions,
    themeBlue: cloudOptions,
    // bounce: bounceOptions
};

export default options;
