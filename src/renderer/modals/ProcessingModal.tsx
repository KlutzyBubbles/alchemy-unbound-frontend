import { type FC, ReactNode, } from 'react';
import { ModalWrapper } from './ModalWrapper';

export interface ProcessingModalProps {
  show: boolean,
  onCancel: () => void,
  children: ReactNode
}

export const ProcessingModal: FC<ProcessingModalProps> = ({
    show,
    onCancel,
    children
}) => {
    return <ModalWrapper show={show} title={'dialog.processingTitle'} handleHide={onCancel} style={{
        background: '#000000dd'
    }}>
        {children}
    </ModalWrapper>;
};
