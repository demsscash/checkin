// components/ui/PDFViewer.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

type PDFViewerProps = {
    uri: string;
    onClose: () => void;
    title?: string;
};

export const PDFViewer: React.FC<PDFViewerProps> = ({
    uri,
    onClose,
    title = 'Document',
}) => {
    const [loading, setLoading] = React.useState(true);

    // Le PDF de test - dans notre cas un PDF existant sur le web
    // En production, ce sera remplacé par le PDF généré par l'API
    const pdfUri = uri || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const handleLoadEnd = () => {
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header avec bouton de fermeture */}
            <View className="flex-row items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                <Text className="text-xl font-semibold text-center flex-1">{title}</Text>
                <TouchableOpacity
                    onPress={onClose}
                    className="p-2 rounded-full"
                >
                    <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            {/* Affichage du PDF */}
            <View className="flex-1">
                <WebView
                    source={{ uri: pdfUri }}
                    onLoad={handleLoadEnd}
                    className="flex-1"
                />

                {/* Loading indicator */}
                {loading && (
                    <View className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text className="mt-4 text-[#4169E1] text-lg">Chargement du document...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default PDFViewer;