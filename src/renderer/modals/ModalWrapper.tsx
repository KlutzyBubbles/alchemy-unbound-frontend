import { type FC, useContext, ReactNode, PropsWithChildren, CSSProperties, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { SettingsContext } from '../providers/SettingsProvider';
import { ThemeType } from '../../common/settings';
import { getFromStore } from '../language';

export interface ModalWrapperProps {
  show: boolean
  title: string
  theme?: ThemeType
  style?: CSSProperties
  footerContent?: ReactNode
  handleHide: () => void
}

export const ModalWrapper: FC<PropsWithChildren<ModalWrapperProps>> = ({
    show,
    theme,
    title,
    children,
    style,
    footerContent,
    handleHide
}) => {
    const { settings } = useContext(SettingsContext);

    return <Modal
        show={show}
        onHide={handleHide}
        centered
        size="xl"
        data-bs-theme={theme ?? settings.theme}
        style={style}>
        <Modal.Header closeButton data-bs-theme={theme ?? settings.theme}>
            <Modal.Title>
                <h2 className='mb-0 ms-2 user-select-none'>{getFromStore(title, settings.language)}</h2>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        {footerContent === undefined ? <Fragment /> : 
            <Modal.Footer>
                {footerContent}
            </Modal.Footer>}
    </Modal>;
};
