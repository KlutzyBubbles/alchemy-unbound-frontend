import { FC, ReactNode, createContext, useState } from 'react';
import { DEFAULT_FILE_VERSIONS, FileVersions } from '../../common/types';

export const InfoContext = createContext<{
    isLegacy: boolean
    setIsLegacy: (isLegacy: boolean) => void
    isProduction: boolean
    setIsProduction: (isProduction: boolean) => void
    hasSupporterTheme: boolean
    setHasSupporterTheme: (hasSupporterTheme: boolean) => void
    hasHintCheat: boolean
    setHasHintCheat: (hasHintCheat: boolean) => void
    fileVersions: FileVersions
    setFileVersions: (fileVersions: FileVersions) => void
        }>({
            isLegacy: true,
            setIsLegacy: (isLegacy: boolean) => { console.log('DEFAULT STILL RUN', isLegacy); },
            isProduction: true,
            setIsProduction: (isProduction: boolean) => { console.log('DEFAULT STILL RUN', isProduction); },
            hasSupporterTheme: true,
            setHasSupporterTheme: (hasSupporterTheme: boolean) => { console.log('DEFAULT STILL RUN', hasSupporterTheme); },
            hasHintCheat: true,
            setHasHintCheat: (hasHintCheat: boolean) => { console.log('DEFAULT STILL RUN', hasHintCheat); },
            fileVersions: DEFAULT_FILE_VERSIONS,
            setFileVersions: (fileVersions: FileVersions) => { console.log('DEFAULT STILL RUN', fileVersions); }
        });

interface InfoProviderProps {
    children?: ReactNode
}

export const InfoProvider: FC<InfoProviderProps> = ({
    children
}) => {
    const [isProduction, setIsProduction] = useState<boolean>(true);
    const [isLegacy, setIsLegacy] = useState<boolean>(false);
    const [hasSupporterTheme, setHasSupporterTheme] = useState<boolean>(false);
    const [hasHintCheat, setHasHintCheat] = useState<boolean>(false);
    const [fileVersions, setFileVersions] = useState<FileVersions>(DEFAULT_FILE_VERSIONS);

    return (
        <InfoContext.Provider
            value={{
                isLegacy,
                setIsLegacy,
                isProduction,
                setIsProduction,
                hasSupporterTheme,
                setHasSupporterTheme,
                hasHintCheat,
                setHasHintCheat,
                fileVersions,
                setFileVersions
            }}
        >
            {children}
        </InfoContext.Provider>
    );
};
  
