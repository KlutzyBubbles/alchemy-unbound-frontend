import { useState, useContext, ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { SettingsContext } from '../../providers/SettingsProvider';
import { getFromStore } from '../../language';

export interface MainSelectorProps<T> {
  title: string
  defaultValue: T
  values: T[]
  onChange: (value: T) => void
  getDisplay: (value: T) => string
}

export const MainSelector = <T,>({
    title,
    defaultValue,
    values,
    onChange,
    getDisplay
}: MainSelectorProps<T>) => {
    const { settings } = useContext(SettingsContext);
    const [value, setValue] = useState<T>(defaultValue);

    const onChangeInside: ChangeEventHandler<HTMLSelectElement> = (e) => {
        setValue(e.currentTarget.value as T);
        onChange(e.currentTarget.value as T);
    };

    return <div className='row mb-4'>
        <div className='col-6 col-md-5 col-lg-3 pt-1'>
            <h3 className='text-end'>{getFromStore(title, settings.language)}</h3>
        </div>
        <div className='col-6 col-md- col-lg-9'>
            <Form.Select size='lg' aria-label="Background" onChange={onChangeInside} value={`${value}`}>
                {values.map((v) => {
                    return (<option
                        key={`${v}`}
                        value={`${v}`}>
                        {getDisplay(v)}
                    </option>);
                })}
            </Form.Select>
        </div>
    </div>;
};
