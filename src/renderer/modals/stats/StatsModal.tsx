import { useState, type FC, useEffect, useContext, Fragment } from 'react';
import { Collapse } from 'react-bootstrap';
import { AppVersions, DEFAULT_FILE_VERSIONS, ErrorEntry, FileVersions, LATEST_SERVER_VERSION, SystemVersion, UserSuccess } from '../../../common/types';
import { SettingsContext } from '../../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { HiOutlineWrenchScrewdriver, HiOutlineLockOpen } from 'react-icons/hi2';
import { getFromStore } from '../../language';
import { DEFAULT_STATS, Stats } from '../../../common/stats';
import { ErrorItem } from '../ErrorItem';
import { InfoContext } from '../../providers/InfoProvider';
import { ModalWrapper } from '../ModalWrapper';
import { StatsTable } from './StatTable';
import { unlockOnlineAchievements } from '../../utils/achievements';


export interface StatsModalProps {
  show: boolean
  handleHide: () => void
}

export const StatsModal: FC<StatsModalProps> = ({
    show,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);
    const { hasSupporterTheme, isLegacy, isProduction } = useContext(InfoContext);
    const [appVersions, setAppVersions] = useState<AppVersions>({ node: '', electron: '', chrome: '', app: ''});
    const [fileVersions, setFileVersions] = useState<FileVersions>(DEFAULT_FILE_VERSIONS);
    const [systemInformation, setSystemInformation] = useState<SystemVersion>({ arch: '', platform: '', version: '' });
    const [serverVersion, setServerVersion] = useState<number>(LATEST_SERVER_VERSION);
    const [serverEndpoint, setServerEndpoint] = useState<string>('UNKNONW');
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserSuccess | undefined>(undefined);
    const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
    const [name, setName] = useState<string>(undefined);
    const [errors, setErrors] = useState<ErrorEntry[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setAppVersions(await window.GenericAPI.getAppVersions());
                setFileVersions(await window.GenericAPI.getFileVersions());
                setSystemInformation(await window.GenericAPI.getSystemInformation());
                setServerVersion(await window.ServerAPI.getVersion());
                setServerEndpoint(await window.ServerAPI.getEndpoint());
            } catch (e) {
                logger.error('Failed to load system information', e);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (show) {
                try {
                    setStats(await window.StatsAPI.getStats());
                } catch (e) {
                    logger.error('Failed to load stats', e);
                }
                try {
                    setName(await window.SteamAPI.getUsername());
                } catch (e) {
                    logger.error('Failed to load steam name', e);
                }
                try {
                    setErrors(await window.ErrorAPI.getErrors());
                } catch (e) {
                    logger.error('Failed to load errors (ironic)', e);
                }
                try {
                    setLoading(true);
                    const result = await window.ServerAPI.getUserDetails();
                    if (result.type === 'error') {
                        setUser(undefined);
                        setLoading(false);
                        logger.error('Failed to load user check', result.result);
                    } else {
                        setUser(result.result as UserSuccess);
                        setLoading(false);
                    }
                } catch (e) {
                    setUser(undefined);
                    setLoading(false);
                    logger.error('Failed to load user', e);
                }
            }
        })();
    }, [show]);

    const footerContent = <Fragment>
        <div
            className='btn btn-sm btn-advanced float-start me-auto mb-2 fs-2 d-flex px-2 py-0'
            onClick={() => setAdvanced(!advanced)}>
            <h1 className='mx-2 my-0'><HiOutlineWrenchScrewdriver /><span className='fs-3 ms-3'>v{appVersions.app}</span></h1>
        </div>
        <div
            className='btn btn-sm btn-advanced float-end ms-auto mb-2 fs-2 d-flex px-2 py-0'
            onClick={() => unlockOnlineAchievements()}>
            <h1 className='mx-2 my-0'><HiOutlineLockOpen /></h1>
        </div>
    </Fragment>;

    return <ModalWrapper show={show} title={'info.stats.title'} footerContent={footerContent} handleHide={handleHide}>
        <Fragment>
            <div className='row'>
                <div className='col-12 col-lg-6'>
                    <h3>{getFromStore('info.stats.saveFile', settings.language)}</h3>
                    <StatsTable dataTitles={[
                        'info.stats.base',
                        'info.stats.ai', 
                        'info.stats.total'
                    ]} dataRows={{
                        'info.stats.recipesFound': [
                            stats.baseRecipesFound,
                            stats.aiRecipesFound,
                            stats.baseRecipesFound + stats.aiRecipesFound
                        ],
                        'info.stats.resultsFound': [
                            stats.baseResultsFound,
                            stats.aiResultsFound,
                            stats.baseResultsFound + stats.aiResultsFound
                        ],
                        'info.stats.highestDepth': [
                            stats.baseHighestDepth,
                            stats.aiHighestDepth,
                            Math.max(stats.baseHighestDepth, stats.aiHighestDepth)
                        ],
                        'info.stats.firstDiscoveries': [
                            '',
                            '',
                            stats.firstDiscoveries
                        ],
                        'info.stats.itemsCombined': [
                            '',
                            '',
                            stats.itemsCombined
                        ]
                    }} />
                </div>
                <div className='col-12 col-lg-6'>
                    <h3>{name === undefined ? 'Guest' : name}</h3>
                    <StatsTable loading={loading} dataTitles={[
                        'info.stats.value'
                    ]} dataRows={{
                        'info.stats.firstDiscoveries': [
                            user?.user.firstDiscoveries ?? '?'
                        ],
                        'info.stats.combines': [
                            user?.user.combines ?? '?'
                        ],
                        'info.stats.generations': [
                            user?.user.generations ?? '?'
                        ],
                        'info.stats.highestDepth': [
                            user?.user.highestDepth ?? '?'
                        ]
                    }} />
                </div>
            </div>
            <Collapse in={advanced}>
                <div>
                    <div className='row'>
                        <div className='col-12 col-lg-6 col-xl-3'>
                            <StatsTable dataRows={{
                                'info.dev.electron': [
                                    appVersions.electron
                                ],
                                'info.dev.chrome': [
                                    appVersions.chrome
                                ],
                                'info.dev.node': [
                                    appVersions.node
                                ],
                                'info.dev.app': [
                                    appVersions.app
                                ]
                            }} />
                        </div>
                        <div className='col-12 col-lg-6 col-xl-3'>
                            <StatsTable dataRows={{
                                'info.dev.platform': [
                                    systemInformation.platform
                                ],
                                'info.dev.arch': [
                                    systemInformation.arch
                                ],
                                'info.dev.version': [
                                    systemInformation.version
                                ],
                                'info.dev.production': [
                                    `${isProduction}`
                                ],
                                'info.dev.legacy': [
                                    `${isLegacy}`
                                ]
                            }} />
                        </div>
                        <div className='col-12 col-lg-6 col-xl-3'>
                            <StatsTable dataRows={{
                                'info.files.database': [
                                    fileVersions.database
                                ],
                                'info.files.hints': [
                                    fileVersions.hint
                                ],
                                'info.files.stats': [
                                    fileVersions.stats
                                ],
                                'info.files.settings': [
                                    fileVersions.settings
                                ],
                                'info.files.mission': [
                                    fileVersions.mission
                                ]
                            }} />
                        </div>
                        <div className='col-12 col-lg-6 col-xl-3'>
                            <StatsTable dataRows={{
                                'info.dev.serverVersion': [
                                    serverVersion
                                ],
                                'info.dev.serverUri': [
                                    serverEndpoint
                                ],
                                'info.dev.databaseName': [
                                    fileVersions.databaseName
                                ],
                                'info.dev.databaseInfo': [
                                    `${fileVersions.databaseInfo.type} ${fileVersions.databaseInfo.expires === undefined ? '' : `(${new Date(fileVersions.databaseInfo.expires).toISOString()})`}`
                                ]
                            }} />
                            <StatsTable loading={loading} loadingWidth={3} dataRows={{
                                'info.dev.supporter': [
                                    `${user?.user.supporter ?? hasSupporterTheme}`
                                ],
                                'info.dev.generationBanned': [
                                    `${user?.user.generateBanned ?? '?'}`
                                ],
                                'info.dev.apiBanned': [
                                    `${user?.user.apiBanned ?? '?'}`
                                ],
                                'info.dev.credits': [
                                    user?.user.credits ?? '?'
                                ]
                            }} />
                        </div>
                    </div>
                    <h5>{getFromStore('info.apiErrorsTitle', settings.language)}</h5>
                    <ul className="list-group">
                        {errors.length === 0 ? getFromStore('errors.noErrors', settings.language) : ''}
                        {errors.map((error) => (
                            <ErrorItem key={error.date.getMilliseconds()} error={error}/>
                        ))}
                    </ul>
                </div>
            </Collapse>
        </Fragment>
    </ModalWrapper>;
};
