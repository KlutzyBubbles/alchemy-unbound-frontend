import { useState, useContext } from 'react';
import { SettingsContext } from '../../providers/SettingsProvider';
import { getFromStore } from '../../language';
import { KEY_VALUES_TO_LEAVE } from '../../types';
import { IoRefreshOutline } from 'react-icons/io5';
import { Button } from 'react-bootstrap';

export interface KeybindSelectorProps {
  title: string
  defaultValue: string
  resetValue: string
  onChange: (value: string) => void
}

export const KeybindSelector = ({
    title,
    defaultValue,
    resetValue,
    onChange
}: KeybindSelectorProps) => {
    const { settings } = useContext(SettingsContext);
    const [value, setValue] = useState<string>(defaultValue);

    const onChangeInside = (key: string) => {
        setValue(key);
        onChange(key);
    };

    const setKeybind = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log('keybiiiinid', event);
        event.preventDefault();
        let key = event.key;
        if (key === 'Unidentified') {
            key = resetValue;
        }
        onChangeInside(key);
    };
    
    const getReadable = (key: string): string => {
        if (KEY_VALUES_TO_LEAVE.includes(key)) {
            return key;
        }
        if (key === ' ') {
            return 'Space';
        }
        return key.toLocaleUpperCase();
    };

    return <div className='row mb-4'>
        <div className='col-6 col-md-5 col-lg-3'>
            <h5 className='text-end'>{getFromStore(title, settings.language)}</h5>
        </div>
        <div className='col-5 col-md-6 col-lg-8'>
            <input
                type="text"
                className="form-control override-focus"
                onFocus={() => console.log('focus11111')}
                value={getReadable(value)}
                onChange={() => {}} // here for error
                onKeyDown={(e) => setKeybind(e)}
                placeholder={getFromStore(title, settings.language)}/>
        </div>
        <div className='col-1 px-0'>
            <Button variant="danger" onClick={() => onChangeInside(resetValue)}>
                <IoRefreshOutline/>
            </Button>
        </div>
    </div>;
};
