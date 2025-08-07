// app/mutuelle-scan.tsx
import React, { useState } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { readHealthCard } from '../utils';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function MutuelleScanScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const { triggerActivity } = useActivity(); // Ajout du hook useActivity

    const handleMutuelleCard = async () => {
        // Déclencher l'événement d'activité
        triggerActivity();

        // Montrer l'indicateur de chargement
        setLoading(true);

        try {
            // Simuler la lecture de la carte Mutuelle
            await readHealthCard();

            // Naviguer vers l'écran de mutuelle validée
            router.push({
                pathname: ROUTES.MUTUELLE_VALIDATED,
                params: { code: code }
            });
        } catch (error) {
            console.error('Erreur lors de la lecture de la carte mutuelle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoMutuelle = () => {
        // Déclencher l'événement d'activité
        triggerActivity();

        // Naviguer directement vers la page de confirmation de paiement sans carte Mutuelle
        router.push({
            pathname: ROUTES.PAYMENT_CONFIRMATION,
            params: { code: code }
        });
    };

    return (
        <ScreenLayout>
            <Title className="mb-6 text-center text-[#4169E1] p-8">
                Scannez votre{"\n"}mutuelle
            </Title>

            {/* Nouveau visuel pour le scan de la mutuelle */}
            <TouchableOpacity
                onPress={handleMutuelleCard}
                onPressIn={triggerActivity} // Ajout de l'événement onPressIn
                onPressOut={triggerActivity} // Ajout de l'événement onPressOut
                activeOpacity={0.8}
                className="mb-16 items-center justify-center"
                disabled={loading}
            >
                {loading ? (
                    <LoadingIndicator size="large" />
                ) : (
                    <View className="relative" style={{ width: 264, height: 320, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Image QR code avec les mêmes dimensions que la carte Vitale */}
                        <Image
                            source={require('../assets/images/qr-code.png')}
                            style={{ width: 264, height: 264 }}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </TouchableOpacity>

            {/* Bouton "Je n'ai pas de mutuelle" */}
            <Button
                title="Je n'ai pas de mutuelle"
                onPress={handleNoMutuelle}
                variant="secondary"
                className="px-8"
            />
        </ScreenLayout>
    );
}