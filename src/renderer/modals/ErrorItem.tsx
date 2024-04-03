import { useState, type FC, useContext } from 'react';
import { ErrorCodeToString, ErrorEntry, ServerErrorCode } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import { getFromStore } from '../language';
import { Collapse } from 'react-bootstrap';
import { IoArrowDownOutline, IoArrowUpOutline } from '../icons/io5';


export interface ErrorItemProps {
  error: ErrorEntry
}

export const ErrorItem: FC<ErrorItemProps> = ({
    error,
}) => {
    const { settings } = useContext(SettingsContext);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    return (
        <li key={error.date.getMilliseconds()} className="list-group-item list-group-item-danger d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
                <div className="fw-bold">
                    {error.date.toLocaleString()}
                    &nbsp;-&nbsp;{getFromStore(`${error.type}Error`, settings.language)}
                    &nbsp;{error.a !== undefined || error.b !== undefined ? 
                        `(${error.a === undefined ? '' : `a: '${error.a}'`}${error.a !== undefined && error.b !== undefined ? ', ' : ''}${error.b === undefined ? '' : `b: '${error.b}'`})` : ''}
                </div>
                {error.message === undefined ? '' : (
                    <div
                        className='btn btn-sm btn-advanced'
                        onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? <IoArrowUpOutline/> : <IoArrowDownOutline/>}
                    </div>
                )}
                {getFromStore(ErrorCodeToString[error.code], settings.language)}
                &nbsp;{[
                    ServerErrorCode.QUERY_INVALID,
                    ServerErrorCode.QUERY_MISSING,
                    ServerErrorCode.QUERY_UNDEFINED,
                    ServerErrorCode.AB_NOT_KNOWN,
                    ServerErrorCode.ITEM_UNKNOWN
                ].includes(error.code as number) ? `(${getFromStore('tryUpdatingOrReport', settings.language)})` : 
                    [
                        ServerErrorCode.STEAM_TICKET_INVALID,
                        ServerErrorCode.TOKEN_EXPIRED,
                    ].includes(error.code as number) ? `(${getFromStore('tryUpdatingOrAgain', settings.language)})` : ''}
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
