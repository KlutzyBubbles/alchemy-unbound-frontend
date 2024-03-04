import { useState, type FC, useEffect } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { AppVersions, SystemVersion } from '../common/types';

export interface InfoModalProps {
  show: boolean
  handleHide: () => void
}

export const InfoModal: FC<InfoModalProps> = ({
    show,
    handleHide
}) => {
    const [appVersions, setAppVersions] = useState<AppVersions>({ node: '', electron: '', chrome: '', app: ''});
    const [systemInformation, setSystemInformation] = useState<SystemVersion>({ arch: '', platform: '', version: '' });

    useEffect(() => {
        (async () => {
            try {
                setAppVersions(await window.GenericAPI.getAppVersions());
                setSystemInformation(await window.GenericAPI.getSystemInformation());
            } catch (e) {
                console.error('Failed to load system information', e);
            }
        })();
    }, []);

    return (
        <Modal show={show} onHide={handleHide} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Alchemy Unbound</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
        </Modal>
    );
};
