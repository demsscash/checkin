// components/ui/Typography.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
    children: React.ReactNode;
    className?: string;
}

export const Heading: React.FC<TypographyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <Text className={`text-2xl font-semibold text-[#4169E1] ${className}`} {...props}>
            {children}
        </Text>
    );
};

export const SubHeading: React.FC<TypographyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <Text className={`text-lg text-[#333] ${className}`} {...props}>
            {children}
        </Text>
    );
};

export const Paragraph: React.FC<TypographyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <Text className={`text-base text-[#666] ${className}`} {...props}>
            {children}
        </Text>
    );
};

export const Title: React.FC<TypographyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <Text className={`text-3xl font-semibold text-[#4169E1] text-center ${className}`} {...props}>
            {children}
        </Text>
    );
};

export const Caption: React.FC<TypographyProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <Text className={`text-sm text-[#666] ${className}`} {...props}>
            {children}
        </Text>
    );
};

export default {
    Heading,
    SubHeading,
    Paragraph,
    Title,
    Caption
};