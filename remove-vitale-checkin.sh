#!/bin/bash
# remove-vitale-checkin.sh
# Supprimer l'étape carte vitale du flux check-in

set -e

echo "🔧 Suppression de l'étape carte vitale dans CheckIn App..."

# Vérifications
if [ ! -f "app/code-entry.tsx" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier checkin-app"
    exit 1
fi

# 1. Modifier code-entry.tsx pour aller directement à verification
echo "📝 Modification de code-entry.tsx..."

cat > app/code-entry.tsx << 'EOF'
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
EOF

# 2. Modifier personal-search.tsx pour aller directement à verification aussi
echo "📝 Modification de personal-search.tsx..."

cat > app/personal-search.tsx << 'EOF'
// app/personal-search.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorModal from '../components/ui/ErrorModal';
import { Heading, SubHeading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function PersonalSearchScreen() {
    const router = useRouter();
    const { triggerActivity } = useActivity();

    // États du formulaire
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [loading, setLoading] = useState(false);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Validation du formulaire
    const isFormValid = () => {
        return nom.trim().length >= 2 &&
            prenom.trim().length >= 2 &&
            dateNaissance.length === 10 &&
            /^\d{2}\/\d{2}\/\d{4}$/.test(dateNaissance) &&
            isValidDate(dateNaissance);
    };

    const isValidDate = (dateStr: string) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

        const [day, month, year] = dateStr.split('/').map(Number);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;

        const daysInMonth = new Date(year, month, 0).getDate();
        return day <= daysInMonth;
    };

    const handleDateChange = (text: string) => {
        if (text.length < dateNaissance.length) {
            setDateNaissance(text);
            triggerActivity();
            return;
        }

        const numbers = text.replace(/\D/g, '');
        const limitedNumbers = numbers.slice(0, 8);

        let formatted = '';

        if (limitedNumbers.length <= 2) {
            formatted = limitedNumbers;
        } else if (limitedNumbers.length <= 4) {
            formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2);
        } else {
            formatted = limitedNumbers.slice(0, 2) + '/' +
                limitedNumbers.slice(2, 4) + '/' +
                limitedNumbers.slice(4);
        }

        setDateNaissance(formatted);
        triggerActivity();
    };

    const handleSearch = async () => {
        if (!isFormValid()) {
            setErrorTitle('Informations incomplètes');
            setErrorMessage('Veuillez remplir tous les champs correctement.\nFormat de date attendu : JJ/MM/AAAA\nVérifiez que la date est valide.');
            setErrorModalVisible(true);
            return;
        }

        setLoading(true);

        try {
            const [day, month, year] = dateNaissance.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const searchData = {
                nom: nom.trim().toUpperCase(),
                prenom: prenom.trim(),
                date_naissance: isoDate
            };

            console.log('Recherche avec les données:', searchData);

            const appointmentData = await ApiService.searchAppointmentByPersonalInfo(searchData);

            if (appointmentData && appointmentData.validationCode) {
                console.log('Rendez-vous trouvé avec code de validation:', appointmentData.validationCode);

                // MODIFICATION: Aller directement à la vérification (pas de carte vitale)
                router.push({
                    pathname: ROUTES.VERIFICATION,
                    params: {
                        code: appointmentData.validationCode
                    }
                });
            } else {
                setErrorTitle('Aucun rendez-vous trouvé');
                setErrorMessage('Aucun rendez-vous n\'a été trouvé avec ces informations. Vérifiez vos données ou contactez le secrétariat.');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            setErrorTitle('Erreur de recherche');
            setErrorMessage('Une erreur s\'est produite lors de la recherche. Veuillez réessayer ou contacter le secrétariat.');
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Recherche en cours..." />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <View className="w-full max-w-md">
                {/* Bouton retour */}
                <View className="w-full mb-8">
                    <Button
                        title="← Retour"
                        onPress={handleBack}
                        variant="secondary"
                        className="self-start px-6"
                    />
                </View>

                <Heading className="mb-4 text-center">
                    Recherche par informations
                </Heading>

                <Paragraph className="mb-8 text-center px-4">
                    Saisissez vos informations personnelles pour retrouver votre rendez-vous
                </Paragraph>

                {/* Formulaire */}
                <View className="w-full space-y-6">
                    <View>
                        <SubHeading className="mb-3 text-left">Nom de famille</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="Votre nom de famille"
                            value={nom}
                            onChangeText={(text) => {
                                setNom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="characters"
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                    </View>

                    <View>
                        <SubHeading className="mb-3 text-left">Prénom</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="Votre prénom"
                            value={prenom}
                            onChangeText={(text) => {
                                setPrenom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="words"
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                    </View>

                    <View>
                        <SubHeading className="mb-3 text-left">Date de naissance</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="JJ/MM/AAAA"
                            value={dateNaissance}
                            onChangeText={handleDateChange}
                            keyboardType="numeric"
                            maxLength={10}
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                        <Text className="text-sm text-gray-500 mt-1 ml-2">
                            Format : JJ/MM/AAAA (ex: 15/03/1980)
                        </Text>
                    </View>
                </View>

                <View className="mt-12">
                    <Button
                        title="Rechercher mon rendez-vous"
                        onPress={handleSearch}
                        variant="primary"
                        disabled={!isFormValid()}
                        className="w-full h-14 justify-center items-center"
                    />
                </View>

                <View className="mt-8">
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="information-circle-outline" size={20} color="#666" />
                        <Text className="text-sm text-gray-600 ml-2 text-center">
                            Les informations doivent correspondre exactement à celles de votre rendez-vous
                        </Text>
                    </View>
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
EOF

# 3. Créer une copie de sauvegarde des fichiers carte vitale (au cas où)
echo "💾 Sauvegarde des fichiers carte vitale..."
mkdir -p backup-vitale
cp app/checkin-carte-vitale.tsx backup-vitale/ 2>/dev/null || true
cp app/checkin-carte-vitale-validated.tsx backup-vitale/ 2>/dev/null || true

# 4. Mettre à jour les routes si nécessaire
echo "📝 Vérification des routes..."

# Vérifier si le fichier routes existe et le mettre à jour si besoin
if [ -f "constants/routes.ts" ]; then
    # S'assurer que les routes carte vitale sont toujours là (mais non utilisées)
    echo "✓ Routes conservées pour compatibilité"
else
    echo "⚠️  Fichier routes.ts non trouvé"
fi

echo ""
echo "✅ Suppression de l'étape carte vitale terminée !"
echo ""
echo "🔄 Nouveau flux CheckIn :"
echo "  1. Choix méthode → /check-in-method"
echo "  2a. Code entry → /code-entry → DIRECTEMENT vers /verification"
echo "  2b. Recherche personnelle → /personal-search → DIRECTEMENT vers /verification"
echo "  3. Vérification → /verification → /appointment-confirmed"
echo ""
echo "🗑️  Étapes supprimées :"
echo "  - /checkin-carte-vitale (sautée)"
echo "  - /checkin-carte-vitale-validated (sautée)"
echo ""
echo "💾 Fichiers sauvegardés dans backup-vitale/ au cas où"
echo ""
echo "🚀 Pour tester :"
echo "  npx expo start --clear"