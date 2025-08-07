// app/checkin-carte-vitale.tsx
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Heading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { readHealthCard } from '../utils';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function CheckinCarteVitaleScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const { triggerActivity } = useActivity();

    const handleCarteVitale = async () => {
        triggerActivity();
        setLoading(true);

        try {
            // Simuler la lecture de la carte Vitale
            await readHealthCard();

            // Naviguer vers l'écran de carte Vitale validée du check-in
            router.push({
                pathname: ROUTES.CHECKIN_CARTE_VITALE_VALIDATED,
                params: { code }
            });
        } catch (error) {
            console.error('Erreur lors de la lecture de la carte vitale:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoCarte = () => {
        triggerActivity();

        // Si pas de carte, aller directement à la vérification
        router.push({
            pathname: ROUTES.VERIFICATION,
            params: { code }
        });
    };

    return (
        <ScreenLayout>
            <Heading className="mb-8 text-center">
                Merci d'insérer votre{"\n"}carte vitale
            </Heading>

            <Paragraph className="mb-6 text-center">
                Pour vérifier votre identité et faciliter votre prise en charge
            </Paragraph>

            {/* Image de la carte Vitale et du lecteur */}
            <TouchableOpacity
                onPress={handleCarteVitale}
                onPressIn={triggerActivity}
                onPressOut={triggerActivity}
                activeOpacity={0.8}
                className="mb-16 items-center justify-center"
                disabled={loading}
            >
                <Image
                    source={require('../assets/images/vitale.png')}
                    className="w-64 h-80"
                    resizeMode="contain"
                />

                {loading && (
                    <View className="absolute">
                        <LoadingIndicator size="large" />
                    </View>
                )}
            </TouchableOpacity>

            {/* Bouton "Je n'ai pas de carte Vitale" */}
            <Button
                title="Je n'ai pas de carte Vitale"
                onPress={handleNoCarte}
                variant="secondary"
            />
        </ScreenLayout>
    );
}