import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const blossomOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
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
                    mode: 'repulse',
                },
                resize: {
                    enable: true
                }
            },
            modes: {
                repulse: {
                    distance: 35,
                    speed: 1,
                },
                bounce: {
                    distance: 100,
                    duration: 0.1
                }
            }
        },
        emitters: {
            autoPlay: true,
            fill: true,
            life: {
                wait: false
            },
            rate: {
                quantity: 10,
                delay: 0.5
            },
            shape: {
                options: {},
                replace: {
                    color: false,
                    opacity: false
                },
                type: 'square'
            },
            startCount: 0,
            size: {
                mode: 'percent',
                height: 0,
                width: 100
            },
            particles: {},
            position: {
                x: 50,
                y: 0
            }
            //position: [
            //    {
            //        x: 0,
            //        y: -100
            //    },
            //    {
            //        x: 10,
            //        y: -100
            //    },
            //    {
            //        x: 20,
            //        y: -100
            //    },
            //    {
            //        x: 30,
            //        y: -100
            //    },
            //    {
            //        x: 40,
            //        y: -100
            //    },
            //    {
            //        x: 50,
            //        y: -100
            //    },
            //    {
            //        x: 60,
            //        y: -100
            //    },
            //    {
            //        x: 70,
            //        y: -100
            //    },
            //    {
            //        x: 80,
            //        y: -100
            //    },
            //    {
            //        x: 90,
            //        y: -100
            //    },
            //    {
            //        x: 100,
            //        y: -100
            //    }
            //]
        },
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    width: 800,
                    height: 800
                },
                limit: {
                    mode: 'wait',
                    value: 100
                }
            },
            color: {
                value: getColor('foreground', theme)
            },
            shape: {
                close: true,
                fill: true,
                options: {
                    polygon: {
                        0: {
                            sides: 5
                        },
                        1: {
                            sides: 6
                        }
                    }
                },
                type: ['circle', 'square',  'polygon']
            },
            roll: {
                darken: {
                    enable: true,
                    value: 30
                },
                enable: true,
                enlighten: {
                    enable: true,
                    value: 30
                },
                mode: 'both',
                speed: {
                    min: 15,
                    max: 25
                }
            },
            tilt: {
                value: {
                    min: 0,
                    max: 360
                },
                animation: {
                    enable: true,
                    speed: 60,
                    decay: 0,
                    sync: false
                },
                direction: 'random',
                enable: true
            },
            wobble: {
                distance: 30,
                enable: true,
                speed: {
                    angle: {
                        min: -15,
                        max: 15
                    },
                    move: 10
                }
            },
            opacity: {
                value: 1,
            },
            size: {
                value: 3,
            },
            move: {
                angle: {
                    offset: 0,
                    value: 90
                },
                attract: {
                    distance: 200,
                    enable: false,
                    rotate: {
                        x: 3000,
                        y: 3000
                    }
                },
                center: {
                    x: 50,
                    y: 50,
                    mode: 'percent',
                    radius: 0
                },
                decay: {
                    min: 0.05,
                    max: 0.15
                },
                distance: {},
                direction: 'top',
                drift: 0,
                enable: true,
                gravity: {
                    acceleration: 9.81,
                    enable: true,
                    inverse: false,
                    maxSpeed: 200
                },
                path: {
                    clamp: true,
                    delay: {
                        value: 0
                    },
                    enable: false,
                    options: {}
                },
                outModes: {
                    default: 'destroy',
                    bottom: 'destroy',
                    left: 'destroy',
                    right: 'destroy',
                    top: 'none'
                },
                random: false,
                size: false,
                speed: {
                    min: 50,
                    max: 150
                },
                spin: {
                    acceleration: 0,
                    enable: false
                },
                straight: false,
                trail: {
                    enable: false,
                    length: 10,
                    fill: {}
                },
                vibrate: false,
                warp: false
            },
            rotate: {
                value: {
                    min: 0,
                    max: 360
                },
                animation: {
                    enable: true,
                    speed: 60,
                    decay: 0,
                    sync: false
                },
                direction: 'random',
                path: false
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
