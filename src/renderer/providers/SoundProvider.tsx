import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SoundFile, SoundFiles } from '../../common/types';
import { SettingsContext } from './SettingsProvider';
import { clamp } from '../../common/utils';
import { Howl } from 'howler';

export const SoundContext = createContext<{
    playSound: (sound: SoundFile, multiplier?: number) => void
        }>({
            playSound: () => {}
        });

interface SoundProviderProps {
    children?: ReactNode
}

export const SoundProvider: FC<SoundProviderProps> = ({
    children
}) => {
    const { settings } = useContext(SettingsContext);
    const [audio, setAudio] = useState<{ [K in SoundFile]: Howl}>({
        'first-discovery': undefined,
        'new-discovery': undefined,
        'pickup': undefined,
        'side-drop': undefined,
        'drop': undefined,
        'reset': undefined,
    });
    const playSound = (sound: SoundFile, multiplier?: number) => {
        const foundAudio = audio[sound];
        if (foundAudio !== undefined && !settings.muted) {
            foundAudio.volume(clamp(settings.volume * (multiplier ?? 1), 0, 1));
            foundAudio.play();
        }
    };

    useEffect(() => {
        const tempAudio: { [K in SoundFile]: Howl} = {
            'first-discovery': undefined,
            'new-discovery': undefined,
            'pickup': undefined,
            'side-drop': undefined,
            'drop': undefined,
            'reset': undefined,
        };
        for (const sound of SoundFiles) {
            const newAudio = new Howl({
                src: `sound://${sound}.mp3`
            });
            tempAudio[sound] = newAudio;
        }
        setAudio(tempAudio);
    }, []);

    return (
        <SoundContext.Provider
            value={{
                playSound
            }}
        >
            {children}
        </SoundContext.Provider>
    );
};
  
