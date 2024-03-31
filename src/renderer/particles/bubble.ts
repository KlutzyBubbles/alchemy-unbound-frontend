import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const bubbleOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
    return {
        fpsLimit: fps,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
        particles: {
            number: {
                value: 15,
                density: {
                    enable: true,
                    width: 800,
                    height: 800
                }
            },
            color: {
                value: getColor('foreground', theme)
            },
            shape: {
                type: 'circle',
            },
            opacity: {
                value: 0.3,
            },
            size: {
                value: 35,
            },
            move: {
                enable: true,
                speed: 1.6,
                outModes: 'bounce',
            },
            collisions: {
                bounce: {
                    horizontal: {
                        value: 1
                    },
                    vertical: {
                        value: 1
                    },
                },
                enable: true,
                maxSpeed: 5,
                mode: 'bounce',
            }
        },
    };
};
