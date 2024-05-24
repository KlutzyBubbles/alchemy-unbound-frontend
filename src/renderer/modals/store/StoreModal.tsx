import { type FC, useContext, useState, Fragment, useEffect } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { getFromStore } from '../../language';
import { ThemeButton } from './ThemeButton';
import { CreditButton } from './CreditButton';
import { TxnItems } from '../../../common/server';
import { ErrorCodeToString } from '../../../common/types';


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
    const [aiHintsUnlocked, setAIHintsUnlocked] = useState<boolean>(false);
    const [themes, setThemes] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (show) {
                try {
                    const info = await window.InfoAPI.getInfo();
                    setThemes(info.themesUnlocked);
                    setAIHintsUnlocked(info.aiHints);
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
    
    const purchaseAIHints = async () => {
        console.log('AI Hints purchase');
        try {
            setLoading(true);
            setErrorText('');
            setSuccessText('');
            const result = await window.ServerAPI.initTransaction('aiHints');
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
                    window.InfoAPI.setInfoKey('aiHints', true);
                    setAIHintsUnlocked(true);
                }
            }
        } catch (e) {
            logger.error('Failed to purchase AI hints', e);
            setErrorText(e.message);
            setLoading(false);
        }
    };

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
            await window.ServerAPI.restorePurchases();
            setSuccessText(getFromStore('store.restored', settings.language));
            const info = await window.InfoAPI.getInfo();
            setThemes(info.themesUnlocked);
            setAIHintsUnlocked(info.aiHints);
            setLoading(false);
        } catch (error) {
            logger.error('Error restoring purchases', error);
            setLoading(false);
            setErrorText(error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleHide} centered size='xl' data-bs-theme={settings.theme}>
            <Modal.Header closeButton>
                <Modal.Title>{getFromStore('store.title', settings.language)}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-0'>
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
                <div className='row mx-0 mt-3'>
                    <ThemeButton
                        name={'sand'}
                        id={'themeSand'}
                        emoji={'⛱️'}
                        unlocked={themes.includes('themeSand')}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}
                        addTheme={addTheme}/>
                    <ThemeButton
                        name={'purple'}
                        id={'themePurple'}
                        emoji={'🍆'}
                        unlocked={themes.includes('themePurple')}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}
                        addTheme={addTheme}/>
                    <ThemeButton
                        name={'orange'}
                        id={'themeOrange'}
                        emoji={'🍊'}
                        unlocked={themes.includes('themeOrange')}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}
                        addTheme={addTheme}/>
                </div>
                <div className='row mx-0'>
                    <div className='col-12 mt-3'>
                        <div className='card'>
                            <div className='card-body d-flex flex-column'>
                                <div className='row'>
                                    <div className='col-7 col-lg-9 col-xl-10'>
                                        <h1>{getFromStore('store.titles.fillHints', settings.language)}</h1>
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
                </div>
                <div className='row mx-0 mb-3'>
                    <CreditButton
                        name={'500'}
                        id={'credit500'}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}/>
                    <CreditButton
                        name={'1500'}
                        id={'credit1500'}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}/>
                    <CreditButton
                        name={'2500'}
                        id={'credit2500'}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}/>
                    <CreditButton
                        name={'5000'}
                        id={'credit5000'}
                        setErrorText={setErrorText}
                        setSuccessText={setSuccessText}
                        setLoading={setLoading}/>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button size="lg" variant="secondary" onClick={handleRestore}>
                    {getFromStore('store.restore', settings.language)}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
