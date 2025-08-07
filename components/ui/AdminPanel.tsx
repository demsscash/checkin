// components/ui/AdminPanel.tsx - Version corrigée avec Modal personnalisé
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { Card } from './Card';
import { KioskAuthService } from '../../services/kioskAuth';
import { useRouter } from 'expo-router';
import { ROUTES } from '../../constants/routes';
import { ApiTestPanel } from '../debug/apiTestPanel';

type AdminPanelProps = {
    visible: boolean;
    onClose: () => void;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApiTestModal, setShowApiTestModal] = useState(false);
    const [fingerprintDetails, setFingerprintDetails] = useState<any>(null);

    const handleResetAuth = async () => {
        Alert.alert(
            'Réinitialiser l\'authentification',
            'Êtes-vous sûr de vouloir réinitialiser l\'authentification de cette borne ? Cette action nécessitera une nouvelle authentification.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await KioskAuthService.resetKioskAuthentication();

                            Alert.alert(
                                'Authentification réinitialisée',
                                'La borne a été déconnectée. L\'application va redémarrer.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            onClose();
                                            router.replace(ROUTES.KIOSK_AUTH);
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Erreur lors de la réinitialisation:', error);
                            Alert.alert(
                                'Erreur',
                                'Impossible de réinitialiser l\'authentification.'
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleShowKioskInfo = async () => {
        try {
            setLoading(true);
            const info = await KioskAuthService.getKioskInfo();
            const mac = await KioskAuthService.getMacAddress();

            Alert.alert(
                'Informations de la borne (Expo)',
                `Code: ${info.code || 'Non défini'}\nMAC: ${mac}\n\nIdentifiant unique généré via Expo managed workflow`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Erreur',
                'Impossible de récupérer les informations de la borne.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleShowDetailedFingerprint = async () => {
        try {
            setLoading(true);
            const details = await KioskAuthService.getDetailedFingerprint();
            setFingerprintDetails(details);
            setShowDetailsModal(true);
        } catch (error) {
            Alert.alert(
                'Erreur',
                'Impossible de récupérer les détails de l\'empreinte Expo.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateMac = async () => {
        Alert.alert(
            'Régénérer l\'empreinte Expo',
            'Cette action va recalculer l\'identifiant unique basé sur les APIs Expo. Continuer ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Régénérer',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const newMac = await KioskAuthService.getMacAddress();
                            Alert.alert(
                                'Empreinte Expo régénérée',
                                `Nouvelle adresse MAC: ${newMac}\n\nBasée sur les identifiants Expo disponibles.\nNote: Cette modification ne sera effective qu'après une nouvelle authentification.`
                            );
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de régénérer l\'empreinte Expo.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            {/* Modal principal d'administration avec React Native Modal */}
            <RNModal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={onClose}
            >
                <View className="flex-1 justify-center items-center bg-black/30">
                    <View className="bg-white rounded-2xl p-6 w-4/5 max-w-md shadow-lg max-h-4/5">
                        {/* Header */}
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-semibold text-gray-800">
                                    Administration de la borne (Expo)
                                </Text>
                                <Text className="text-gray-600 text-sm mt-1">
                                    Gestion et diagnostic de l'authentification Expo managed workflow
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="p-2"
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Contenu scrollable */}
                        <ScrollView className="max-h-96">
                            <View className="space-y-3">
                                <Button
                                    title="🔧 Tester l'API réelle"
                                    onPress={() => setShowApiTestModal(true)}
                                    variant="primary"
                                    className="w-full"
                                    disabled={loading}
                                />

                                <Button
                                    title="📱 Informations Expo"
                                    onPress={handleShowKioskInfo}
                                    variant="secondary"
                                    className="w-full"
                                    disabled={loading}
                                />

                                <Button
                                    title="🔍 Empreinte Expo détaillée"
                                    onPress={handleShowDetailedFingerprint}
                                    variant="secondary"
                                    className="w-full"
                                    disabled={loading}
                                />

                                <Button
                                    title="🔄 Régénérer empreinte"
                                    onPress={handleRegenerateMac}
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading}
                                />

                                <Button
                                    title="⚠️ Réinitialiser authentification"
                                    onPress={handleResetAuth}
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading}
                                />
                            </View>
                        </ScrollView>

                        {/* Footer avec bouton Fermer */}
                        <View className="mt-6 pt-4 border-t border-gray-200">
                            <Button
                                title="Fermer"
                                onPress={onClose}
                                variant="secondary"
                                className="w-full"
                            />
                        </View>
                    </View>
                </View>
            </RNModal>

            {/* Modal des détails d'empreinte Expo */}
            <RNModal
                visible={showDetailsModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDetailsModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/30">
                    <View className="bg-white rounded-2xl p-6 w-4/5 max-w-lg shadow-lg max-h-4/5">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-semibold text-gray-800">
                                Empreinte Expo détaillée
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDetailsModal(false)}
                                className="p-2"
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-4">
                            Informations collectées via les APIs Expo
                        </Text>

                        <ScrollView className="max-h-96">
                            {fingerprintDetails && (
                                <View className="space-y-3">
                                    {/* Adresse MAC finale */}
                                    <Card className="bg-blue-50">
                                        <Text className="text-sm font-semibold text-blue-800 mb-2">
                                            Adresse MAC Finale (Expo)
                                        </Text>
                                        <Text className="text-xs font-mono text-blue-700">
                                            {fingerprintDetails.macAddress}
                                        </Text>
                                        <Text className="text-xs text-blue-600 mt-1">
                                            Générée via empreinte composite Expo
                                        </Text>
                                    </Card>

                                    {/* Informations Application Expo */}
                                    <Card className="bg-green-50">
                                        <Text className="text-sm font-semibold text-green-800 mb-2">
                                            Application Expo
                                        </Text>
                                        <View className="space-y-1">
                                            <Text className="text-xs">
                                                <Text className="font-medium">App ID:</Text> {fingerprintDetails.fingerprint.applicationId}
                                            </Text>
                                            <Text className="text-xs">
                                                <Text className="font-medium">App Name:</Text> {fingerprintDetails.fingerprint.applicationName}
                                            </Text>
                                            <Text className="text-xs">
                                                <Text className="font-medium">Version:</Text> {fingerprintDetails.fingerprint.nativeApplicationVersion}
                                            </Text>
                                            <Text className="text-xs">
                                                <Text className="font-medium">Build:</Text> {fingerprintDetails.fingerprint.nativeBuildVersion}
                                            </Text>
                                        </View>
                                    </Card>

                                    {/* Hash composite */}
                                    <Card className="bg-purple-50">
                                        <Text className="text-sm font-semibold text-purple-800 mb-2">
                                            Hash Composite Expo
                                        </Text>
                                        <Text className="text-xs font-mono text-purple-700">
                                            {fingerprintDetails.fingerprint.hash}
                                        </Text>
                                        <Text className="text-xs text-purple-600 mt-1">
                                            Généré à partir de tous les identifiants Expo combinés
                                        </Text>
                                    </Card>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </RNModal>

            {/* Modal de test API */}
            <ApiTestPanel
                visible={showApiTestModal}
                onClose={() => setShowApiTestModal(false)}
            />
        </>
    );
};

// COMPOSANT ADMINACCESS AMÉLIORÉ - Plus visible et accessible
type AdminAccessProps = {
    onShowPanel: () => void;
};

export const AdminAccess: React.FC<AdminAccessProps> = ({ onShowPanel }) => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const handleTap = () => {
        const now = Date.now();

        console.log('Admin access tap:', tapCount + 1); // Debug

        // Réinitialiser le compteur si plus de 2 secondes entre les taps
        if (now - lastTapTime > 2000) {
            setTapCount(1);
        } else {
            setTapCount(prev => prev + 1);
        }

        setLastTapTime(now);

        // Ouvrir le panneau admin après 5 taps rapides (réduit de 7 à 5)
        if (tapCount >= 4) { // tapCount commence à 0, donc 4 = 5 taps
            console.log('Opening admin panel!');
            setTapCount(0);
            onShowPanel();
        }
    };

    // Calculer l'opacité basée sur le nombre de taps
    const getOpacity = () => {
        if (tapCount === 0) return 0;
        if (tapCount === 1) return 0.1;
        if (tapCount === 2) return 0.2;
        if (tapCount === 3) return 0.4;
        return 0.6;
    };

    // Calculer la taille basée sur le nombre de taps
    const getSize = () => {
        if (tapCount === 0) return 'w-16 h-16';
        if (tapCount === 1) return 'w-18 h-18';
        if (tapCount === 2) return 'w-20 h-20';
        if (tapCount === 3) return 'w-24 h-24';
        return 'w-28 h-28';
    };

    return (
        <>
            {/* Zone de tap principale - plus grande et plus visible */}
            <TouchableOpacity
                onPress={handleTap}
                className={`absolute bottom-4 right-4 ${getSize()} rounded-full`}
                activeOpacity={0.8}
                style={{
                    backgroundColor: `rgba(65, 105, 225, ${getOpacity()})`,
                    borderWidth: tapCount > 0 ? 2 : 0,
                    borderColor: '#4169E1',
                }}
            >
                {/* Indicateur visuel qui devient plus visible avec les taps */}
                <View className="w-full h-full rounded-full items-center justify-center">
                    {tapCount > 0 && (
                        <Text
                            className="text-white font-bold"
                            style={{ fontSize: 12 + tapCount * 2 }}
                        >
                            {tapCount}/5
                        </Text>
                    )}

                    {tapCount > 2 && (
                        <Ionicons
                            name="settings"
                            size={16 + tapCount * 2}
                            color="white"
                        />
                    )}
                </View>
            </TouchableOpacity>

            {/* Zone de tap alternative dans le coin supérieur gauche (plus discrète) */}
            <TouchableOpacity
                onPress={handleTap}
                className="absolute top-4 left-4 w-12 h-12"
                activeOpacity={1}
            >
                <View className="w-full h-full" />
                {tapCount > 1 && (
                    <View
                        className="absolute top-0 left-0 w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#4169E1', opacity: 0.6 }}
                    />
                )}
            </TouchableOpacity>

            {/* Instructions temporaires après le premier tap */}
            {tapCount > 0 && tapCount < 5 && (
                <View className="absolute bottom-24 right-4 bg-black bg-opacity-75 p-2 rounded-lg">
                    <Text className="text-white text-xs">
                        Continuez à taper ({tapCount}/5)
                    </Text>
                </View>
            )}

            {/* Message d'encouragement */}
            {tapCount === 4 && (
                <View className="absolute bottom-32 right-4 bg-green-600 bg-opacity-90 p-2 rounded-lg">
                    <Text className="text-white text-xs font-bold">
                        Un tap de plus ! 🎯
                    </Text>
                </View>
            )}
        </>
    );
};

export default AdminPanel;