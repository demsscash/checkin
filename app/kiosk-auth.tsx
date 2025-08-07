// app/kiosk-auth.tsx - Version corrigée
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorModal from '../components/ui/ErrorModal';
import { Title, Paragraph, SubHeading } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { KioskAuthService } from '../services/kioskAuth';
import { useActivity } from '../components/layout/ActivityWrapper';

type KioskAuthScreenProps = {
    onAuthSuccess?: () => void;
};

export default function KioskAuthScreen({ onAuthSuccess }: KioskAuthScreenProps) {
    const router = useRouter();
    const { triggerActivity } = useActivity();

    // États du formulaire
    const [kioskCode, setKioskCode] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Récupérer l'adresse MAC au chargement
    useEffect(() => {
        const getMacAddress = async () => {
            try {
                const mac = await KioskAuthService.getMacAddress();
                setMacAddress(mac);
                console.log('Adresse MAC récupérée:', mac);
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'adresse MAC:', error);
                setErrorTitle('Erreur système');
                setErrorMessage('Impossible de récupérer l\'identifiant de l\'appareil.');
                setErrorModalVisible(true);
            }
        };

        getMacAddress();
    }, []);

    // Validation du formulaire
    const isFormValid = () => {
        return kioskCode.trim().length >= 3 && macAddress.length > 0;
    };

    // Authentification de la borne
    const handleAuthentication = async () => {
        if (!isFormValid()) {
            setErrorTitle('Informations manquantes');
            setErrorMessage('Veuillez saisir un code de borne valide.');
            setErrorModalVisible(true);
            return;
        }

        setLoading(true);
        setLoadingMessage('Authentification en cours...');

        try {
            console.log('Tentative d\'authentification avec:', {
                code: kioskCode.trim(),
                mac_adresse: macAddress
            });

            // Appeler l'API d'authentification
            const success = await ApiService.updateKioskMac(kioskCode.trim(), macAddress);

            if (success) {
                setLoadingMessage('Authentification réussie...');

                // Sauvegarder l'état d'authentification
                await KioskAuthService.setKioskAuthenticated(kioskCode.trim(), macAddress);

                // Attendre un peu pour que l'utilisateur voie le message de succès
                setTimeout(() => {
                    setLoading(false);

                    // Si nous avons une fonction de callback, l'appeler
                    if (onAuthSuccess) {
                        onAuthSuccess();
                    } else {
                        // Sinon, utiliser la navigation classique (pour les routes directes)
                        router.replace(ROUTES.HOME);
                    }
                }, 1500);
            } else {
                throw new Error('Authentification échouée');
            }
        } catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
            setLoading(false);

            if (error instanceof Error) {
                if (error.message.includes('404')) {
                    setErrorTitle('Code invalide');
                    setErrorMessage('Le code de borne saisi n\'existe pas dans le système.');
                } else if (error.message.includes('400')) {
                    setErrorTitle('Données invalides');
                    setErrorMessage('Les données fournies ne sont pas valides. Veuillez vérifier le code de borne.');
                } else {
                    setErrorTitle('Erreur de connexion');
                    setErrorMessage('Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.');
                }
            } else {
                setErrorTitle('Erreur inconnue');
                setErrorMessage('Une erreur inattendue s\'est produite. Veuillez réessayer.');
            }

            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    // Fonction pour régénérer l'adresse MAC (utile pour les tests)
    const regenerateMac = async () => {
        try {
            const newMac = await KioskAuthService.getMacAddress();
            setMacAddress(newMac);
            triggerActivity();
        } catch (error) {
            console.error('Erreur lors de la régénération de l\'adresse MAC:', error);
        }
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text={loadingMessage} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <View className="w-full max-w-lg">
                {/* En-tête avec icône */}
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow">
                        <Ionicons name="hardware-chip" size={40} color="#4169E1" />
                    </View>

                    <Title className="mb-4 text-center">
                        Authentification de la borne
                    </Title>

                    <Paragraph className="text-center px-4 text-base">
                        Cette borne doit être authentifiée avant utilisation.{'\n'}
                        Contactez l'administrateur si vous n'avez pas de code.
                    </Paragraph>
                </View>

                {/* Informations de l'appareil */}
                <Card className="mb-6">
                    <SubHeading className="mb-3 text-center">Informations de l'appareil</SubHeading>

                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-base text-gray-600">Identifiant appareil:</Text>
                        <View className="flex-row items-center">
                            <Text className="text-sm font-mono text-gray-800 mr-2">{macAddress}</Text>
                            <Button
                                title="↻"
                                onPress={regenerateMac}
                                variant="secondary"
                                className="px-2 py-1 min-h-0"
                                textClassName="text-sm"
                            />
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-base text-gray-600">Statut:</Text>
                        <Text className="text-base font-medium text-orange-600">Non authentifiée</Text>
                    </View>
                </Card>

                {/* Formulaire d'authentification */}
                <View className="w-full space-y-6">
                    <View>
                        <SubHeading className="mb-3 text-left">Code de la borne</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="Saisissez le code fourni par l'administrateur"
                            value={kioskCode}
                            onChangeText={(text) => {
                                setKioskCode(text.trim());
                                triggerActivity();
                            }}
                            autoCapitalize="characters"
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                            maxLength={20}
                        />
                        <Text className="text-sm text-gray-500 mt-1 ml-2">
                            Ce code vous a été fourni lors de l'installation
                        </Text>
                    </View>
                </View>

                {/* Bouton d'authentification */}
                <View className="mt-12">
                    <Button
                        title="Authentifier cette borne"
                        onPress={handleAuthentication}
                        variant="primary"
                        disabled={!isFormValid()}
                        className="w-full h-14 justify-center items-center"
                    />
                </View>

                {/* Aide */}
                <View className="mt-8">
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="help-circle-outline" size={20} color="#666" />
                        <Text className="text-sm text-gray-600 ml-2 text-center">
                            En cas de problème, contactez votre administrateur système
                        </Text>
                    </View>
                </View>

                {/* Informations de debug (seulement en mode développement) */}

            </View>

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />
        </ScreenLayout>
    );
}