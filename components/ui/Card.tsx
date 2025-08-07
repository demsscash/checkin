// components/ui/Card.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <View className={`bg-white rounded-xl p-4 shadow ${className}`}>
            {children}
        </View>
    );
};

type InfoCardProps = {
    label: string;
    value: string;
    className?: string;
};

export const InfoCard: React.FC<InfoCardProps> = ({
    label,
    value,
    className = ''
}) => {
    return (
        <Card className={`flex-row justify-between items-center mb-4 ${className}`}>
            <Text className="text-base text-gray-600">{label}</Text>
            <Text className="text-lg font-medium">{value}</Text>
        </Card>
    );
};

type CenteredCardProps = {
    text: string;
    className?: string;
};

export const CenteredCard: React.FC<CenteredCardProps> = ({
    text,
    className = ''
}) => {
    return (
        <Card className={`items-center justify-center ${className}`}>
            <Text className="text-base text-gray-800 text-center">{text}</Text>
        </Card>
    );
};

type HighlightCardProps = {
    title: string;
    highlight: string;
    className?: string;
};

export const HighlightCard: React.FC<HighlightCardProps> = ({
    title,
    highlight,
    className = ''
}) => {
    return (
        <Card className={className}>
            <Text className="text-base text-gray-800 text-center">{title}</Text>
            <Text className="text-xl font-semibold text-[#4169E1] text-center">{highlight}</Text>
        </Card>
    );
};

export default {
    Card,
    InfoCard,
    CenteredCard,
    HighlightCard
};