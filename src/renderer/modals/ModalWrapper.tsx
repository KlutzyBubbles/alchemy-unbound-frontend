import { type FC, useContext, ReactNode, PropsWithChildren } from 'react';
import { Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { ThemeType } from '../../common/settings';
import { getFromStore } from '../language';

export interface ModalWrapperProps {
  show: boolean
  title: string
  theme?: ThemeType
  footerContent: ReactNode
  handleHide: () => void
}

export const ModalWrapper: FC<PropsWithChildren<ModalWrapperProps>> = ({
    show,
    theme,
    title,
    children,
    footerContent,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);

    return <Modal show={show} onHide={handleHide} centered size="xl" data-bs-theme={theme ?? settings.theme}>
        <Modal.Header closeButton data-bs-theme={theme ?? settings.theme}>
            <Modal.Title>
                <h2 className='mb-0 ms-2 user-select-none'>{getFromStore(title, settings.language)}</h2>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
            {footerContent}
        </Modal.Footer>
    </Modal>;
};
