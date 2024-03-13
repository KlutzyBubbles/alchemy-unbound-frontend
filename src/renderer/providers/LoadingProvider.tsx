import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsProvider';
import logger from 'electron-log/renderer';

export const LoadingContext = createContext<{
    loading: boolean
}>({
    loading: true
});

interface LoadingProviderProps {
    children?: ReactNode
}

export const LoadingProvider: FC<LoadingProviderProps> = ({
    children
}) => {
    const { setSettings } = useContext(SettingsContext);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const settings = await window.SettingsAPI.getSettings();
                if (settings === undefined || settings === null) {
                    throw new Error('getSettings returned undefined');
                }
                setSettings(settings);
            } catch (e) {
                logger.error('Failed to load settings in loader (oops)', e);
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
  
