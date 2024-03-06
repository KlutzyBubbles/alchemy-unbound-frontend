import { useState, type FC, useEffect, useContext } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';

export interface SettingsModalProps {
  show: boolean
  handleHide: () => void
}

export const SettingsModal: FC<SettingsModalProps> = ({
    show,
    handleHide
}) => {
    const { settings, setSettings } = useContext(SettingsContext);
    const [displays, setDisplays] = useState<Electron.Display[]>([]);
    const [currentDisplay, setCurrentDisplay] = useState<Electron.Display>(undefined);
    const [fullscreen, setFullscreen] = useState<boolean>(settings?.fullscreen ?? false);
    const [background, setFullscreen] = useState<boolean>(settings?.fullscreen ?? false);

    useEffect(() => {
        (async() => {
            try {
                setDisplays(await window.DisplayAPI.getDisplays());
                setCurrentDisplay(await window.DisplayAPI.getCurrentDisplay());
            } catch (e) {
                console.error('Failed to load settings (oops)');
                console.error(e);
            }
        })();
    }, []);

    useEffect(() => {
        (async() => {
            try {
                setSettings({
                    ...settings,
                    fullscreen: fullscreen
                });
                console.log(fullscreen);
                window.DisplayAPI.setFullscreen(fullscreen);
            } catch (e) {
                console.error('Failed to change fullscreen', e);
            }
        })();
    }, [fullscreen]);

    useEffect(() => {
        (async() => {
            try {
                if (currentDisplay !== undefined) {
                    setSettings({
                        ...settings,
                        currentDisplay: currentDisplay.id
                    });
                    console.log(currentDisplay.id);
                    window.DisplayAPI.moveToDisplay(currentDisplay);
                }
            } catch (e) {
                console.error('Failed to move to display', e);
            }
        })();
    }, [currentDisplay]);

    const onDisplaySelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        if (e.target.value === 'none') {
            console.log('Ignoring select');
        } else {
            let selectedId: number | undefined = undefined;
            try {
                selectedId = parseInt(e.target.value);
            } catch (e) {
                console.error('Failed to parse number?', e);
                return;
            }
            if (selectedId === undefined)
                return;
            const display = displays.find((d) => d.id === selectedId);
            if (display === undefined) {
                console.log('Failed to find selected display');
            } else {
                setCurrentDisplay(display);
            }
        }
    };

    return (
        <Modal show={show} onHide={handleHide} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Check
                        type="switch"
                        id="fullscreen-switch"
                        label="Fullscreen"
                        checked={fullscreen}
                        onChange={() => setFullscreen(!fullscreen)}
                    />
                    <Form.Select aria-label="Fullscreen display" onChange={onDisplaySelect} value={currentDisplay === undefined ? 'none' : currentDisplay.id}>
                        {<option disabled key="none" value="none">Please select a screen</option>}
                        {displays.map((display) => {
                            return (<option
                                key={display.id}
                                value={display.id}>{display.label} ({display.size.width * display.scaleFactor}x{display.size.height * display.scaleFactor})
                            </option>);
                        })}
                    </Form.Select>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleHide}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
