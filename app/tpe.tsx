// app/tpe.tsx
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function TPEScreen() {
    const router = useRouter();
    const { code, appointmentId } = useLocalSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const { triggerActivity } = useActivity(); // Ajout du hook useActivity

    // Vérifier la présence de l'ID du rendez-vous
    useEffect(() => {
        if (!appointmentId) {
            console.warn("TPE: Aucun ID de rendez-vous fourni, utilisation du code comme fallback.");
        } else {
            console.log(`TPE: ID de rendez-vous fourni: ${appointmentId}`);
        }
    }, [appointmentId]);

    // Simuler un délai de traitement du paiement de 2 secondes
    useEffect(() => {
        if (isProcessing) {
            const timer = setTimeout(() => {
                handlePaymentComplete();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isProcessing]);

    // Fonction appelée quand l'utilisateur "tape" sur le TPE
    const handleTapTPE = () => {
        // Déclencher l'événement d'activité
        triggerActivity();
        setIsProcessing(true);
    };

    // Fonction appelée quand le paiement est terminé
    const handlePaymentComplete = () => {
        // Naviguer vers l'écran de succès avec l'ID du rendez-vous
        router.push({
            pathname: ROUTES.PAYMENT_SUCCESS,
            params: {
                appointmentId: appointmentId || code // Utiliser l'ID du rendez-vous ou le code comme fallback
            }
        });
    };

    return (
        <ScreenLayout>
            <Title className="mb-12">
                Payer maintenant
            </Title>

            {/* Image TPE avec indicateur de chargement si nécessaire */}
            <TouchableOpacity
                onPress={handleTapTPE}
                onPressIn={triggerActivity} // Ajout de l'événement onPressIn
                onPressOut={triggerActivity} // Ajout de l'événement onPressOut
                activeOpacity={0.8}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <LoadingIndicator text="Traitement en cours..." />
                ) : (
                    <Image
                        source={require('../assets/images/tpe.png')}
                        className="w-96 h-96"
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>
        </ScreenLayout>
    );
}