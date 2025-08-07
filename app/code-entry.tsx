// app/code-entry.tsx
import React, { useState, useEffect } from 'react';
import { View, Keyboard, Text } from 'react-native';
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

export default function CodeValidationScreen() {
    const router = useRouter();
    const { error } = useLocalSearchParams();
    const { code, isComplete, handleCodeChange, getFullCode } = useCodeInput(DEFAULT_CODE_LENGTH);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Debug state
    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
        setRenderCount(prev => prev + 1);
        console.log("Code Entry Screen rendered:", renderCount + 1, "times");
    }, [code, isComplete]);

    // Gérer les erreurs de validation redirigées
    useEffect(() => {
        if (error === 'invalidCode') {
            setErrorTitle('Code invalide');
            setErrorMessage('Le code que vous avez saisi est incorrect. Veuillez réessayer.');
            setErrorModalVisible(true);
        } else if (error === 'serverError') {
            setErrorTitle('Erreur de serveur');
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard ou contacter le secrétariat.');
            setErrorModalVisible(true);
        }
    }, [error]);

    const handleBack = () => {
        router.push(ROUTES.CHECK_IN_METHOD);
    };

    const handleValidation = async () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            setLoading(true);

            try {
                // Vérifier d'abord si le code est valide
                const isValid = await ApiService.verifyAppointmentCode(fullCode);

                if (isValid) {
                    // MODIFICATION: Aller directement à la vérification (pas de carte vitale)
                    router.push({
                        pathname: ROUTES.VERIFICATION,
                        params: { code: fullCode }
                    });
                } else {
                    setErrorTitle('Code invalide');
                    setErrorMessage('Le code que vous avez saisi ne correspond à aucun rendez-vous dans notre système.');
                    setErrorModalVisible(true);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du code:', error);
                setErrorTitle('Erreur de serveur');
                setErrorMessage('Une erreur s\'est produite lors de la vérification. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            } finally {
                setLoading(false);
            }
        } else {
            Keyboard.dismiss();
            setErrorTitle('Code incomplet');
            setErrorMessage('Veuillez saisir un code à 7 chiffres.');
            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
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
            <View className="w-full max-w-2xl mx-auto px-4 flex-1 justify-center">
                {/* Bouton retour */}
                <View className="w-full mb-4">
                    <Button
                        title="← Retour"
                        onPress={handleBack}
                        variant="secondary"
                        className="self-start px-4 py-3"
                    />
                </View>

                {/* Contenu principal centré */}
                <View className="flex-1 justify-center items-center">
                    <Heading className="mb-3 text-center text-xl">
                        Validation du rendez-vous
                    </Heading>

                    <Paragraph className="mb-6 text-center px-4 text-sm">
                        Pour toute autre information, adressez-vous au secrétariat
                    </Paragraph>

                    <SubHeading className="mb-4 text-base">
                        Veuillez entrer votre code
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
                        className="w-64 h-14 justify-center items-center"
                    />
                </View>
            </View>

            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />
        </ScreenLayout>
    );
}
