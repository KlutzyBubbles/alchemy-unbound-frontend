import { IOptions, RecursivePartial } from '@tsparticles/engine';
import { getColor } from '../utils/theme';
import { ThemeType } from '../../common/settings';

export const cloudOptions: (theme: ThemeType, fps: number) => RecursivePartial<IOptions> = (theme: ThemeType, fps: number) => {
    return {
        fullScreen: {
            enable: true
        },
        fpsLimit: fps,
        background: {
            color: {
                value: getColor('background', theme),
            },
        },
        interactivity: {
            detectsOn: 'window',
            events: {
                //onHover: {
                //    enable: false,
                //    mode: 'grab',
                //    parallax: {
                //        enable: false,
                //        force: 800,
                //        smooth: 100
                //    }
                //},
                resize: {
                    delay: 0.5,
                    enable: true
                }
            },
            modes: {
                // grab: {
                //     distance: 0,
                //     links: {
                //         opacity: 0
                //     },
                // },
            }
        },
        particles: {
            groups: {
                // z5000: {
                //     number: {
                //         value: 70
                //     },
                //     zIndex: {
                //         value: 50
                //     }
                // },
                // z7500: {
                //     number: {
                //         value: 30
                //     },
                //     zIndex: {
                //         value: 75
                //     }
                // },
                // z2500: {
                //     number: {
                //         value: 50
                //     },
                //     zIndex: {
                //         value: 25
                //     }
                // },
                // z1000: {
                //     number: {
                //         value: 40
                //     },
                //     zIndex: {
                //         value: 10
                //     }
                // }
            },
            zIndex: {
                value: 5,
                opacityRate: 0.5,
                sizeRate: 1,
                velocityRate: 1
            },
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
            // shape: {
            //     type: 'circle',
            // },//
            shape: {
                type: 'images',
                options: {
                    images: {
                        src: 'image://cloud.png',
                        width: 500,
                        height: 278
                    }
                }
            },
            opacity: {
                value: 0.3,
            },
            size: {
                value: 69,
            },
            move: {
                enable: true,
                speed: 0.6,
                direction: 0,
                angle: 0,
                outModes: {
                    default: 'destroy',
                    bottom: 'none',
                    left: 'none',
                    right: 'destroy',
                    top: 'none'
                },
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
                enable: false,
                maxSpeed: 5,
                mode: 'bounce',
            }
        },
        emitters: {
            autoPlay: true,
            fill: false,
            life: {
                wait: false
            },
            rate: {
                quantity: 1,
                delay: 2
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
                height: 100,
                width: 1
            },
            particles: {},
            position: {
                x: -10,
                y: 50
            }
        },
    };
};
