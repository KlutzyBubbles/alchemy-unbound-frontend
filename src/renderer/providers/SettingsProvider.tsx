import { FC, ReactNode, createContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, Settings } from '../../common/settings';

export const SettingsContext = createContext<{
    settings: Settings,
    setSettings: (settings: Settings) => void,
        }>({
            settings: DEFAULT_SETTINGS,
            setSettings: (settings: Settings) => { console.log('DEFAULT STILL RUN', settings); }
        });

interface SettingsProviderProps {
    children?: ReactNode
}

export const SettingsProvider: FC<SettingsProviderProps> = ({
    children
}) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        (async () => {
            await window.SettingsAPI.setSettings(settings);
        })();
    }, [settings]);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setSettings
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
  
