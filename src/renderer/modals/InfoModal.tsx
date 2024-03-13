import { useState, type FC, useEffect, useContext } from 'react';
import { Collapse, Modal, Table } from 'react-bootstrap';
import { AppVersions, SystemVersion } from '../../common/types';
import { SettingsContext } from '../providers/SettingsProvider';
import logger from 'electron-log/renderer';
import { BsDiscord, BsGithub } from 'react-icons/bs';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';


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

    return (
        <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={settings.dark ? 'dark' : 'light'}>
            <Modal.Header closeButton>
                <Modal.Title>Alchemy Unbound</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Developed by KlutzyBubbles</p>
                <p>Steam assets by Piney</p>
                
                <Collapse in={advanced}>
                    <div>
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
                </Collapse>
            </Modal.Body>
            <Modal.Footer>
                <div
                    className='btn btn-sm btn-advanced float-start me-auto mb-2 fs-2 d-flex p-2'
                    onClick={() => setAdvanced(!advanced)}>
                    <h2 className='mx-2'><HiOutlineWrenchScrewdriver /><span className='fs-3 ms-3'>v{appVersions.app}</span></h2>
                </div>
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
