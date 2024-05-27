import { useState, type FC, useEffect, useContext, Fragment } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import logger from 'electron-log/renderer';
import { ServerErrorCode } from '../../common/types';
import { DEFAULT_SETTINGS, Language, languageDisplay, languages } from '../../common/settings';

export interface ItemModalProps {
  show: boolean
  handleHide: () => void,
  refreshValues: () => void
}

export const ItemModal: FC<ItemModalProps> = ({
    show,
    handleHide,
    refreshValues
}) => {
    const { settings } = useContext(SettingsContext);
    const [errorText, setErrorText] = useState<string>('');
    const [successText, setSuccessText] = useState<string>('');
    const [language, setLanguage] = useState<Language>(settings?.language ?? DEFAULT_SETTINGS.language);
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string>('');

    useEffect(() => {
        (async() => {
            
        })();
    }, []);

    const onLanguageSelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setLanguage(e.target.value as Language);
    };

    const submitIdea = async () => {
        setErrorText('');
        setSuccessText('');
        setLoading(true);
        if (result.length < 1 || result.length > 256) {
            setErrorText(getFromStore('idea.inputInvalid', settings.language));
            setLoading(false);
        } else {
            try {
                const output = await window.ServerAPI.addItem(result, language);
                if (output === undefined) {
                    logger.debug('Idea failed in offline mode');
                    setErrorText(getFromStore('errors.offline', settings.language));
                    setLoading(false);
                } else {
                    if (output.type === 'error') {
                        /*
                        STEAM_TICKET_INVALID = 5,
                        TOKEN_EXPIRED = 6,
                        STEAM_SERVERS_DOWN = 7,
                        AB_NUMBER = 8,
                        MAX_DEPTH = 9,
                        STEAM_ERROR = 10,
                        ITEM_UNKNOWN = 11
                        TRANSLATION_ERROR = 12
                        */
                        const errorCode = output.result.code;
                        if (errorCode <= 7 || errorCode === ServerErrorCode.STEAM_ERROR) {
                            // Soft / Unknown error that shouldn't ever make it here.
                            logger.error(`Found error code ${errorCode} where it shouln't be. Please report this if you see it`);
                        } else {
                            logger.error(`Idea a/b/result unknown error '${result}'`);
                            setErrorText(getFromStore('errors.unknownError', settings.language));
                            await window.ErrorAPI.registerError({
                                a: '',
                                b: '',
                                result: result,
                                type: 'item',
                                code: errorCode
                            });
                            setLoading(false);
                        }
                    } else {
                        if (output === undefined) {
                            logger.debug('Idea failed in offline mode (two)');
                            setErrorText(getFromStore('errors.offline', settings.language));
                        } else {
                            setSuccessText(getFromStore('item.submitted', settings.language));
                            setResult('');
                        }
                        setLoading(false);
                        refreshValues();
                    }
                }
            } catch (e) {
                logger.error('Unknown error on item', e);
                setErrorText(getFromStore('errors.unknownError', settings.language));
                setLoading(false);
            }
        }
    };

    return (
        <Fragment>
            <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.theme}>
                <Modal.Header closeButton data-bs-theme={settings.theme}>
                    <Modal.Title>{getFromStore('item.title', settings.language)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className='row mb-2'>
                            <div className='col-12'>
                                <p className='text-center'>{getFromStore('item.text', settings.language)}</p>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-12 col-md-8'>
                                <input
                                    type="text"
                                    className="form-control override-focus"
                                    disabled={loading}
                                    value={result}
                                    onChange={(e) => setResult(e.currentTarget.value)}
                                    placeholder={getFromStore('item.item', settings.language)}/>
                            </div>
                            <div className='col-12 col-md-4'>
                                <Form.Select aria-label="Language" onChange={onLanguageSelect} value={language}>
                                    {languages.map((language) => {
                                        return (<option
                                            key={language}
                                            value={language}>
                                            {languageDisplay[language].native} ({languageDisplay[language].english})
                                        </option>);
                                    })}
                                </Form.Select>
                            </div>
                        </div>
                        <div className='row px-3'>
                            {errorText !== '' ?
                                <Alert variant="danger" onClose={() => setErrorText('')} dismissible>
                                    <span>{errorText}</span>
                                </Alert>
                                : (<Fragment/>)}
                        </div>
                        <div className='row px-3'>
                            {successText !== '' ?
                                <Alert variant="success" onClose={() => setSuccessText('')} dismissible>
                                    <span>{successText}</span>
                                </Alert>
                                : (<Fragment/>)}
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHide} className='me-auto'>
                        {getFromStore('item.buttons.cancel', settings.language)}
                    </Button>
                    <Button variant="primary" onClick={submitIdea}>
                        {loading ? (<div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>) : getFromStore('item.buttons.submit', settings.language)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};
