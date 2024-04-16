import { useState, type FC, useEffect, useContext, Fragment } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import logger from 'electron-log/renderer';
import { ServerErrorCode } from '../../common/types';

export interface IdeaModalProps {
  show: boolean
  handleHide: () => void,
}

export const IdeaModal: FC<IdeaModalProps> = ({
    show,
    handleHide,
}) => {
    const { settings } = useContext(SettingsContext);
    const [errorText, setErrorText] = useState<string>('');
    const [successText, setSuccessText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [a, setA] = useState<string>('');
    const [b, setB] = useState<string>('');
    const [result, setResult] = useState<string>('');

    useEffect(() => {
        (async() => {
            
        })();
    }, []);

    const submitIdea = async () => {
        setErrorText('');
        setSuccessText('');
        setLoading(true);
        if (a.length < 3 || a.length > 256 || b.length < 3 || b.length > 256 || result.length < 3 || result.length > 256) {
            setErrorText(getFromStore('idea.inputInvalid', settings.language));
            setLoading(false);
        } else {
            try {
                const output = await window.ServerAPI.submitIdea(a, b, result);
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
                            if (errorCode === ServerErrorCode.MAX_DEPTH) {
                                logger.debug(`Idea a/b/result already exists '${a}', '${b}', '${result}'`);
                                setSuccessText(getFromStore('idea.submitted', settings.language));
                                setA('');
                                setB('');
                                setResult('');
                            } else {
                                logger.error(`Idea a/b/result unknown error '${a}', '${b}', '${result}'`);
                                setErrorText(getFromStore('errors.unknownError', settings.language));
                            }
                            await window.ErrorAPI.registerError({
                                a: a,
                                b: b,
                                result: result,
                                type: 'idea',
                                code: errorCode
                            });
                            setLoading(false);
                        }
                    } else {
                        if (output === undefined) {
                            logger.debug('Idea failed in offline mode (two)');
                            setErrorText(getFromStore('errors.offline', settings.language));
                        } else {
                            setSuccessText(getFromStore('idea.submitted', settings.language));
                            setA('');
                            setB('');
                            setResult('');
                        }
                        setLoading(false);
                    }
                }
            } catch (e) {
                logger.error('Unknown error on idea', e);
                setErrorText(getFromStore('errors.unknownError', settings.language));
                setLoading(false);
            }
        }
    };

    return (
        <Fragment>
            <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.theme}>
                <Modal.Header closeButton data-bs-theme={settings.theme}>
                    <Modal.Title>{getFromStore('idea.title', settings.language)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <div className='row mb-2'>
                            <div className='col-12'>
                                <p className='text-center'>{getFromStore('idea.text', settings.language)}</p>
                            </div>
                        </div>
                        <div className='row mb-4'>
                            <div className='col-5 col-md-3 col-lg-3'>
                                <input
                                    type="text"
                                    className="form-control override-focus"
                                    disabled={loading}
                                    value={a}
                                    onChange={(e) => setA(e.currentTarget.value)}
                                    placeholder={getFromStore('idea.a', settings.language)}/>
                            </div>
                            <div className='col-2 col-md-1'>
                                <h3>+</h3>
                            </div>
                            <div className='col-5 col-md-3 col-lg-3'>
                                <input
                                    type="text"
                                    className="form-control override-focus"
                                    disabled={loading}
                                    value={b}
                                    onChange={(e) => setB(e.currentTarget.value)}
                                    placeholder={getFromStore('idea.b', settings.language)}/>
                            </div>
                            <div className='col-12 col-md-1'>
                                <h3>=</h3>
                            </div>
                            <div className='col-12 col-md-4 col-lg-4'>
                                <input
                                    type="text"
                                    className="form-control override-focus"
                                    disabled={loading}
                                    value={result}
                                    onChange={(e) => setResult(e.currentTarget.value)}
                                    placeholder={getFromStore('idea.result', settings.language)}/>
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
                        {getFromStore('idea.buttons.cancel', settings.language)}
                    </Button>
                    <Button variant="primary" onClick={submitIdea}>
                        {loading ? (<div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>) : getFromStore('idea.buttons.submit', settings.language)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};
