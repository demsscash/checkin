// app/payment-success.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Title, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { appointmentId } = useLocalSearchParams();
    const [downloading, setDownloading] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(20);
    const [endTime, setEndTime] = useState(Date.now() + 20000);
    const [downloadType, setDownloadType] = useState<string | null>(null);

    // Fonction pour mettre à jour le timer
    const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        setSecondsLeft(remaining);

        if (remaining <= 0) {
            router.push(ROUTES.HOME);
        }

        return remaining > 0;
    };

    // Effet pour gérer le timer
    useEffect(() => {
        // Ne démarrer le timer que si nous ne sommes pas en mode téléchargement
        if (downloading) return;

        // Mettre à jour immédiatement
        updateTimer();

        // Puis mettre à jour chaque seconde
        const interval = setInterval(() => {
            const shouldContinue = updateTimer();
            if (!shouldContinue) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, downloading, router]);

    // Fonction pour réinitialiser le timer à 20 secondes
    const resetTimer = () => {
        setEndTime(Date.now() + 20000);
    };

    // Fonction pour gérer le téléchargement des documents
    const handleDownload = async (type: string) => {
        if (!appointmentId) {
            Alert.alert(
                'Erreur',
                'Identifiant de rendez-vous manquant. Veuillez contacter le secrétariat.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Mettre en mode téléchargement (ce qui arrête le timer)
        setDownloading(true);
        setDownloadType(type);

        try {
            const idNumber = parseInt(appointmentId as string);
            console.log(`Téléchargement du ${type} pour le rendez-vous ID=${idNumber}`);

            if (type === 'reçu') {
                await ApiService.downloadAndShareInvoice(idNumber);
            } else {
                await ApiService.downloadAndSharePrescription(idNumber);
            }

            // Réinitialiser après le téléchargement
            setDownloading(false);
            setDownloadType(null);
            resetTimer();

        } catch (error) {
            console.error(`Erreur lors du téléchargement du ${type}:`, error);

            // Réinitialiser l'état en cas d'erreur
            setDownloading(false);
            setDownloadType(null);

            Alert.alert(
                'Erreur de téléchargement',
                `Une erreur est survenue lors du téléchargement du ${type}. Veuillez réessayer ou contacter le secrétariat.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        // Réinitialiser le timer même en cas d'erreur
                        resetTimer();
                    }
                }]
            );
        }
    };

    return (
        <ScreenLayout>
            {/* Cercle avec coche */}
            <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-8 shadow">
                <Text className="text-[#4169E1] text-4xl">✓</Text>
            </View>

            {/* Titre de succès */}
            <Title className="mb-4 text-[#4169E1]">
                Paiement réussi !
            </Title>

            {/* Message de succès */}
            <Paragraph className="text-lg text-gray-700 text-center mb-12">
                Vos documents sont prêts à être téléchargés.
            </Paragraph>

            {/* Affichage du timer (petit et discret) - masqué pendant le téléchargement */}
            {!downloading && (
                <Paragraph className="text-sm text-gray-400 text-center mb-8">
                    Retour à l'accueil dans {secondsLeft} secondes
                </Paragraph>
            )}

            {/* Boutons de téléchargement */}
            {!downloading ? (
                <View className="flex-row justify-center space-x-4">
                    <Button
                        title="Imprimer la facture"
                        onPress={() => handleDownload('reçu')}
                        variant="secondary"
                        className="px-6"
                    />

                    <Button
                        title="Imprimer l'ordonnance"
                        onPress={() => handleDownload('ordonnance')}
                        variant="secondary"
                        className="px-6"
                    />
                </View>
            ) : (
                <View className="items-center">
                    <LoadingIndicator size="large" />
                    <Text className="text-lg text-gray-700 mt-4">
                        Téléchargement du {downloadType} en cours...
                    </Text>
                </View>
            )}
        </ScreenLayout>
    );
}