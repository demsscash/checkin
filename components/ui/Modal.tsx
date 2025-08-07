// components/ui/Modal.tsx
import React from 'react';
import { View, Text, Modal as RNModal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { COLORS } from '../../constants/theme';

type ModalType = 'info' | 'success' | 'error' | 'warning';

type ModalProps = {
    visible: boolean;
    title: string;
    message: string;
    type?: ModalType;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryButtonPress: () => void;
    onSecondaryButtonPress?: () => void;
    onClose?: () => void;
};

export const Modal: React.FC<ModalProps> = ({
    visible,
    title,
    message,
    type = 'info',
    primaryButtonText = 'OK',
    secondaryButtonText,
    onPrimaryButtonPress,
    onSecondaryButtonPress,
    onClose,
}) => {
    // Configuration en fonction du type
    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle',
                    iconColor: '#10B981', // Vert
                    bgColor: 'bg-green-100',
                };
            case 'error':
                return {
                    icon: 'alert-circle',
                    iconColor: '#EF4444', // Rouge
                    bgColor: 'bg-red-100',
                };
            case 'warning':
                return {
                    icon: 'warning',
                    iconColor: '#F59E0B', // Jaune
                    bgColor: 'bg-yellow-100',
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle',
                    iconColor: '#3B82F6', // Bleu
                    bgColor: 'bg-blue-100',
                };
        }
    };

    const { icon, iconColor, bgColor } = getTypeConfig();

    return (
        <RNModal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose || onPrimaryButtonPress}
        >
            <View className="flex-1 justify-center items-center bg-black/30">
                <View className="bg-white rounded-2xl p-6 w-4/5 max-w-md shadow-lg">
                    {/* Header avec icône et titre */}
                    <View className="flex-row items-center mb-4">
                        <View className={`w-10 h-10 ${bgColor} rounded-full items-center justify-center mr-3`}>
                            <Ionicons name={icon} size={24} color={iconColor} />
                        </View>
                        <Text className="text-xl font-semibold text-gray-800">{title}</Text>
                    </View>

                    {/* Message */}
                    <Text className="text-gray-700 text-lg mb-6">
                        {message}
                    </Text>

                    {/* Boutons */}
                    <View className={`flex-row ${secondaryButtonText ? 'justify-between' : 'justify-center'}`}>
                        {secondaryButtonText && (
                            <Button
                                title={secondaryButtonText}
                                onPress={onSecondaryButtonPress || onClose || onPrimaryButtonPress}
                                variant="secondary"
                                className="flex-1 mr-2"
                            />
                        )}
                        <Button
                            title={primaryButtonText}
                            onPress={onPrimaryButtonPress}
                            variant="primary"
                            className={secondaryButtonText ? "flex-1 ml-2" : "w-40"}
                        />
                    </View>
                </View>
            </View>
        </RNModal>
    );
};

export default Modal;