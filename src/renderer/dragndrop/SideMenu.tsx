import { FC, useContext } from 'react';
import { IoCartOutline, IoDownloadOutline, IoExitOutline, IoPulseOutline, IoSaveOutline, IoSettingsOutline, IoStatsChartOutline } from 'react-icons/io5';
import { motion, useAnimation } from 'framer-motion';
import { ModalOption } from '../Container';
import { BsGithub, BsDiscord } from 'react-icons/bs';
import { getFromStore, getObjectFromStore, getPlaceholderLanguage } from '../language';
import { ItemRenderer } from '../ItemRenderer';
import { ItemTypes } from '../types';
import { mockElement } from '../utils';
import { SoundContext } from '../providers/SoundProvider';
import { SettingsContext } from '../providers/SettingsProvider';

export interface SideMenuProps {
    openModal: (option: ModalOption) => void
}

export const SideMenu: FC<SideMenuProps> = ({
    openModal
}) => {
    const { settings } = useContext(SettingsContext);
    const { playSound } = useContext(SoundContext);

    const onSettingsMouseEnter = () => {
        settingsControls.start('start');
        playSound('click2', 0.8);
    };

    const onSettingsMouseLeave = () => {
        settingsControls.start('reset');
    };

    const onMouseOver = () => {
        playSound('click2', 0.8);
    };

    const settingsVariants = {
        start: () => ({
            rotate: [0, 90],
            transition: {
                duration: 0.2,
                repeat: 0,
                ease: 'easeInOut',
                repeatDelay: 0.5
            }
        }),
        reset: {
            rotate: [90, 0],
            transition: {
                duration: 0.2,
                repeat: 0,
                ease: 'easeInOut'
            }
        }
    };
  
    const settingsControls = useAnimation();

    return (
        <div className="offcanvas offcanvas-start side-menu" tabIndex={-1} id="sideMenu" aria-labelledby="sideMenuLabel">
            <div className="offcanvas-header pb-0">
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-0">
                <img src="image://logo.png" className="img-fluid px-4" alt="Logo"/>
                <ul className="navbar-nav justify-content-between">
                    <div className='my-3'/>
                    <li className="nav-item btn btn-no-radius btn-left-hover"
                        onMouseEnter={onSettingsMouseEnter}
                        onMouseLeave={onSettingsMouseLeave}>
                        <div className="nav-link d-flex"
                            onClick={() => openModal('settings')}>
                            <div className='mx-auto pt-half'>
                                <h2 className='m-0'>{getFromStore('menu.options', settings.language)}</h2>
                            </div>
                            <motion.div
                                className='float-end fs-2 d-flex p-2'
                                variants={settingsVariants}
                                animate={settingsControls}>
                                <IoSettingsOutline/>
                            </motion.div>
                        </div>
                    </li>
                    <li className="nav-item btn btn-no-radius btn-left-hover"
                        onMouseEnter={onMouseOver}>
                        <div className="nav-link d-flex"
                            onClick={() => openModal('stats')}>
                            <div className='mx-auto pt-half'>
                                <h2 className='m-0'>{getFromStore('menu.statistics', settings.language)}</h2>
                            </div>
                            <div
                                className='float-end fs-2 d-flex p-2'>
                                <IoStatsChartOutline />
                            </div>
                        </div>
                    </li>
                    <li className="nav-item btn btn-no-radius btn-left-hover"
                        onMouseEnter={onMouseOver}>
                        <div className="nav-link d-flex"
                            onClick={() => openModal('store')}>
                            <div className='mx-auto pt-half'>
                                <h2 className='m-0'>{getFromStore('menu.store', settings.language)}</h2>
                            </div>
                            <div
                                className='float-end fs-2 d-flex p-2'>
                                <IoCartOutline />
                            </div>
                        </div>
                    </li>
                    <div className='my-3'/>
                    <li className="nav-item btn btn-no-radius btn-left-hover"
                        onMouseEnter={onMouseOver}>
                        <div className="nav-link d-flex"
                            onClick={() => openModal('settings')}>
                            <div className='mx-auto pt-half'>
                                <h2 className='m-0'>{getFromStore('settings.buttons.export', settings.language)}</h2>
                            </div>
                            <div
                                className='float-end fs-2 d-flex p-2'>
                                <IoSaveOutline />
                            </div>
                        </div>
                    </li>
                    <li className="nav-item btn btn-no-radius btn-left-hover"
                        onMouseEnter={onMouseOver}>
                        <div className="nav-link d-flex"
                            onClick={() => openModal('settings')}>
                            <div className='mx-auto pt-half'>
                                <h2 className='m-0'>{getFromStore('settings.buttons.import', settings.language)}</h2>
                            </div>
                            <div
                                className='float-end fs-2 d-flex p-2'>
                                <IoDownloadOutline />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div className='footer mt-auto'>
                <div className='row'>
                    <div className='col-12 d-flex mt-2 mx-2 justify-content-center'>
                        <ItemRenderer
                            element={mockElement({
                                name: 'game',
                                display: getObjectFromStore('info.game', 'Game'),
                                emoji: '🎮',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                        <span className='fs-3'>+</span>
                        <ItemRenderer
                            element={mockElement({
                                name: 'hacker',
                                display: getObjectFromStore('info.hacker', 'Hacker'),
                                emoji: '👨‍💻',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                        <span className='fs-3'>=</span>
                        <ItemRenderer
                            element={mockElement({
                                name: 'klutzybubbles',
                                display: getPlaceholderLanguage('KlutzyBubbles'),
                                emoji: '🤹',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                        <div className='clearfix'></div>
                    </div>
                    <div className='col-12 d-flex mt-2 mx-2 justify-content-center'>
                        <ItemRenderer
                            element={mockElement({
                                name: 'game',
                                display: getObjectFromStore('info.game', 'Game'),
                                emoji: '🎮',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                        <span className='fs-3'>+</span>
                        <ItemRenderer
                            element={mockElement({
                                name: 'art',
                                display: getObjectFromStore('info.art', 'Art'),
                                emoji: '🎨',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                        <span className='fs-3'>=</span>
                        <ItemRenderer
                            element={mockElement({
                                name: 'piney',
                                display: getPlaceholderLanguage('Piney'),
                                emoji: '🌲',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}/>
                    </div>
                </div>
                <div
                    className='btn btn-sm btn-danger float-start my-3 ms-3 fs-2 d-flex p-2 me-2'
                    onClick={() => window.GenericAPI.quit()}>
                    <h2 className='mx-2'><IoExitOutline /></h2>
                </div>
                <a
                    href="https://discord.com/invite/wBcwzxTTXN"
                    target="_blank"
                    className='btn btn-sm btn-discord float-end my-3 me-3 fs-2 d-flex p-2 me-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><BsDiscord /></h2>
                </a>
                <a
                    href="https://github.com/KlutzyBubbles/alchemy-unbound"
                    target="_blank"
                    className='btn btn-sm btn-github float-end my-3 me-2 fs-2 d-flex p-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><BsGithub /></h2>
                </a>
                <a
                    href="https://status.alchemyunbound.net"
                    target="_blank"
                    className='btn btn-sm btn-status float-end my-3 me-2 fs-2 d-flex p-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><IoPulseOutline /></h2>
                </a>
            </div>
        </div>
    );
};
