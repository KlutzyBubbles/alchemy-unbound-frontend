import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const bounceOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
    return {
        fpsLimit: fps,
        particles: {
            bounce: {
                vertical: {
                    value: {
                        min: .75,
                        max: .85
                    }
                }
            },
            color: {
                value: getColor('primary', theme),
                //['#3998D0', '#2EB6AF', '#A9BD33', '#FEC73B', '#F89930', '#F45623', '#D62E32', '#EB586E', '#9952CF']
            },
            number: {
                value: 0
            },
            destroy: {
                mode: 'split',
                split: {
                    count: 2,
                    factor: {
                        value: {
                            min: 1.1,
                            max: 2
                        }
                    },
                    rate: {
                        value: {
                            min: 2,
                            max: 3
                        }
                    }
                }
            },
            opacity: {
                value: .5
            },
            size: {
                value: {
                    min: 10,
                    max: 25
                }
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
                direction: 'none',
                random: false,
                straight: false,
                outModes: {
                    bottom: 'split',
                    default: 'bounce',
                    top: 'none'
                },
                trail: {
                    enable: false,
                    fill: {
                        color: {
                            value: getColor('background', theme),
                        },
                    },
                    length: 3
                }
            }
        },
        detectRetina: true,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
        emitters: {
            direction: 'top',
            life: {
                count: 0,
                duration: .15,
                delay: 3
            },
            rate: {
                delay: .1,
                quantity: 5
            },
            size: {
                width: 0,
                height: 0
            }
        }
    };
};
