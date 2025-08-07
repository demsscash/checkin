// app/carte-vitale-validated.tsx
import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { Heading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function CarteVitaleValidatedScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();

    // Redirection automatique après un délai
    useEffect(() => {
        const timer = setTimeout(() => {
            // Après le délai, naviguer vers la page de scan de mutuelle
            router.push({
                pathname: ROUTES.MUTUELLE_SCAN,
                params: { code: code }
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [code, router]);

    const handleNext = () => {
        // Si l'utilisateur clique sur Suivant, on va directement au scan de mutuelle
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

            {/* Image de la carte Vitale avec badge de validation superposé */}
            <View className="mb-16 relative">
                <Image
                    source={require('../assets/images/vitale.png')}
                    className="w-64 h-80"
                    resizeMode="contain"
                />

                {/* Badge de validation - position fixe */}
                <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 113,
                    height: 113,
                    borderRadius: 56.5,
                    backgroundColor: 'rgba(240, 245, 255, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.5,
                    elevation: 2
                }}>
                    <Text style={{ color: '#4169E1', fontSize: 30 }}>✓</Text>
                </View>
            </View>

            {/* Bouton "Suivant" */}
            <Button
                title="Suivant"
                onPress={handleNext}
                variant="secondary"
            />
        </ScreenLayout>
    );
}