import { type FC, useContext, useState, Fragment, useEffect } from 'react';
import { Alert, Button, Collapse } from 'react-bootstrap';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { getFromStore } from '../../language';
import { ThemeButton } from './ThemeButton';
import { CreditButton } from './CreditButton';
import { TxnItems } from '../../../common/server';
import { ErrorCodeToString, SUPPORTER_DLC } from '../../../common/types';
import { getLegacyColor, invertLegacyColor } from '../../utils/theme';
import { InfoContext } from '../../providers/InfoProvider';
import { ModalWrapper } from '../ModalWrapper';


export interface StoreModalProps {
  show: boolean
  handleHide: () => void
  refreshValues: () => void
}

export const StoreModal: FC<StoreModalProps> = ({
    show,
    handleHide,
    refreshValues
}) => {
    const { settings } = useContext(SettingsContext);
    const [errorText, setErrorText] = useState<string>('');
    const [successText, setSuccessText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    // const [aiHintsUnlocked, setAIHintsUnlocked] = useState<boolean>(false);
    const { hasSupporterTheme, hasThemePack } = useContext(InfoContext);
    const [themes, setThemes] = useState<string[]>([]);
    const [info, setInfo] = useState<boolean>(false);
    const [rigged, setRigged] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (show) {
                try {
                    const info = await window.InfoAPI.getInfo();
                    setThemes(info.themesUnlocked);
                    // setAIHintsUnlocked(info.aiHints);
                } catch (error) {
                    logger.error('Unknown issue loading themes', error);
                }
            }
        })();
    }, [show]);

    const addTheme = (theme: string) => {
        setThemes((themes) => {
            if (!themes.includes(theme)) {
                themes.push(theme);
            }
            return themes;
        });
    };
    
    // const purchaseAIHints = async () => {
    //     console.log('AI Hints purchase');
    //     try {
    //         setLoading(true);
    //         setErrorText('');
    //         setSuccessText('');
    //         const result = await window.ServerAPI.initTransaction('aiHints');
    //         setLoading(false);
    //         if (result === undefined) {
    //             setErrorText(getFromStore('errors.offline', settings.language));
    //         } else {
    //             if (result.type === 'error') {
    //                 setErrorText(Object.keys(ErrorCodeToString).includes(`${result.result.code}`) ?
    //                     getFromStore(`errors.${ErrorCodeToString[result.result.code]}`, settings.language) :
    //                     getFromStore('errors.unknownError', settings.language));
    //             } else {
    //                 setSuccessText(getFromStore('store.purchased', settings.language));
    //                 window.InfoAPI.setInfoKey('aiHints', true);
    //                 setAIHintsUnlocked(true);
    //             }
    //         }
    //     } catch (e) {
    //         logger.error('Failed to purchase AI hints', e);
    //         setErrorText(e.message);
    //         setLoading(false);
    //     }
    // };

    const purchaseFillHints = async () => {
        console.log('Fill Hints purchase');
        try {
            setLoading(true);
            setErrorText('');
            setSuccessText('');
            const result = await window.ServerAPI.initTransaction('fillHints');
            setLoading(false);
            if (result === undefined) {
                setErrorText(getFromStore('errors.offline', settings.language));
            } else {
                if (result.type === 'error') {
                    setErrorText(Object.keys(ErrorCodeToString).includes(`${result.result.code}`) ?
                        getFromStore(`errors.${ErrorCodeToString[result.result.code]}`, settings.language) :
                        getFromStore('errors.unknownError', settings.language));
                } else {
                    setSuccessText(getFromStore('store.purchased', settings.language));
                    await window.HintAPI.fillHints();
                    refreshValues();
                }
            }
        } catch (e) {
            logger.error('Failed to purchase fill hints', e);
            setErrorText(e.message);
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        try {
            setSuccessText('');
            setErrorText('');
            setLoading(true);
            const result = await window.ServerAPI.restorePurchases();
            if (result) {
                setSuccessText(getFromStore('store.restored', settings.language));
            } else {
                setErrorText(getFromStore('store.noRestore', settings.language));
            }
            const info = await window.InfoAPI.getInfo();
            setThemes(info.themesUnlocked);
            // setAIHintsUnlocked(info.aiHints);
            setLoading(false);
        } catch (error) {
            logger.error('Error restoring purchases', error);
            setLoading(false);
            setErrorText(error.message);
        }
    };

    const footerContent = <Fragment>
        <Button size='lg' variant={info ? 'primary' : 'outline-primary'} onClick={() => setInfo(!info)} className='me-auto'>
            {getFromStore('store.infoButton', settings.language)}
        </Button>
        <Button size="lg" variant="secondary" onClick={handleRestore}>
            {getFromStore('store.restore', settings.language)}
        </Button>;
    </Fragment>;

    return <ModalWrapper show={show} title={'store.title'} footerContent={footerContent} handleHide={handleHide}>
        <Fragment>
            <Collapse in={info}>
                <div>
                    {settings.language !== 'english' ? <p>{getFromStore('store.info.translated', settings.language)}</p> : ''}
                    <p>{getFromStore('store.info.oneA', settings.language)} (<span className='btn btn-link p-0 text-body' onClick={() => setRigged(!rigged)}>{getFromStore('store.info.oneB', settings.language)}</span>).</p>
                    <Collapse in={rigged} className='mb-3'>
                        <div>
                            <div className="card">
                                <div className="card-body">
                                    <p className='m-0 text-body'>{getFromStore('store.info.twoA', settings.language)}</p>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                    <p>{getFromStore('store.info.oneC', settings.language)}</p>
                    <p>{getFromStore('store.info.threeA', settings.language)}</p>
                </div>
            </Collapse>
            <div className='row mx-3'>
                {loading ?
                    <Alert className='mb-0 mt-3' variant="info" onClose={() => setErrorText('')} dismissible>
                        <span>{getFromStore('store.loading', settings.language)}</span>
                    </Alert>
                    : (<Fragment/>)}
            </div>
            <div className='row mx-3'>
                {errorText !== '' ?
                    <Alert className='mb-0 mt-3' variant="danger" onClose={() => setErrorText('')} dismissible>
                        <span>{errorText}</span>
                    </Alert>
                    : (<Fragment/>)}
            </div>
            <div className='row mx-3'>
                {successText !== '' ?
                    <Alert className='mb-0 mt-3' variant="success" onClose={() => setSuccessText('')} dismissible>
                        <span>{successText}</span>
                    </Alert>
                    : (<Fragment/>)}
            </div>
            <div className='row mx-0'>
                <div className='col-12 mt-3'>
                    <div className='card theme-supporter d-flex flex-row'>
                        <div className='card-body d-flex flex-column'>
                            <div className='row'>
                                <div className='col-7 col-lg-9 col-xl-10'>
                                    <h1 className='title user-select-none'>{getFromStore('store.titles.themeSupporter', settings.language)}</h1>
                                </div>
                                <div className='col-5 col-lg-3 col-xl-2 d-grid'>
                                    <div className={`btn btn-${hasSupporterTheme ? 'secondary disabled' : 'success'} btn-lg user-select-none`} onClick={() => window.SteamAPI.openToDLC(SUPPORTER_DLC)}>
                                        {hasSupporterTheme ? getFromStore('store.purchasedButton', settings.language) : `USD ${(new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        })).format(9.99)}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row mx-0 mt-3'>
                <ThemeButton
                    name={'sand'}
                    id={'themeSand'}
                    emoji={'⛱️'}
                    unlocked={hasThemePack || themes.includes('themeSand')}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    addTheme={addTheme}/>
                <ThemeButton
                    name={'blue'}
                    id={'themeBlue'}
                    emoji={'☁️'}
                    unlocked={hasThemePack || themes.includes('themeBlue')}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    addTheme={addTheme}/>
                <ThemeButton
                    name={'pink'}
                    id={'themePink'}
                    emoji={'🌸'}
                    unlocked={hasThemePack || themes.includes('themePink')}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    addTheme={addTheme}/>
            </div>
            <div className='row mx-0'>
                <div className='col-12 mt-3'>
                    <div className='card d-flex flex-row'>
                        <div className='flex-shrink-1'>
                            <div className='card-body'>
                                <h1 className='title m-0 user-select-none'>{getFromStore('store.titles.fillHints', settings.language)}</h1>
                            </div>
                        </div>
                        <div className={`flex-grow-1 hint-${invertLegacyColor(getLegacyColor(settings.theme))}`}>
                            <div className='card-body d-grid'>
                                <div className='btn btn-success btn-lg ms-auto user-select-none' onClick={purchaseFillHints}>
                                    {`USD ${(new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    })).format(TxnItems['fillHints'].amount / 100)}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row mx-0 mb-3'>
                <CreditButton
                    name={'250'}
                    id={'credit250'}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    refreshValues={refreshValues}/>
                <CreditButton
                    name={'750'}
                    id={'credit750'}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    refreshValues={refreshValues}/>
                <CreditButton
                    name={'1500'}
                    id={'credit1500'}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    refreshValues={refreshValues}/>
                <CreditButton
                    name={'3500'}
                    id={'credit3500'}
                    setErrorText={setErrorText}
                    setSuccessText={setSuccessText}
                    setLoading={setLoading}
                    refreshValues={refreshValues}/>
            </div>
        </Fragment>
    </ModalWrapper>;
};

/*

<div className='card-body d-flex flex-column'>
                                <div className='row'>
                                    <div className='col-7 col-lg-9 col-xl-10'>
                                        <h1 className='title'>{getFromStore('store.titles.fillHints', settings.language)}</h1>
                                    </div>
                                    <div className='col-5 col-lg-3 col-xl-2 d-grid'>
                                        <div className='btn btn-success btn-lg' onClick={purchaseFillHints}>
                                            {`USD ${(new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })).format(TxnItems['fillHints'].amount / 100)}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                    <div className='col-12 mt-3'>
                        <div className='card'>
                            <div className='card-body d-flex flex-column'>
                                <div className='row'>
                                    <div className='col-7 col-lg-9 col-xl-10'>
                                        <h1>{getFromStore('store.titles.aiHints', settings.language)}</h1>
                                    </div>
                                    <div className='col-5 col-lg-3 col-xl-2 d-grid'>
                                        <div className={`btn btn-${aiHintsUnlocked ? 'secondary disabled' : 'success'} btn-lg`} onClick={purchaseAIHints}>
                                            {aiHintsUnlocked ? getFromStore('store.purchasedButton', settings.language) : `USD ${(new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })).format(TxnItems['aiHints'].amount / 100)}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
*/
