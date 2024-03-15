import { FC, ReactNode, createContext, useEffect, useState } from 'react';
import { DEFAULT_STATS, Stats } from '../../common/stats';

export const StatsContext = createContext<{
    stats: Stats,
    setStats: (stats: Stats) => void,
        }>({
            stats: DEFAULT_STATS,
            setStats: (stats: Stats) => { console.log('DEFAULT STILL RUN', stats); }
        });

interface StatsProviderProps {
    children?: ReactNode
}

export const StatsProvider: FC<StatsProviderProps> = ({
    children
}) => {
    const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

    useEffect(() => {
        (async () => {
            // console.log('Stats updated to', stats);
            await window.StatsAPI.setStats(stats);
            // await window.StatsAPI.saveStats();
        })();
    }, [stats]);

    return (
        <StatsContext.Provider
            value={{
                stats,
                setStats
            }}
        >
            {children}
        </StatsContext.Provider>
    );
};
  
