// app/mutuelle-validated.tsx
import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import { Title } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function MutuelleValidatedScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams();

    // Redirection automatique après un délai
    useEffect(() => {
        const timer = setTimeout(() => {
            // Après le délai, naviguer vers la page de confirmation de paiement
            router.push({
                pathname: ROUTES.PAYMENT_CONFIRMATION,
                params: { code: code }
            });
        }, 5000);

        return () => clearTimeout(timer);
    }, [code, router]);

    const handleNext = () => {
        // Si l'utilisateur clique sur Suivant, on va directement à la confirmation
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

            {/* Nouveau visuel pour le scan validé */}
            <View className="mb-16 relative items-center">
                {/* Image QR avec les mêmes dimensions que la carte Vitale */}
                <View className="relative" style={{ width: 264, height: 320, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={require('../assets/images/qr-code.png')}
                        style={{ width: 264, height: 264 }}
                        resizeMode="contain"
                    />

                    {/* Badge de validation */}
                    <View style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: 'rgba(240, 245, 255, 0.9)',
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