import { createContext } from 'react';
import { DEFAULT_SETTINGS, Settings } from '../common/settings';

export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);
