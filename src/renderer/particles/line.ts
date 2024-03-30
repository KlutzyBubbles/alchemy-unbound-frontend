import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const lineOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
    return {
        fpsLimit: fps,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
        particles: {
            number: {
                value: 30,
                density: {
                    enable: false,
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
                value: 0.5,
                animation: {
                    enable: false,
                    speed: 1,
                    startValue: 'min',
                    sync: false
                }
            },
            size: {
                value: 3,
                animation: {
                    enable: false,
                    speed: 40,
                    sync: false
                }
            },
            links: {
                color: getColor('foreground', theme),
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
            },
            move: {
                enable: true,
                speed: 1.6,
                direction: 'none',
                random: false,
                straight: false,
                outModes: 'out',
                attract: {
                    enable: false,
                    rotate: {
                        x: 600,
                        y: 1200
                    }
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onHover: {
                    enable: false,
                    mode: 'grab'
                },
                onClick: {
                    enable: false,
                    mode: 'push'
                },
                resize: {
                    enable: false
                }
            },
            modes: {
                grab: {
                    distance: 400,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    };
};
