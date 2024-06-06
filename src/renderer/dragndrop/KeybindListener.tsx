import type { FC } from 'react';
import { useContext, useEffect } from 'react';
import logger from 'electron-log/renderer';
import { SettingsContext } from '../providers/SettingsProvider';

export interface KeybindListenerProps {
    setCopyHeld: (held: boolean) => void
    setRemoveHeld: (held: boolean) => void
    onLockClick: () => void
}

export const KeybindListener: FC<KeybindListenerProps> = ({
    setCopyHeld,
    setRemoveHeld,
    onLockClick
}) => {
    const { settings, setSettings } = useContext(SettingsContext);

    useEffect(() => {
        console.log('Keybind mount', settings.keybinds);
        document.addEventListener('keydown', handleKeyDown, false);
        document.addEventListener('keyup', handleKeyUp, false);
        return () => {
            console.log('Keybind unmount', settings.keybinds);
            document.removeEventListener('keydown', handleKeyDown, false);
            document.removeEventListener('keyup', handleKeyUp, false);
        };
    }, []);

    const handleKeyDown: EventListenerOrEventListenerObject = (e) => {
        //console.log('keydown', e, settings.keybinds);
        const event = e as KeyboardEvent;
        if (event.key === settings.keybinds.copy) {
            setCopyHeld(true);
        }
        if (event.key === settings.keybinds.remove) {
            setRemoveHeld(true);
        }
        if (event.key === settings.keybinds.lock) {
            onLockClick();
        }
    };

    const handleKeyUp: EventListenerOrEventListenerObject = async (e) => {
        //console.log('keyup', e);
        const event = e as KeyboardEvent;
        if (event.key === settings.keybinds.copy) {
            setCopyHeld(false);
        }
        if (event.key === settings.keybinds.remove) {
            setRemoveHeld(false);
        }
        if (event.key === 'F11') {
            try {
                const isFullscreen = await window.DisplayAPI.isFullscreen();
                window.DisplayAPI.setFullscreen(!isFullscreen);
                setSettings({
                    ...settings,
                    fullscreen: !isFullscreen
                });
            } catch (e) {
                logger.error('Failed to change fullscreen', e);
            }
        }
    };

    return <></>;
};
