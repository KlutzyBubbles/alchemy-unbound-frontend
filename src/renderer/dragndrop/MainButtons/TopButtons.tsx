import { useContext, type FC, useState, useEffect, useRef, Fragment } from 'react';
import { IoMenuOutline } from 'react-icons/io5';
import { ModalOption } from '../../Container';
import { CreditInfo } from './Credits';
import { getFromStore, getObjectFromStore } from '../../language';
import { SettingsContext } from '../../providers/SettingsProvider';
import { InfoContext } from '../../providers/InfoProvider';
import { MissionStore } from '../../../common/types/saveFormat';
import logger from 'electron-log/renderer';
import { mockElement } from '../../utils';
import { ItemTypes } from '../../types';
import { ItemRenderer } from '../../ItemRenderer';
import { MissionItem } from './MissionItem';
import { MissionDifficulty } from '../../../common/mission';
import { CountdownItem } from './CountdownItem';
import { SoundContext } from '../../providers/SoundProvider';

export interface TopButtonProps {
    openModal: (option: ModalOption) => void
    refreshRecipes: () => void,
    clearAll: () => void,
    credits: number,
    refresh: number
}

export const TopButtons: FC<TopButtonProps> = ({
    openModal,
    refreshRecipes,
    clearAll,
    credits,
    refresh
}) => {
    const { playSound } = useContext(SoundContext);
    const { settings } = useContext(SettingsContext);
    const { fileVersions } = useContext(InfoContext);
    const [mission, setMission] = useState<MissionStore>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedMission, setSelectedMission] = useState<MissionDifficulty>(undefined);
    const [missionDropdownOpen, setMissionDropdownOpen] = useState(false);
    const missionButtonRef = useRef(undefined);

    useEffect(() => {
        if (missionButtonRef.current !== undefined && missionButtonRef.current !== null) {
            missionButtonRef.current.addEventListener('hide.bs.dropdown', () => {
                setMissionDropdownOpen(false);
            });
            missionButtonRef.current.addEventListener('show.bs.dropdown', () => {
                setMissionDropdownOpen(true);
            });
        }
        return () => {
            if (missionButtonRef.current !== undefined && missionButtonRef.current !== null) {
                missionButtonRef.current.removeEventListener('hide.bs.dropdown');
                missionButtonRef.current.removeEventListener('show.bs.dropdown');
            }
        };
    }, []);

    const refreshMission = async () => {
        try {
            setLoading(true);
            logger.info('Refreshing missions');
            const type = fileVersions.databaseInfo.type;
            if (type === 'daily' || type === 'weekly') {
                const mission = await window.ServerAPI.getMission(type);
                logger.info('missions', mission, type);
                if (mission.type === 'error') {
                    logger.error('Issue with mission response', mission);
                } else {
                    setMission(mission.result);
                    if (mission.result.refreshed) {
                        await window.RecipeAPI.syncInfo();
                        clearAll();
                        refreshRecipes();
                    }
                }
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            logger.error('Error getting mission', error);
        }
    };

    useEffect(() => {
        refreshMission();
    }, [refresh, fileVersions]);

    useEffect(() => {
        if (missionDropdownOpen && mission === undefined) {
            refreshMission();
        }
    }, [missionDropdownOpen]);

    const onTimeComplete = () => {
        console.log('compelte');
        setLoading(true);
        setTimeout(refreshMission, 1000);
    };

    return (
        <div className='z-mainButtons d-flex'>
            <div
                className='btn btn-no-outline float-start mb-2 fs-1 d-flex flex-shrink-1 p-2 z-mainButtons'
                data-bs-toggle="offcanvas" data-bs-target="#sideMenu"><IoMenuOutline /></div>
            {fileVersions.databaseInfo.type === 'daily' || fileVersions.databaseInfo.type === 'weekly' ? 
                <div className='flex-grow-1 text-center dropdown-center pt-2'
                    ref={missionButtonRef}
                    data-bs-display="static">
                    {mission === undefined || selectedMission === undefined ? 
                        <ItemRenderer
                            element={mockElement({
                                name: fileVersions.databaseInfo.type,
                                display: getObjectFromStore(`saves.${fileVersions.databaseInfo.type}`, fileVersions.databaseInfo.type),
                                emoji: '🎯',
                                depth: 0,
                                first: 0,
                                who_discovered: '',
                                base: 1
                            })}
                            type={ItemTypes.RECIPE_ELEMENT}
                            dragging={false}
                            onClick={() => {
                                playSound('drop', 0.5);
                                setMissionDropdownOpen(!missionDropdownOpen);
                            }}
                            data-bs-toggle="dropdown"
                            aria-expanded="false"/>
                        :
                        <MissionItem store={mission[selectedMission]} type={selectedMission} isItem={false} onClick={() => setMissionDropdownOpen(!missionDropdownOpen)} />
                    }
                    <div className={`dropdown-menu ${ missionDropdownOpen ? 'show' : '' }`}>
                        {loading ? <Fragment>
                            <div className='d-flex justify-content-center'>
                                <div className='spinner-border' role='status'>
                                    <span className='visually-hidden'>Loading...</span>
                                </div>
                            </div>
                        </Fragment> : mission === undefined ? <div className='dropdown-item'><h4>No Mission</h4></div> :
                            <Fragment>
                                <CountdownItem date={new Date(new Date(mission.expires).getTime())} onComplete={onTimeComplete} />
                                <MissionItem store={mission.easy} type={'easy'} isItem={true} onClick={() => setSelectedMission('easy')} />
                                <MissionItem store={mission.medium} type={'medium'} isItem={true} onClick={() => setSelectedMission('medium')} />
                                <MissionItem store={mission.hard} type={'hard'} isItem={true} onClick={() => setSelectedMission('hard')} />
                                <MissionItem store={mission.random} type={'random'} isItem={true} onClick={() => setSelectedMission('random')} />
                            </Fragment>}
                    </div>
                </div>
                :
                <div className='flex-grow-1 text-body-secondary mt-3'>
                    <h4 className='text-center user-select-none'>{getFromStore(`saves.${fileVersions.databaseInfo.type}`, settings.language)}</h4>
                </div>
            }
            
            <CreditInfo openModal={openModal} credits={credits}/>
        </div>
    );
};// (fileVersions.databaseInfo.type === 'weekly' ? 7 : 1) * 24 * 
