import { type FC, useState, useRef, useEffect, useContext } from 'react';
import { getFromStore } from '../../language';
import { SettingsContext } from '../../providers/SettingsProvider';

export interface CountdownItemProps {
    date: Date,
    onComplete: () => void
}

export const CountdownItem: FC<CountdownItemProps> = ({
    date,
    onComplete
}) => {
    const { settings } = useContext(SettingsContext);
    const [days, setDays] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);
    const [complete, setComplete] = useState<boolean>(false);
    const timer = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        runTimeUpdate(date);
        return () => {
            if (timer.current !== undefined) {
                clearInterval(timer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (timer.current !== undefined) {
            clearInterval(timer.current);
        }
        const timerTemp = setInterval(() => runTimeUpdate(date), 16);
        timer.current = timerTemp;
    }, [date]);

    const runTimeUpdate = (deadline: Date) => {
        const time = deadline.getTime() - (new Date()).getTime();
        if (time <= 1000) {
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
            if (!complete) {
                onComplete();
            }
            setComplete(true);
        } else {
            const seconds = Math.floor((time / 1000) % 60);
            const minutes = Math.floor((time / 1000 / 60) % 60);
            const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
            const days = Math.floor(time / (1000 * 60 * 60 * 24));
            setDays(days);
            setHours(hours);
            setMinutes(minutes);
            setSeconds(seconds);
            setComplete(false);
        }
    };

    return (
        <div className='dropdown-item text-body disabled'>
            {complete ? 'Waiting...' : 
                days > 0 ?
                    `${days} ${getFromStore('timer.days', settings.language)}, ${hours} ${getFromStore('timer.hours', settings.language)}, ${minutes} ${getFromStore('timer.minutes', settings.language)}`
                    : 
                    `${hours} ${getFromStore('timer.hours', settings.language)}, ${minutes} ${getFromStore('timer.minutes', settings.language)}, ${seconds} ${getFromStore('timer.seconds', settings.language)}`}
        </div>
    );
};
