import { useState, type FC, useEffect, useContext } from 'react';
import { Collapse, Modal, Table } from 'react-bootstrap';
import { AppVersions, ErrorEntry, SystemVersion } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { BsDiscord, BsGithub } from '../icons/bs';
import { HiOutlineWrenchScrewdriver } from '../icons/hi2';
import { getFromStore } from '../language';
import { DEFAULT_STATS, Stats } from '../../common/stats';
import { ErrorItem } from './ErrorItem';
import { IoPulseOutline } from '../icons/io5';


export interface InfoModalProps {
  show: boolean
  handleHide: () => void
}

export const InfoModal: FC<InfoModalProps> = ({
    show,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);
    const [appVersions, setAppVersions] = useState<AppVersions>({ node: '', electron: '', chrome: '', app: ''});
    const [systemInformation, setSystemInformation] = useState<SystemVersion>({ arch: '', platform: '', version: '' });
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
    const [errors, setErrors] = useState<ErrorEntry[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setAppVersions(await window.GenericAPI.getAppVersions());
                setSystemInformation(await window.GenericAPI.getSystemInformation());
            } catch (e) {
                logger.error('Failed to load system information', e);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setStats(await window.StatsAPI.getStats());
            } catch (e) {
                logger.error('Failed to load stats', e);
            }
            try {
                setErrors(await window.ErrorAPI.getErrors());
            } catch (e) {
                logger.error('Failed to load errors (ironic)', e);
            }
        })();
    }, [show]);

    return (
        <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.theme}>
            <Modal.Header closeButton>
                <Modal.Title>Alchemy Unbound</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-12 col-lg-6'>
                        <p>{getFromStore('developedBy', settings.language)} KlutzyBubbles</p>
                        <p>{getFromStore('steamAssetsBy', settings.language)} Piney</p>
                    </div>
                    <div className='col-12 col-lg-6'>
                        <h4>{getFromStore('stats', settings.language)} (Beta)</h4>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{getFromStore('base', settings.language)}</th>
                                    <th>{getFromStore('ai', settings.language)}</th>
                                    <th>{getFromStore('total', settings.language)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{getFromStore('recipesFound', settings.language)}</td>
                                    <td>{stats.baseRecipesFound}</td>
                                    <td>{stats.aiRecipesFound}</td>
                                    <td>{stats.baseRecipesFound + stats.aiRecipesFound}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('resultsFound', settings.language)}</td>
                                    <td>{stats.baseResultsFound}</td>
                                    <td>{stats.aiResultsFound}</td>
                                    <td>{stats.baseResultsFound + stats.aiResultsFound}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('highestDepth', settings.language)}</td>
                                    <td>{stats.baseHighestDepth}</td>
                                    <td>{stats.aiHighestDepth}</td>
                                    <td>{stats.baseHighestDepth + stats.aiHighestDepth}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('firstDiscoveries', settings.language)}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{stats.firstDiscoveries}</td>
                                </tr>
                                <tr>
                                    <td>{getFromStore('itemsCombined', settings.language)}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{stats.itemsCombined}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </div>
                <Collapse in={advanced}>
                    <div>
                        <div className='row'>
                            <div className='col-12 col-lg-6'>
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
                            <div className='col-12 col-lg-6'>
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
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                        <h5>{getFromStore('apiErrorsTitle', settings.language)}</h5>
                        <ul className="list-group">
                            {errors.length === 0 ? getFromStore('noErrors', settings.language) : ''}
                            {errors.map((error) => (
                                <ErrorItem key={error.date.getMilliseconds()} error={error}/>
                            ))}
                        </ul>
                    </div>
                </Collapse>
            </Modal.Body>
            <Modal.Footer>
                <div
                    className='btn btn-sm btn-advanced float-start me-auto mb-2 fs-2 d-flex p-2'
                    onClick={() => setAdvanced(!advanced)}>
                    <h2 className='mx-2'><HiOutlineWrenchScrewdriver /><span className='fs-3 ms-3'>v{appVersions.app}</span></h2>
                </div>
                <a
                    href="https://status.alchemyunbound.net"
                    target="_blank"
                    className='btn btn-sm btn-status float-end mb-2 fs-2 d-flex p-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><IoPulseOutline /></h2>
                </a>
                <a
                    href="https://github.com/KlutzyBubbles/alchemy-unbound"
                    target="_blank"
                    className='btn btn-sm btn-github float-end mb-2 fs-2 d-flex p-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><BsGithub /></h2>
                </a>
                <a
                    href="https://discord.com/invite/wBcwzxTTXN"
                    target="_blank"
                    className='btn btn-sm btn-discord float-end mb-2 fs-2 d-flex p-2 me-2'
                    rel="noreferrer">
                    <h2 className='mx-2'><BsDiscord /></h2>
                </a>
            </Modal.Footer>
        </Modal>
    );
};
