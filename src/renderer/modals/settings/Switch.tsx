import { useState, useContext } from 'react';
import { SettingsContext } from '../../providers/SettingsProvider';
import { getFromStore } from '../../language';

export interface SwitchProps {
  title: string
  defaultValue: boolean
  className: string
  onChange: (value: boolean) => void
}

export const Switch = ({
    title,
    defaultValue,
    className,
    onChange
}: SwitchProps) => {
    const { settings } = useContext(SettingsContext);
    const [value, setValue] = useState<boolean>(defaultValue);

    const onChangeInside = () => {
        const newValue = !value;
        setValue(newValue);
        onChange(newValue);
    };

    return <div className={className}>
        <div className="form-check form-switch form-switch-lg">
            <input className="form-check-input" type="checkbox" role="switch" onChange={onChangeInside} checked={value}/>
            <label className="form-check-label h5 pt-2 mb-0 ps-3">
                {getFromStore(title, settings.language)}
            </label>
        </div>
    </div>;
};
