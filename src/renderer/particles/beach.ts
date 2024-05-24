import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const beachOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
    return {
        fpsLimit: fps,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
        interactivity: {
            detectsOn: 'window',
            events: {
                onHover: {
                    enable: true,
                    mode: 'bounce',
                },
                onClick: {
                    enable: true,
                    mode: 'repulse'
                }
            },
            modes: {
                repulse: {
                    distance: 100,
                    speed: 5,
                    duration: 0.7
                },
                bounce: {
                    distance: 100,
                    duration: 0.1
                }
            }
        },
        particles: {
            number: {
                value: 1,
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
                type: 'images',
                options: {
                    images: {
                        src: 'image://beach-ball.png',
                        width: 150,
                        height: 150
                    }
                }
            },
            opacity: {
                value: 0.7,
            },
            size: {
                value: 75,
            },
            move: {
                enable: true,
                gravity: {
                    enable: true,
                    maxSpeed: 69
                },
                speed: {
                    min: 10,
                    max: 20
                },
                outModes: 'bounce',
                // decay: 0.1
            },
            rotate: {
                value: {
                    min: 0,
                    max: 360
                },
                animation: {
                    enable: true,
                    speed: 10,
                    sync: true
                }
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
