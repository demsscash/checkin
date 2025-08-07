// components/ui/NetworkError.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface NetworkErrorProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
    message = "Problème de connexion au réseau",
    onRetry,
    className = ''
}) => {
    return (
        <View className={`items-center justify-center p-6 ${className}`}>
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-4 shadow">
                <Ionicons name="wifi" size={32} color={COLORS.primary} />
            </View>

            <Text className="text-xl font-medium text-center text-gray-800 mb-2">
                Problème de connexion
            </Text>

            <Text className="text-base text-center text-gray-600 mb-6">
                {message}
            </Text>

            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    className="bg-white px-6 py-3 rounded-full shadow"
                >
                    <Text className="text-base font-medium text-[#4169E1]">
                        Réessayer
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default NetworkError;