// components/ui/PDFModal.tsx
import React from 'react';
import { Modal, View } from 'react-native';
import PDFPreview from './PDFPreview';

type PDFModalProps = {
    visible: boolean;
    documentType: 'receipt' | 'prescription';
    onClose: () => void;
    documentTitle: string;
};

export const PDFModal: React.FC<PDFModalProps> = ({
    visible,
    documentType,
    onClose,
    documentTitle,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View className="flex-1">
                <PDFPreview
                    documentType={documentType}
                    onClose={onClose}
                    title={documentTitle}
                />
            </View>
        </Modal>
    );
};

export default PDFModal;