import type { FC } from 'react';
import { Fragment, useContext, useRef, useState } from 'react';

import { IoBandageOutline, IoCloudDownloadOutline, IoCloudOfflineOutline, IoConstructOutline, IoSpeedometerOutline, IoTrashOutline } from 'react-icons/io5';
import { ModalOption } from '../../Container';
import { SettingsContext } from '../../providers/SettingsProvider';
import { HintButton } from './HintButton';
import { Overlay, Tooltip } from 'react-bootstrap';
import { getFromStore } from '../../language';
import { InfoContext } from '../../providers/InfoProvider';
import logger from 'electron-log/renderer';
import { LanguageStore } from '../../language/store';

export interface BottomButtonProps {
    openModal: (option: ModalOption) => void
    clearAll: () => void
    refreshHint: number,
    deprecated: boolean,
    rateLimited: boolean
}

export const BottomButton: FC<BottomButtonProps> = ({
    openModal,
    clearAll,
    refreshHint,
    deprecated,
    rateLimited
}) => {
    const { settings } = useContext(SettingsContext);
    const { isLegacy, isProduction } = useContext(InfoContext);
    const [showDeprecatedTooltip, setShowDeprecatedTooltip] = useState<boolean>(false);
    const [showRateTooltip, setShowRateTooltip] = useState<boolean>(false);
    const [showLegacyTooltip, setShowLegacyTooltip] = useState<boolean>(false);
    const deprecatedRef = useRef(undefined);
    const rateLimitedRef = useRef(undefined);
    const legacyRef = useRef(undefined);

    const devClick = () => {
        // openModal('store');
        logger.warn('This is a dev button and shouldnt be visible');
        logger.warn(LanguageStore);
    };

    return (
        <div className='footer mt-auto z-mainButtons'>
            <div className='btn btn-clear float-start mb-2 ms-2 fs-1 d-flex p-2' onClick={clearAll}><IoTrashOutline /></div>
            <HintButton refreshProp={refreshHint} />
            {isProduction ? (<Fragment/>) : (
                <div className='btn btn-info float-end mb-2 fs-2 d-flex p-2' onClick={devClick}><IoBandageOutline /></div>
            )}
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
            {isLegacy ? (<Fragment>
                <div
                    ref={legacyRef}
                    className='btn btn-deprecated float-end mb-2 fs-1 d-flex p-2'
                    onClick={() => openModal('v2')}
                    onMouseEnter={() => setShowLegacyTooltip(true)}
                    onMouseLeave={() => setShowLegacyTooltip(false)}
                ><IoConstructOutline /></div>
                <Overlay target={legacyRef.current} show={showLegacyTooltip} placement="left">
                    {(props) => (
                        <Tooltip id="overlay-example" {...props}>
                            {getFromStore('errors.legacy', settings.language)}
                        </Tooltip>
                    )}
                </Overlay>
            </Fragment>) : (<Fragment/>)}
        </div>
    );
};
