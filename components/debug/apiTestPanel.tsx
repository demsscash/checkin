// components/debug/ApiTestPanel.tsx - Composant pour tester l'API réelle
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { ApiService } from '../../services/api';
import { KioskAuthService } from '../../services/kioskAuth';

type ApiTestPanelProps = {
    visible: boolean;
    onClose: () => void;
};

export const ApiTestPanel: React.FC<ApiTestPanelProps> = ({ visible, onClose }) => {
    const [testCode, setTestCode] = useState('');
    const [customMac, setCustomMac] = useState('');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState<string[]>([]);
    const [currentMac, setCurrentMac] = useState('');

    // Charger la MAC actuelle
    React.useEffect(() => {
        if (visible) {
            loadCurrentMac();
        }
    }, [visible]);

    const loadCurrentMac = async () => {
        try {
            const mac = await KioskAuthService.getMacAddress();
            setCurrentMac(mac);
            setCustomMac(mac); // Pré-remplir avec la MAC actuelle
        } catch (error) {
            console.error('Erreur lors du chargement de la MAC:', error);
        }
    };

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => {
        setTestResults([]);
    };

    const testApiCall = async () => {
        if (!testCode.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir un code de borne');
            return;
        }

        if (!customMac.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir une adresse MAC');
            return;
        }

        setLoading(true);
        clearLogs();

        addLog('🚀 Début du test API');
        addLog(`📋 Code: ${testCode.trim()}`);
        addLog(`📋 MAC: ${customMac.trim()}`);
        addLog(`📋 URL: https://borne.techfawn.fr/api/update-mac`);

        try {
            addLog('🔄 Appel de l\'API en cours...');

            // Forcer l'appel API sans fallback
            const success = await testApiDirectly(testCode.trim(), customMac.trim());

            if (success) {
                addLog('✅ Authentification réussie !');
                addLog('✅ Réponse: 200 OK');

                Alert.alert(
                    'Test API réussi ! 🎉',
                    `Le code "${testCode.trim()}" est valide et a été associé à la MAC "${customMac.trim()}"`,
                    [{ text: 'Excellent !' }]
                );
            } else {
                addLog('❌ Authentification échouée');
            }

        } catch (error) {
            addLog(`❌ Erreur: ${error}`);

            if (error instanceof Error) {
                if (error.message.includes('404')) {
                    addLog('📝 Code de borne non trouvé dans la base de données');
                    Alert.alert(
                        'Code non trouvé (404)',
                        `Le code "${testCode.trim()}" n'existe pas dans la base de données. Vérifiez avec l'administrateur.`
                    );
                } else if (error.message.includes('400')) {
                    addLog('📝 Données de requête invalides');
                    Alert.alert(
                        'Données invalides (400)',
                        'Le format du code ou de la MAC est incorrect.'
                    );
                } else if (error.message.includes('Network')) {
                    addLog('📝 Erreur de connexion réseau');
                    Alert.alert(
                        'Erreur réseau',
                        'Impossible de joindre le serveur. Vérifiez votre connexion internet.'
                    );
                } else {
                    addLog('📝 Erreur inattendue');
                    Alert.alert(
                        'Erreur inattendue',
                        error.message
                    );
                }
            }
        } finally {
            setLoading(false);
            addLog('🏁 Test terminé');
        }
    };

    // Fonction pour appeler l'API directement sans fallback
    const testApiDirectly = async (code: string, macAddress: string): Promise<boolean> => {
        const url = 'https://borne.techfawn.fr/api/update-mac';

        const requestData = {
            code: code,
            mac_adresse: macAddress.toUpperCase()
        };

        addLog(`📤 Envoi: ${JSON.stringify(requestData)}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData),
        });

        addLog(`📥 Statut reçu: ${response.status}`);

        if (response.status === 404) {
            throw new Error('404: Code de borne invalide');
        }

        if (response.status === 400) {
            throw new Error('400: Données invalides');
        }

        if (response.status === 200) {
            try {
                const responseData = await response.json();
                addLog(`📥 Réponse: ${JSON.stringify(responseData)}`);
            } catch (parseError) {
                addLog('📥 Réponse: (pas de JSON, mais succès)');
            }
            return true;
        }

        const responseText = await response.text();
        addLog(`📥 Réponse complète: ${responseText}`);
        throw new Error(`Erreur serveur: ${response.status}`);
    };

    const generateTestMac = () => {
        // Générer une MAC de test aléatoire
        const bytes = Array.from({ length: 6 }, () =>
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        );
        const testMac = bytes.join(':').toUpperCase();
        setCustomMac(testMac);
        addLog(`🎲 MAC de test générée: ${testMac}`);
    };

    const testWithCurrentFingerprint = async () => {
        try {
            addLog('🔄 Régénération de l\'empreinte actuelle...');
            const newMac = await KioskAuthService.getMacAddress();
            setCustomMac(newMac);
            addLog(`🆕 Nouvelle empreinte: ${newMac}`);
        } catch (error) {
            addLog(`❌ Erreur lors de la régénération: ${error}`);
        }
    };

    return (
        <Modal
            visible={visible}
            title="🔧 Test API réelle"
            message="Testez l'authentification avec de vrais codes de borne"
            type="info"
            primaryButtonText="Fermer"
            onPrimaryButtonPress={onClose}
        >
            <ScrollView className="mt-4 max-h-96">
                <View className="space-y-4">
                    {/* Configuration du test */}
                    <Card>
                        <Text className="text-sm font-semibold text-gray-800 mb-3">
                            Configuration du test
                        </Text>

                        <View className="space-y-3">
                            <View>
                                <Text className="text-xs text-gray-600 mb-1">Code de borne (réel)</Text>
                                <TextInput
                                    className="w-full h-10 bg-gray-100 rounded px-3 text-sm"
                                    placeholder="Ex: ABC123, BORNE001..."
                                    value={testCode}
                                    onChangeText={setTestCode}
                                    autoCapitalize="characters"
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    ⚠️ Le fallback TEST123 est désactivé - utilisez un vrai code
                                </Text>
                            </View>

                            <View>
                                <Text className="text-xs text-gray-600 mb-1">Adresse MAC</Text>
                                <View className="flex-row space-x-2">
                                    <TextInput
                                        className="flex-1 h-10 bg-gray-100 rounded px-3 text-sm font-mono"
                                        placeholder="AA:BB:CC:DD:EE:FF"
                                        value={customMac}
                                        onChangeText={setCustomMac}
                                        autoCapitalize="characters"
                                    />
                                    <Button
                                        title="🎲"
                                        onPress={generateTestMac}
                                        variant="secondary"
                                        className="px-3 py-2 min-h-0"
                                    />
                                </View>
                                <Text className="text-xs text-gray-500 mt-1">
                                    MAC actuelle: {currentMac}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Boutons d'action */}
                    <View className="space-y-2">
                        <View className="flex-row space-x-2">
                            <Button
                                title="🚀 Tester l'API"
                                onPress={testApiCall}
                                variant="primary"
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button
                                title="🗑️"
                                onPress={clearLogs}
                                variant="outline"
                                className="px-3"
                            />
                        </View>

                        <Button
                            title="🔄 Utiliser l'empreinte actuelle"
                            onPress={testWithCurrentFingerprint}
                            variant="secondary"
                            className="w-full"
                            disabled={loading}
                        />
                    </View>

                    {/* Résultats du test */}
                    {testResults.length > 0 && (
                        <Card className="bg-gray-50">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                📋 Logs de test
                            </Text>
                            <ScrollView className="max-h-40">
                                {testResults.map((result, index) => (
                                    <Text key={index} className="text-xs font-mono text-gray-700 mb-1">
                                        {result}
                                    </Text>
                                ))}
                            </ScrollView>
                        </Card>
                    )}

                    {/* Informations d'aide */}
                    <Card className="bg-yellow-50">
                        <Text className="text-sm font-semibold text-yellow-800 mb-2">
                            💡 Aide pour obtenir un code réel
                        </Text>
                        <Text className="text-xs text-yellow-700">
                            • Consultez la base de données "kiosks"{'\n'}
                            • Contactez l'administrateur système{'\n'}
                            • Utilisez l'interface d'administration{'\n'}
                            • URL testée: https://borne.techfawn.fr/api/update-mac
                        </Text>
                    </Card>

                    {/* Status de connexion */}
                    <Card className="bg-blue-50">
                        <Text className="text-sm font-semibold text-blue-800 mb-2">
                            🌐 Informations de connexion
                        </Text>
                        <Text className="text-xs text-blue-700">
                            • Méthode: PUT{'\n'}
                            • Content-Type: application/json{'\n'}
                            • Timeout: 30 secondes{'\n'}
                            • Fallback TEST123: DÉSACTIVÉ
                        </Text>
                    </Card>

                    {loading && (
                        <Card className="bg-green-50">
                            <View className="flex-row items-center">
                                <Ionicons name="hourglass" size={16} color="#10B981" />
                                <Text className="text-sm text-green-700 ml-2">
                                    Test en cours...
                                </Text>
                            </View>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </Modal>
    );
};

export default ApiTestPanel;