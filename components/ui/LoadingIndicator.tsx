// components/ui/LoadingIndicator.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

type LoadingIndicatorProps = {
    text?: string;
    size?: 'small' | 'large';
    color?: string;
    className?: string;
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    text,
    size = 'large',
    color = COLORS.primary,
    className = '',
}) => {
    return (
        <View className={`items-center ${className}`}>
            <ActivityIndicator size={size} color={color} className="mb-6" />
            {text && (
                <Text className="text-2xl text-[#4169E1] font-semibold text-center">
                    {text}
                </Text>
            )}
        </View>
    );
};

export default LoadingIndicator;