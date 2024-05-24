import { useState, type FC, useEffect, useContext, Fragment } from 'react';
import { Collapse, Modal, Table } from 'react-bootstrap';
import { AppVersions, ErrorEntry, FileVersions, LATEST_SERVER_VERSION, SystemVersion, UserSuccess } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { getFromStore } from '../language';
import { DEFAULT_STATS, Stats } from '../../common/stats';
import { ErrorItem } from './ErrorItem';
import { InfoContext } from '../providers/InfoProvider';


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
    const [fileVersions, setFileVersions] = useState<FileVersions>({
        database: -3,
        hint: -3,
        stats: -3,
        settings: -3,
        databaseName: 'unknown',
        databaseInfo: {
            type: 'base'
        }
    });
    const [systemInformation, setSystemInformation] = useState<SystemVersion>({ arch: '', platform: '', version: '' });
    const [serverVersion, setServerVersion] = useState<number>(LATEST_SERVER_VERSION);
    const [serverEndpoint, setServerEndpoint] = useState<string>('UNKNONW');
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserSuccess>(undefined);
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

    return (
        <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.theme}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h2 className='mb-0 ms-2'>{getFromStore('info.stats.title', settings.language)}</h2>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-12 col-lg-6'>
                        <h3>{getFromStore('info.stats.saveFile', settings.language)}</h3>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{getFromStore('info.stats.base', settings.language)}</th>
                                    <th>{getFromStore('info.stats.ai', settings.language)}</th>
                                    <th>{getFromStore('info.stats.total', settings.language)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{getFromStore('info.stats.recipesFound', settings.language)}</td>
                                    <td>{stats.baseRecipesFound}</td>
                                    <td>{stats.aiRecipesFound}</td>
                                    <td>{stats.baseRecipesFound + stats.aiRecipesFound}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('info.stats.resultsFound', settings.language)}</td>
                                    <td>{stats.baseResultsFound}</td>
                                    <td>{stats.aiResultsFound}</td>
                                    <td>{stats.baseResultsFound + stats.aiResultsFound}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('info.stats.highestDepth', settings.language)}</td>
                                    <td>{stats.baseHighestDepth}</td>
                                    <td>{stats.aiHighestDepth}</td>
                                    <td>{stats.baseHighestDepth + stats.aiHighestDepth}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('info.stats.firstDiscoveries', settings.language)}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{stats.firstDiscoveries}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('info.stats.itemsCombined', settings.language)}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{stats.itemsCombined}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    {loading ? <Fragment>
                        <div className='d-flex justify-content-center'>
                            <div className='spinner-border' role='status'>
                                <span className='visually-hidden'>Loading...</span>
                            </div>
                        </div>
                    </Fragment> :
                        <Fragment>
                            <div className='col-12 col-lg-6'>
                                <h3>{name === undefined ? 'Guest' : name}</h3>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>{getFromStore('info.stats.value', settings.language)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{getFromStore('info.stats.firstDiscoveries', settings.language)}</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.firstDiscoveries}`}</td>
                                        </tr>
                                        <tr>
                                            <td>{getFromStore('info.stats.combines', settings.language)}</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.combines}`}</td>
                                        </tr>
                                        <tr>
                                            <td>{getFromStore('info.stats.generations', settings.language)}</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.generations}`}</td>
                                        </tr>
                                        <tr>
                                            <td>{getFromStore('info.stats.highestDepth', settings.language)}</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.highestDepth}`}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Fragment>}
                </div>
                <Collapse in={advanced}>
                    <div>
                        <div className='row'>
                            <div className='col-12 col-lg-6 col-xl-3'>
                                <Table striped bordered hover size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Electron</td>
                                            <td>{appVersions.electron}</td>
                                        </tr>
                                        <tr>
                                            <td>Chrome</td>
                                            <td>{appVersions.chrome}</td>
                                        </tr>
                                        <tr>
                                            <td>Node</td>
                                            <td>{appVersions.node}</td>
                                        </tr>
                                        <tr>
                                            <td>App</td>
                                            <td>{appVersions.app}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <div className='col-12 col-lg-6 col-xl-3'>
                                <Table striped bordered hover size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Platform</td>
                                            <td>{systemInformation.platform}</td>
                                        </tr>
                                        <tr>
                                            <td>Arch</td>
                                            <td>{systemInformation.arch}</td>
                                        </tr>
                                        <tr>
                                            <td>Version</td>
                                            <td>{systemInformation.version}</td>
                                        </tr>
                                        <tr>
                                            <td>Production</td>
                                            <td>{`${isProduction}`}</td>
                                        </tr>
                                        <tr>
                                            <td>Legacy</td>
                                            <td>{`${isLegacy}`}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <div className='col-12 col-lg-6 col-xl-3'>
                                <Table striped bordered hover size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Database</td>
                                            <td>{fileVersions.database}</td>
                                        </tr>
                                        <tr>
                                            <td>Hints</td>
                                            <td>{fileVersions.hint}</td>
                                        </tr>
                                        <tr>
                                            <td>Stats</td>
                                            <td>{fileVersions.stats}</td>
                                        </tr>
                                        <tr>
                                            <td>Settings</td>
                                            <td>{fileVersions.settings}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <div className='col-12 col-lg-6 col-xl-3'>
                                <Table striped bordered hover size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Server Version</td>
                                            <td>{serverVersion}</td>
                                        </tr>
                                        <tr>
                                            <td>Server URI</td>
                                            <td>{serverEndpoint}</td>
                                        </tr>
                                        <tr>
                                            <td>Database Name</td>
                                            <td>{fileVersions.databaseName}</td>
                                        </tr>
                                        <tr>
                                            <td>Database info</td>
                                            <td>{fileVersions.databaseInfo.type}
                                                {fileVersions.databaseInfo.expiry === undefined ? '' : `(${new Date(fileVersions.databaseInfo.expiry).toISOString()})`}</td>
                                        </tr>
                                        <tr>
                                            <td>Supporter</td>
                                            <td>{user === undefined ? `${hasSupporterTheme}` : `${user.user.supporter}`}</td>
                                        </tr>
                                        <tr>
                                            <td>Generation Banned</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.generateBanned}`}</td>
                                        </tr>
                                        <tr>
                                            <td>API Banned</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.apiBanned}`}</td>
                                        </tr>
                                        <tr>
                                            <td>Credits</td>
                                            <td>{user === undefined ? 'unknown' : `${user.user.credits}`}</td>
                                        </tr>
                                    </tbody>
                                </Table>
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
            </Modal.Body>
            <Modal.Footer>
                <div
                    className='btn btn-sm btn-advanced float-start me-auto mb-2 fs-2 d-flex px-2 py-0'
                    onClick={() => setAdvanced(!advanced)}>
                    <h1 className='mx-2 my-0'><HiOutlineWrenchScrewdriver /><span className='fs-3 ms-3'>v{appVersions.app}</span></h1>
                </div>
            </Modal.Footer>
        </Modal>
    );
};
