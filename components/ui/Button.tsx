// components/ui/Button.tsx
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useActivity } from '../layout/ActivityWrapper';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
    onPress: () => void;
    title: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    textClassName?: string;
};

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    disabled = false,
    loading = false,
    className = '',
    textClassName = '',
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const { triggerActivity } = useActivity();

    // Debug logging
    useEffect(() => {
        console.log('Button state:', { disabled, variant, isPressed });
    }, [disabled, variant, isPressed]);

    // Gestionnaire d'événement combiné pour le clic et la réinitialisation du timer
    const handlePress = () => {
        // Déclencher l'événement d'activité pour réinitialiser le timer
        triggerActivity();
        // Appeler la fonction onPress originale
        onPress();
    };

    // Styles based on variant and state
    const getButtonClass = () => {
        // Force a specific style for disabled state
        if (disabled) {
            return 'bg-[#D3D3D3] px-8 py-4 rounded-full shadow';
        }

        // If the button is pressed, apply the blue style regardless of variant
        if (isPressed) {
            return 'bg-[#4169E1] px-8 py-4 rounded-full shadow';
        }

        switch (variant) {
            case 'primary':
                return 'bg-[#4169E1] px-8 py-4 rounded-full shadow'; // Use solid color instead of gradient
            case 'secondary':
                return 'bg-white px-8 py-4 rounded-full shadow';
            case 'outline':
                return 'bg-transparent border border-[#4169E1] px-8 py-4 rounded-full';
            default:
                return 'bg-[#4169E1] px-8 py-4 rounded-full shadow';
        }
    };

    const getTextClass = () => {
        if (disabled) return 'text-white font-medium text-base';

        // If button is pressed, always use white text
        if (isPressed) {
            return 'text-white font-medium text-base';
        }

        switch (variant) {
            case 'primary':
                return 'text-white font-medium text-base';
            case 'secondary':
                return 'text-[#4169E1] font-medium text-base';
            case 'outline':
                return 'text-[#4169E1] font-medium text-base';
            default:
                return 'text-white font-medium text-base';
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.9}
            className={`${getButtonClass()} ${className}`}
            onPressIn={() => {
                setIsPressed(true);
                triggerActivity();
            }}
            onPressOut={() => {
                setIsPressed(false);
                triggerActivity();
            }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'primary' ? COLORS.white : COLORS.primary} />
            ) : (
                <Text className={`${getTextClass()} ${textClassName}`}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;