// components/ui/ErrorModal.tsx
import React from 'react';
import Modal from './Modal';

type ErrorModalProps = {
    visible: boolean;
    title?: string;
    message: string;
    buttonText?: string;
    onClose: () => void;
};

export const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    title = 'Erreur',
    message,
    buttonText = 'Réessayer',
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            title={title}
            message={message}
            type="error"
            primaryButtonText={buttonText}
            onPrimaryButtonPress={onClose}
        />
    );
};

export default ErrorModal;