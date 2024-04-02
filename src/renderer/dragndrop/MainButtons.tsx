import type { FC } from 'react';
import { Fragment, useContext } from 'react';

import { IoBandageOutline, IoCloudOfflineOutline, IoInformationCircleOutline, IoSettingsOutline } from 'react-icons/io5';
import { motion, useAnimation } from 'framer-motion';
import { ModalOption } from '../Main';
import { SettingsContext } from '../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { InfoContext } from '../providers/InfoProvider';
import { HintButton } from './HintButton';

export interface MainButtonProps {
  openModal: (option: ModalOption) => void
  refreshHint: number
}

export const MainButtons: FC<MainButtonProps> = ({
    openModal,
    refreshHint
}) => {
    const { settings } = useContext(SettingsContext);
    const { isProduction } = useContext(InfoContext);

    const onSettingsMouseEnter = () => {
        settingsControls.start('start');
    };

    const onSettingsMouseLeave = () => {
        settingsControls.start('reset');
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

    const devClick = () => {
        (async () => {
            try {
                // const token = await window.RecipeAPI.getToken();
                // logger.warn('Found token', token);
                await window.HintAPI.resetHint();
            } catch (e) { 
                logger.error('Failed dev', e);
            }
        })();
    };

    return (
        <div className='footer mt-auto z-mainButtons'>
            <motion.div
                className='btn btn-no-outline float-end mb-2 me-2 fs-2 d-flex p-2'
                onMouseEnter={onSettingsMouseEnter}
                onMouseLeave={onSettingsMouseLeave}
                variants={settingsVariants}
                animate={settingsControls}
                onClick={() => openModal('settings')}>
                <IoSettingsOutline/>
            </motion.div>
            <div className='btn btn-info float-end mb-2 fs-2 d-flex p-2' onClick={() => openModal('info')}><IoInformationCircleOutline /></div>
            {isProduction ? (<Fragment/>) : (
                <div className='btn btn-info float-end mb-2 fs-2 d-flex p-2' onClick={devClick}><IoBandageOutline /></div>
            )}
            <HintButton refreshProp={refreshHint} />
            {settings.offline ? (<div className='btn btn-offline float-end mb-2 fs-2 d-flex p-2' onClick={() => openModal('settings')}><IoCloudOfflineOutline /></div>) : (<Fragment/>)}
        </div>
    );
};

// <a href="https://ko-fi.com/klutzybubbles" target="_blank" className='btn btn-sm btn-heart float-end mb-2 fs-2 d-flex p-2' rel="noreferrer"><IoHeart /></a>
