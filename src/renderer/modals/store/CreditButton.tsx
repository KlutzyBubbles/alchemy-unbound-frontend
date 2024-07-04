import { type FC, useContext, Dispatch, SetStateAction } from 'react';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { getFromStore } from '../../language';
import { ErrorCodeToString } from '../../../common/types';
import { TxnItems } from '../../../common/server';


export interface CreditButtonProps {
    name: string
    id: string
    setErrorText: Dispatch<SetStateAction<string>>
    setSuccessText: Dispatch<SetStateAction<string>>
    setLoading: Dispatch<SetStateAction<boolean>>
    refreshValues: () => void
}

export const CreditButton: FC<CreditButtonProps> = ({
    name,
    id,
    setErrorText,
    setSuccessText,
    setLoading,
    refreshValues
}) => {
    const { settings } = useContext(SettingsContext);

    const purchaseCredit = async (credit: string) => {
        console.log('credit purchase', credit);
        try {
            setLoading(true);
            setErrorText('');
            setSuccessText('');
            const result = await window.ServerAPI.initTransaction(credit);
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
                    refreshValues();
                }
            }
        } catch (e) {
            logger.error('Failed to purchase credit', e);
            setErrorText(e.message);
            setLoading(false);
        }
    };

    return (
        <div className='col-12 mt-3'>
            <div className={`card credit-card credit-${id} credit-${name}`}>
                <div className='card-body d-flex flex-column'>
                    <div className='row'>
                        <div className='col-7 col-lg-9 col-xl-10'>
                            <h1 className='title mb-1 user-select-none'>{name} {getFromStore('store.titles.credits', settings.language)}</h1>
                        </div>
                        <div className='col-5 col-lg-3 col-xl-2 d-grid'>
                            <div className='btn btn-success btn-lg user-select-none' onClick={() => purchaseCredit(id)}>
                                {`USD ${(new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                })).format(TxnItems[id].amount / 100)}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
