import { FC, ReactNode, createContext, useState } from 'react';

export const InfoContext = createContext<{
    isProduction: boolean
    setIsProduction: (isProduction: boolean) => void
    hasSupporterTheme: boolean
    setHasSupporterTheme: (hasSupporterTheme: boolean) => void
    hasHintCheat: boolean
    setHasHintCheat: (hasHintCheat: boolean) => void
        }>({
            isProduction: true,
            setIsProduction: (isProduction: boolean) => { console.log('DEFAULT STILL RUN', isProduction); },
            hasSupporterTheme: true,
            setHasSupporterTheme: (hasSupporterTheme: boolean) => { console.log('DEFAULT STILL RUN', hasSupporterTheme); },
            hasHintCheat: true,
            setHasHintCheat: (hasHintCheat: boolean) => { console.log('DEFAULT STILL RUN', hasHintCheat); }
        });

interface InfoProviderProps {
    children?: ReactNode
}

export const InfoProvider: FC<InfoProviderProps> = ({
    children
}) => {
    const [isProduction, setIsProduction] = useState<boolean>(true);
    const [hasSupporterTheme, setHasSupporterTheme] = useState<boolean>(false);
    const [hasHintCheat, setHasHintCheat] = useState<boolean>(false);

    return (
        <InfoContext.Provider
            value={{
                isProduction,
                setIsProduction,
                hasSupporterTheme,
                setHasSupporterTheme,
                hasHintCheat,
                setHasHintCheat,
            }}
        >
            {children}
        </InfoContext.Provider>
    );
};
  
