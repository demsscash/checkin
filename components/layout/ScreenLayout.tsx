// components/layout/ScreenLayout.tsx
import React from 'react';
import { View, StatusBar, ViewProps } from 'react-native';
import Background from '../ui/Background';

interface ScreenLayoutProps extends ViewProps {
    children: React.ReactNode;
    statusBarStyle?: 'light-content' | 'dark-content';
    noBackground?: boolean;
    withPadding?: boolean;
    centered?: boolean;
    className?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
    children,
    statusBarStyle = 'dark-content',
    noBackground = false,
    withPadding = true,
    centered = true,
    className = '',
    ...props
}) => {
    const contentClasses = `
    flex-1
    ${withPadding ? 'p-5' : ''}
    ${centered ? 'justify-center items-center' : ''}
    ${className}
  `;

    if (noBackground) {
        return (
            <View className={contentClasses} {...props}>
                <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
                {children}
            </View>
        );
    }

    return (
        <Background>
            <View className={contentClasses} {...props}>
                <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
                {children}
            </View>
        </Background>
    );
};

export default ScreenLayout;