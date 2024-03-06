import { FC, ReactNode, createContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, Settings } from '../../common/settings';

export const SettingsContext = createContext<{
    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>
}>({
    settings: DEFAULT_SETTINGS,
    setSettings: () => {}
});

interface SettingsProviderProps {
    children?: ReactNode
}

export const SettingsProvider: FC<SettingsProviderProps> = ({
    children
}) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const settings = await window.SettingsAPI.getSettings();
    //             console.log(settings);
    //             if (settings === undefined || settings === null) {
    //                 throw new Error('getSettings returned undefined');
    //             }
    //             setSettings(settings);
    //         } catch (e) {
    //             console.error('Failed to load settings (oops)');
    //             console.error(e);
    //         }
    //     })();
    // }, []);

    useEffect(() => {
        window.SettingsAPI.setSettings(settings);
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
  
