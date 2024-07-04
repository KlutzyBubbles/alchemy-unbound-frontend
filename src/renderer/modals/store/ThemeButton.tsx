import { type FC, useContext, Dispatch, SetStateAction, useState } from 'react';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { getFromStore, getObjectFromStore } from '../../language';
import { ItemRenderer } from '../../ItemRenderer';
import { mockElement } from '../../utils';
import { ItemTypes } from '../../types';
import { ErrorCodeToString } from '../../../common/types';
import { TxnItems } from '../../../common/server';


export interface ThemeButtonProps {
    name: string
    id: string
    emoji: string
    unlocked: boolean
    setErrorText: Dispatch<SetStateAction<string>>
    setSuccessText: Dispatch<SetStateAction<string>>
    setLoading: Dispatch<SetStateAction<boolean>>
    addTheme: (theme: string) => void
}

export const ThemeButton: FC<ThemeButtonProps> = ({
    name,
    id,
    emoji,
    unlocked,
    setErrorText,
    setSuccessText,
    setLoading,
    addTheme
}) => {
    const { settings } = useContext(SettingsContext);
    const [purchased, setPurchased] = useState<boolean>(false);

    const purchaseTheme = async (theme: string) => {
        console.log('theme purchase', theme);
        try {
            setLoading(true);
            setErrorText('');
            setSuccessText('');
            const result = await window.ServerAPI.initTransaction(theme);
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
                    setPurchased(true);
                    addTheme(theme);
                    window.InfoAPI.addTheme(theme);
                }
            }
        } catch (e) {
            logger.error('Failed to purchase theme', e);
            setErrorText(e.message);
            setLoading(false);
        }
    };
    // <img src={`image://${id}/title.png`} className='card-img-top p-3' alt='Sand'/>
    // <h1 className='text-center py-3'>Beach</h1>
    // <p className='card-text'>{getFromStore(`store.descriptions.${id}`, settings.language)}</p>
    return (
        <div className='col-12 col-lg-4 d-flex align-items-stretch'>
            <div className={`card theme-box theme-${name} w-100`}>
                <img src={`image://${id}/title.png`} className='card-img-top p-3 pb-2' alt='Sand'/>
                <div className='card-body d-flex flex-column'>
                    <ItemRenderer
                        theme={name}
                        element={mockElement({
                            name: name,
                            display: getObjectFromStore(`store.titles.${id}`, id),
                            emoji: emoji,
                            depth: 0,
                            first: 0,
                            who_discovered: '',
                            base: 1
                        })}
                        type={ItemTypes.RECIPE_ELEMENT}
                        dragging={false}/>
                    <div className='row footer mt-auto pt-3'>
                        <div className='col-12 d-grid'>
                            <div className={`btn btn-${unlocked || purchased ? 'secondary disabled' : 'success'} btn-lg user-select-none`} onClick={() => purchaseTheme(id)}>
                                {unlocked || purchased ? getFromStore('store.purchasedButton', settings.language) : `USD ${(new Intl.NumberFormat('en-US', {
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
