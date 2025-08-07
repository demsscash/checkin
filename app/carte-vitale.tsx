// app/carte-vitale.tsx
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Heading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { readHealthCard } from '../utils';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function CarteVitaleScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const { triggerActivity } = useActivity(); // Ajout du hook useActivity

    const handleCarteVitale = async () => {
        // Déclencher l'événement d'activité
        triggerActivity();

        // Montrer l'indicateur de chargement
        setLoading(true);

        try {
            // Simuler la lecture de la carte Vitale
            await readHealthCard();

            // Naviguer vers l'écran de carte Vitale validée
            router.push({
                pathname: ROUTES.CARTE_VITALE_VALIDATED,
                params: { code: code }
            });
        } catch (error) {
            console.error('Erreur lors de la lecture de la carte vitale:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoCarte = () => {
        // Déclencher l'événement d'activité
        triggerActivity();

        // Naviguer vers la page de scan de mutuelle même sans carte Vitale
        router.push({
            pathname: ROUTES.MUTUELLE_SCAN,
            params: { code: code }
        });
    };

    return (
        <ScreenLayout>
            <Heading className="mb-12 text-center">
                Merci d'insérer votre{"\n"}carte vitale
            </Heading>

            {/* Image de la carte Vitale et du lecteur avec indicateur de chargement si besoin */}
            <TouchableOpacity
                onPress={handleCarteVitale}
                onPressIn={triggerActivity} // Ajout de l'événement onPressIn
                onPressOut={triggerActivity} // Ajout de l'événement onPressOut
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