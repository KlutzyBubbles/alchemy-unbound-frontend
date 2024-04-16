import { useState, type FC, useContext } from 'react';
import { ErrorCodeToString, ErrorEntry, ServerErrorCode } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import { Collapse } from 'react-bootstrap';
import { IoArrowDownOutline, IoArrowUpOutline } from 'react-icons/io5';


export interface ErrorItemProps {
  error: ErrorEntry
}

export const ErrorItem: FC<ErrorItemProps> = ({
    error,
}) => {
    const { settings } = useContext(SettingsContext);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    let prefix = '';
    let valueText = '';
    if (error.a !== undefined) {
        valueText += `${prefix}a: '${error.a}'`;
        prefix = ', ';
    }
    if (error.b !== undefined) {
        valueText += `${prefix}b: '${error.b}'`;
        prefix = ', ';
    }
    if (error.result !== undefined) {
        valueText += `${prefix}result: '${error.result}'`;
        prefix = ', ';
    }

    return (
        <li key={error.date.getMilliseconds()} className="list-group-item list-group-item-danger d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
                <div className="fw-bold">
                    {error.date.toLocaleString()}
                    &nbsp;-&nbsp;{getFromStore(`errors.${error.type}Error`, settings.language)}
                    &nbsp;{valueText}
                </div>
                {error.message === undefined ? '' : (
                    <div
                        className='btn btn-sm btn-advanced'
                        onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? <IoArrowUpOutline/> : <IoArrowDownOutline/>}
                    </div>
                )}
                {Object.keys(ErrorCodeToString).includes(`${error.code}`) ?
                    getFromStore(`errors.${ErrorCodeToString[error.code]}`, settings.language) :
                    getFromStore('errors.unknownError', settings.language)}
                &nbsp;{[
                    ServerErrorCode.QUERY_INVALID,
                    ServerErrorCode.QUERY_MISSING,
                    ServerErrorCode.QUERY_UNDEFINED,
                    ServerErrorCode.AB_NOT_KNOWN,
                    ServerErrorCode.ITEM_UNKNOWN,
                ].includes(error.code as number) ? `(${getFromStore('errors.tryUpdatingOrReport', settings.language)})` : 
                    [
                        ServerErrorCode.STEAM_TICKET_INVALID,
                        ServerErrorCode.TOKEN_EXPIRED,
                        ServerErrorCode.TRANSLATION_ERROR
                    ].includes(error.code as number) ? `(${getFromStore('errors.tryUpdatingOrAgain', settings.language)})` : ''}
                <Collapse in={showAdvanced}>
                    <div>
                        {error.message ?? ''}
                    </div>
                </Collapse>
            </div>
            <span className="badge text-bg-secondary rounded-pill">{error.code}</span>
        </li>
    );
};
