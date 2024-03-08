import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsProvider';

export const LoadingContext = createContext<{
    loading: boolean
}>({
    loading: true
});

interface SettingsProviderProps {
    children?: ReactNode
}

export const LoadingProvider: FC<SettingsProviderProps> = ({
    children
}) => {
    const { setSettings } = useContext(SettingsContext);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const settings = await window.SettingsAPI.getSettings();
                console.log('loading done', settings);
                if (settings === undefined || settings === null) {
                    throw new Error('getSettings returned undefined');
                }
                // if (!settings.languageSet) {
                //     const steamLanguage = await window.SteamAPI.getSteamGameLanguage();
                //     settings.language = steamLanguage;
                //     settings.languageSet = true;
                // }
                setSettings(settings);
            } catch (e) {
                console.error('Failed to load settings (oops)');
                console.error(e);
            }
            setLoading(false);
        })();
    }, []);

    return (
        <LoadingContext.Provider
            value={{
                loading
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
};
  