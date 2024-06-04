import { FC, ReactNode, createContext, useState } from 'react';

export const UpdateContext = createContext<{
    shouldUpdate: boolean
    setShouldUpdate: (update: boolean) => void
    keybindUpdate: number
    updateKeybind: () => void
        }>({
            shouldUpdate: false,
            setShouldUpdate: (update: boolean) => { console.log('DEFAULT STILL RUN', update); },
            keybindUpdate: 0,
            updateKeybind: () => { console.log('DEFAULT STILL RUN'); }
        });

interface UpdateProviderProps {
    children?: ReactNode
}

export const UpdateProvider: FC<UpdateProviderProps> = ({
    children
}) => {
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
    const [keybindUpdate, setKeybindUpdate] = useState<number>(0);

    const updateKeybind = () => {
        setKeybindUpdate((keybindUpdate) => {
            return keybindUpdate + 1;
        });
    };

    return (
        <UpdateContext.Provider
            value={{
                shouldUpdate,
                setShouldUpdate,
                keybindUpdate,
                updateKeybind
            }}
        >
            {children}
        </UpdateContext.Provider>
    );
};
  
