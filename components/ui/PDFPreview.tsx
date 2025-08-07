// components/ui/PDFPreview.tsx
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

type PDFPreviewProps = {
    title: string;
    documentType: 'receipt' | 'prescription';
    onClose: () => void;
};

export const PDFPreview: React.FC<PDFPreviewProps> = ({
    title,
    documentType,
    onClose,
}) => {
    // Générer du contenu basé sur le type de document
    const renderContent = () => {
        if (documentType === 'receipt') {
            return (
                <View className="px-6 py-4">
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-bold text-[#4169E1] mb-1">CABINET MÉDICAL</Text>
                        <Text className="text-base text-gray-600">123 Avenue de la Santé</Text>
                        <Text className="text-base text-gray-600">75001 Paris</Text>
                        <Text className="text-base text-gray-600">Tel: 01 23 45 67 89</Text>
                    </View>

                    <Text className="text-xl font-semibold text-center mb-6">REÇU DE PAIEMENT</Text>

                    <View className="border-b border-gray-300 pb-4 mb-4">
                        <Text className="text-base text-gray-800 mb-2">Patient: Dupont Sophie</Text>
                        <Text className="text-base text-gray-800 mb-2">Date: 16/04/2025</Text>
                        <Text className="text-base text-gray-800">Numéro de reçu: REC-2025-0423</Text>
                    </View>

                    <View className="border-b border-gray-300 pb-4 mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-base text-gray-800">Consultation médicale</Text>
                            <Text className="text-base text-gray-800">30,00 €</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-base text-gray-800">Régime obligatoire</Text>
                            <Text className="text-base text-gray-800">-6,00 €</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-base text-gray-800">Mutuelle</Text>
                            <Text className="text-base text-gray-800">-18,00 €</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between mb-8">
                        <Text className="text-lg font-bold">TOTAL PAYÉ</Text>
                        <Text className="text-lg font-bold">10,00 €</Text>
                    </View>

                    <View className="items-center">
                        <Text className="text-base text-gray-600 text-center">
                            Ce reçu atteste du paiement des honoraires médicaux.
                        </Text>
                        <Text className="text-base text-gray-600 text-center mt-2">
                            Merci de votre visite.
                        </Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View className="px-6 py-4">
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-bold text-[#4169E1] mb-1">CABINET MÉDICAL</Text>
                        <Text className="text-base text-gray-600">123 Avenue de la Santé</Text>
                        <Text className="text-base text-gray-600">75001 Paris</Text>
                        <Text className="text-base text-gray-600">Tel: 01 23 45 67 89</Text>
                    </View>

                    <Text className="text-xl font-semibold text-center mb-6">ORDONNANCE MÉDICALE</Text>

                    <View className="border-b border-gray-300 pb-4 mb-4">
                        <Text className="text-base text-gray-800 mb-2">Patient: Dupont Sophie</Text>
                        <Text className="text-base text-gray-800 mb-2">Date de naissance: 24/01/1990</Text>
                        <Text className="text-base text-gray-800 mb-2">Date: 16/04/2025</Text>
                        <Text className="text-base text-gray-800">Numéro de sécurité sociale: 2 90 01 75 123 456 78</Text>
                    </View>

                    <View className="mb-8">
                        <View className="mb-4 border-l-4 border-[#4169E1] pl-3">
                            <Text className="text-lg font-semibold mb-1">Paracétamol 1000mg</Text>
                            <Text className="text-base text-gray-800">1 comprimé toutes les 6 heures en cas de douleur</Text>
                            <Text className="text-base text-gray-800">Ne pas dépasser 4 comprimés par jour</Text>
                            <Text className="text-base text-gray-800">Pour une durée de 5 jours</Text>
                        </View>

                        <View className="mb-4 border-l-4 border-[#4169E1] pl-3">
                            <Text className="text-lg font-semibold mb-1">Amoxicilline 500mg</Text>
                            <Text className="text-base text-gray-800">1 gélule 3 fois par jour à prendre pendant les repas</Text>
                            <Text className="text-base text-gray-800">Pour une durée de 7 jours</Text>
                        </View>

                        <View className="border-l-4 border-[#4169E1] pl-3">
                            <Text className="text-lg font-semibold mb-1">Repos</Text>
                            <Text className="text-base text-gray-800">3 jours d'arrêt de travail</Text>
                        </View>
                    </View>

                    <View className="items-center mt-8 border-t border-gray-300 pt-4">
                        <Text className="text-base text-gray-800 mb-2">Dr. Martin François</Text>
                        <View className="w-40 h-20 justify-center items-center bg-gray-100 rounded-md mb-2">
                            <Text className="text-gray-400 italic">Signature</Text>
                        </View>
                        <Text className="text-base text-gray-600">Médecin généraliste</Text>
                        <Text className="text-base text-gray-600">N° RPPS: 10987654321</Text>
                    </View>

                </View>
            );
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header avec titre et bouton de fermeture */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-xl font-semibold text-center flex-1">{title}</Text>
                <TouchableOpacity
                    onPress={onClose}
                    className="p-2"
                >
                    <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            {/* Zone de défilement pour le contenu du document */}
            <ScrollView
                className="flex-1 bg-white"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {renderContent()}
            </ScrollView>

            {/* Message d'information en bas */}
            <View className="py-3 px-4 bg-gray-100 border-t border-gray-200">
                <Text className="text-center text-gray-600">
                    Document généré le 16/04/2025 à 15:42
                </Text>
            </View>
        </View>

    );
};

export default PDFPreview;