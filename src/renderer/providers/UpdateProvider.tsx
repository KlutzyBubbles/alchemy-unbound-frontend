import { FC, ReactNode, createContext, useState } from 'react';

export const UpdateContext = createContext<{
    shouldUpdate: boolean
    setShouldUpdate: (update: boolean) => void
        }>({
            shouldUpdate: false,
            setShouldUpdate: (update: boolean) => { console.log('DEFAULT STILL RUN', update); }
        });

interface UpdateProviderProps {
    children?: ReactNode
}

export const UpdateProvider: FC<UpdateProviderProps> = ({
    children
}) => {
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);

    const wrapper = (update: boolean) => {
        console.log('Update wreapper', update);
        setShouldUpdate(update);
    };

    return (
        <UpdateContext.Provider
            value={{
                shouldUpdate,
                setShouldUpdate: wrapper
            }}
        >
            {children}
        </UpdateContext.Provider>
    );
};
  
