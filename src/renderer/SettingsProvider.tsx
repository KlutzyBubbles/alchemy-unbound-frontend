import { FC, ReactNode, createContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, Settings } from '../common/settings';

export const SettingsContext = createContext<{
    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>
}>({
    settings: DEFAULT_SETTINGS,
    setSettings: (_: Settings) => {}
});

interface SettingsProviderProps {
    value: Settings
    children?: ReactNode
}

export const SettingsProvider: FC<SettingsProviderProps> = ({
    value,
    children
}) => {
    const [settings, setSettings] = useState<Settings>(null);

    useEffect(() => {
      console.log('value')
      console.log(value)
      setSettings(value)
    }, [])

    useEffect(() => {
      window.SettingsAPI.setSettings(settings)
    }, [settings])

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
  }
  
