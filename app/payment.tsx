// app/payment.tsx
import React, { useEffect, useState } from 'react';
import { Keyboard, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import CodeInput from '../components/ui/CodeInput';
import Button from '../components/ui/Button';
import ErrorModal from '../components/ui/ErrorModal';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';
import useCodeInput from '../hooks/useCodeInput';
import { ApiService } from '../services/api';

export default function PaymentScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);
    const [loading, setLoading] = useState(false);

    // Debug state
    const [renderCount, setRenderCount] = useState(0);

    // Update render count to track re-renders
    useEffect(() => {
        setRenderCount(prev => prev + 1);
        console.log("Payment Screen rendered:", renderCount + 1, "times");
        console.log("Current code state:", code);
        console.log("Is complete:", isComplete);
    }, [code, isComplete]);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            setErrorTitle('Code facture invalide');
            setErrorMessage('Le code que vous avez saisi ne correspond à aucune facture dans notre système.');
            setErrorModalVisible(true);
        } else if (error === 'serverError') {
            setErrorTitle('Erreur de serveur');
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard ou contacter le secrétariat.');
            setErrorModalVisible(true);
        }
    }, [error]);

    const handleValidation = async () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            setLoading(true);

            try {
                // Utiliser la nouvelle fonction getPaymentByCode qui se base sur GET_APPOINTMENT
                console.log("Vérification du code de paiement:", fullCode);
                const paymentInfo = await ApiService.getPaymentByCode(fullCode);

                if (paymentInfo && paymentInfo.appointmentId) {
                    console.log("Informations de paiement trouvées:", paymentInfo);
                    console.log("ID du rendez-vous:", paymentInfo.appointmentId);

                    // Naviguer vers la page de carte vitale avec le code et l'ID du rendez-vous
                    router.push({
                        pathname: ROUTES.CARTE_VITALE,
                        params: {
                            code: fullCode,
                            appointmentId: paymentInfo.appointmentId.toString()
                        }
                    });
                } else {
                    // Aucune information de paiement trouvée - Message cohérent avec celui de verification.tsx
                    console.error("Aucune information de paiement trouvée pour le code:", fullCode);
                    setErrorTitle('Code facture invalide');
                    setErrorMessage('Le code que vous avez saisi ne correspond à aucune facture dans notre système.');
                    setErrorModalVisible(true);
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du code:", error);
                setErrorTitle('Erreur serveur');
                setErrorMessage('Une erreur s\'est produite lors de la vérification. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            } finally {
                setLoading(false);
            }
        } else {
            Keyboard.dismiss();
            setErrorTitle('Code incomplet');
            setErrorMessage('Veuillez saisir un code facture à 6 chiffres.');
            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    // Debug info renderer
    const renderDebugInfo = () => {
        return (
            <View className="absolute bottom-2 left-2 bg-white p-2 rounded-lg opacity-70">
                <Text className="text-xs">Complete: {isComplete ? 'Yes' : 'No'}</Text>
                <Text className="text-xs">Code: {code.join('')}</Text>
                <Text className="text-xs">Renders: {renderCount}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Vérification en cours..." />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <Heading className="mb-4 text-center">
                Régler votre facture
            </Heading>

            <Paragraph className="mb-8 text-center px-5">
                Pour toute autre information adressez vous au secrétariat
            </Paragraph>

            <SubHeading className="mb-6">
                Veuillez entrer le code facture
            </SubHeading>

            <CodeInput
                codeLength={DEFAULT_CODE_LENGTH}
                value={code}
                onChange={handleCodeChange}
                containerClassName="mb-8"
            />

            <Button
                title="Valider"
                onPress={handleValidation}
                variant="primary"
                disabled={!isComplete}
                className={`w-64 h-14 justify-center items-center`}
            />

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />

            {/* Debug info (only visible in dev mode) */}
            {__DEV__ && renderDebugInfo()}
        </ScreenLayout>
    );
}