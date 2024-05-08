import type { FC } from 'react';
import { Fragment, useContext, useRef, useState } from 'react';

import { IoCloudDownloadOutline, IoCloudOfflineOutline, IoSpeedometerOutline, IoTrashOutline } from 'react-icons/io5';
//import { useAnimation } from 'framer-motion';
import { ModalOption } from '../Container';
import { SettingsContext } from '../providers/SettingsProvider';
//import { InfoContext } from '../providers/InfoProvider';
import { HintButton } from './HintButton';
import { Overlay, Tooltip } from 'react-bootstrap';
import { getFromStore } from '../language';

export interface MainButtonProps {
    openModal: (option: ModalOption) => void
    devButton: () => void
    clearAll: () => void
    refreshHint: number,
    deprecated: boolean,
    rateLimited: boolean
}

export const MainButtons: FC<MainButtonProps> = ({
    openModal,
    // devButton,
    clearAll,
    refreshHint,
    deprecated,
    rateLimited
}) => {
    const { settings } = useContext(SettingsContext);
    //const { isProduction } = useContext(InfoContext);
    const [showDeprecatedTooltip, setShowDeprecatedTooltip] = useState<boolean>(false);
    const [showRateTooltip, setShowRateTooltip] = useState<boolean>(false);
    const deprecatedRef = useRef(undefined);
    const rateLimitedRef = useRef(undefined);

    // const onSettingsMouseEnter = () => {
    //     settingsControls.start('start');
    // };

    // const onSettingsMouseLeave = () => {
    //     settingsControls.start('reset');
    // };

    // const settingsVariants = {
    //     start: () => ({
    //         rotate: [0, 90],
    //         transition: {
    //             duration: 0.2,
    //             repeat: 0,
    //             ease: 'easeInOut',
    //             repeatDelay: 0.5
    //         }
    //     }),
    //     reset: {
    //         rotate: [90, 0],
    //         transition: {
    //             duration: 0.2,
    //             repeat: 0,
    //             ease: 'easeInOut'
    //         }
    //     }
    // };
  
    // const settingsControls = useAnimation();

    // const devClick = () => {
    //     devButton();
    // };

    return (
        <div className='footer mt-auto z-mainButtons'>
            <div className='btn btn-clear float-start mb-2 fs-1 d-flex p-2' onClick={clearAll}><IoTrashOutline /></div>
            <HintButton refreshProp={refreshHint} />
            {settings.offline ?
                (<div className='btn btn-offline float-end mb-2 fs-1 d-flex p-2' onClick={() => openModal('settings')}><IoCloudOfflineOutline /></div>) :
                deprecated ? (<Fragment>
                    <div
                        ref={deprecatedRef}
                        className='btn btn-deprecated float-end mb-2 fs-1 d-flex p-2'
                        onMouseEnter={() => setShowDeprecatedTooltip(true)}
                        onMouseLeave={() => setShowDeprecatedTooltip(false)}
                    ><IoCloudDownloadOutline /></div>
                    <Overlay target={deprecatedRef.current} show={showDeprecatedTooltip} placement="left">
                        {(props) => (
                            <Tooltip id="overlay-example" {...props}>
                                {getFromStore('errors.apiDeprecated', settings.language)}
                            </Tooltip>
                        )}
                    </Overlay>
                </Fragment>) : (<Fragment/>)}
            {rateLimited ? (<Fragment>
                <div
                    ref={rateLimitedRef}
                    className='btn btn-deprecated float-end mb-2 fs-1 d-flex p-2'
                    onMouseEnter={() => setShowRateTooltip(true)}
                    onMouseLeave={() => setShowRateTooltip(false)}
                ><IoSpeedometerOutline /></div>
                <Overlay target={rateLimitedRef.current} show={showRateTooltip} placement="left">
                    {(props) => (
                        <Tooltip id="overlay-example" {...props}>
                            {getFromStore('errors.rateLimited', settings.language)}
                        </Tooltip>
                    )}
                </Overlay>
            </Fragment>) : (<Fragment/>)}
        </div>
    );
};

// <a href="https://ko-fi.com/klutzybubbles" target="_blank" className='btn btn-sm btn-heart float-end mb-2 fs-2 d-flex p-2' rel="noreferrer"><IoHeart /></a>

/*
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
<div className='btn btn-advanced float-end mb-2 fs-2 d-flex p-2' onClick={() => openModal('idea')}><IoBulbOutline /></div>
*/
