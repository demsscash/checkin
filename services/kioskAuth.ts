// services/kioskAuth.ts - Version Expo managed workflow complète
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';

const KIOSK_AUTH_KEY = 'kiosk_authenticated';
const KIOSK_CODE_KEY = 'kiosk_code';
const KIOSK_MAC_KEY = 'kiosk_mac';

// Interface pour l'empreinte composite Expo
interface ExpoDeviceFingerprint {
    // Identifiants Expo
    applicationId: string;
    applicationName: string;
    nativeApplicationVersion: string;
    nativeBuildVersion: string;

    // Informations Device
    brand: string;
    designName: string;
    deviceName: string;
    deviceType: number;
    manufacturer: string;
    modelId: string;
    modelName: string;
    osName: string;
    osVersion: string;
    platformApiLevel: number;
    productName: string;

    // Informations système
    totalMemory: number;
    isDevice: boolean;

    // Informations réseau
    networkState: string;
    ipAddress: string;

    // Identifiants uniques
    installationId: string;
    sessionId: string;

    // Hash composite
    hash: string;
}

// Interface pour le stockage
interface StorageInterface {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiSet(pairs: [string, string][]): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
}

// Implémentation du stockage pour Expo
class ExpoSecureStorage implements StorageInterface {
    async getItem(key: string): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key);
            }
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.warn('SecureStore.getItem failed, using memory:', error);
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
                return;
            }
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.warn('SecureStore.setItem failed:', error);
            throw error;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
                return;
            }
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.warn('SecureStore.removeItem failed:', error);
            throw error;
        }
    }

    async multiSet(pairs: [string, string][]): Promise<void> {
        for (const [key, value] of pairs) {
            await this.setItem(key, value);
        }
    }

    async multiRemove(keys: string[]): Promise<void> {
        for (const key of keys) {
            await this.removeItem(key);
        }
    }

    async multiGet(keys: string[]): Promise<[string, string | null][]> {
        const results: [string, string | null][] = [];
        for (const key of keys) {
            const value = await this.getItem(key);
            results.push([key, value]);
        }
        return results;
    }
}

// Fallback en mémoire
class MemoryStorage implements StorageInterface {
    private storage: Map<string, string> = new Map();

    async getItem(key: string): Promise<string | null> {
        return this.storage.get(key) || null;
    }

    async setItem(key: string, value: string): Promise<void> {
        this.storage.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.storage.delete(key);
    }

    async multiSet(pairs: [string, string][]): Promise<void> {
        for (const [key, value] of pairs) {
            this.storage.set(key, value);
        }
    }

    async multiRemove(keys: string[]): Promise<void> {
        for (const key of keys) {
            this.storage.delete(key);
        }
    }

    async multiGet(keys: string[]): Promise<[string, string | null][]> {
        return keys.map(key => [key, this.storage.get(key) || null]);
    }
}

const getStorage = (): StorageInterface => {
    try {
        return new ExpoSecureStorage();
    } catch (error) {
        console.warn('SecureStore non disponible, utilisation du stockage en mémoire');
        return new MemoryStorage();
    }
};

const storage = getStorage();

/**
 * Service pour gérer l'authentification de la borne avec empreinte Expo
 */
export const KioskAuthService = {
    /**
     * Vérifie si la borne est déjà authentifiée
     */
    async isKioskAuthenticated(): Promise<boolean> {
        try {
            const authStatus = await storage.getItem(KIOSK_AUTH_KEY);
            return authStatus === 'true';
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            return false;
        }
    },

    /**
     * Marque la borne comme authentifiée
     */
    async setKioskAuthenticated(code: string, mac: string): Promise<void> {
        try {
            await storage.multiSet([
                [KIOSK_AUTH_KEY, 'true'],
                [KIOSK_CODE_KEY, code],
                [KIOSK_MAC_KEY, mac]
            ]);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'authentification:', error);
            throw error;
        }
    },

    /**
     * Collecte toutes les informations disponibles via Expo
     */
    async collectExpoFingerprint(): Promise<ExpoDeviceFingerprint> {
        console.log('Collecte de l\'empreinte Expo...');

        const fingerprint: Partial<ExpoDeviceFingerprint> = {};

        try {
            // Informations de l'application (Expo Application)
            fingerprint.applicationId = await this.safeCall(() => Application.getApplicationIdAsync(), 'unknown-app-id');
            fingerprint.applicationName = Application.applicationName || 'MedicalApp';
            fingerprint.nativeApplicationVersion = Application.nativeApplicationVersion || '1.0.0';
            fingerprint.nativeBuildVersion = Application.nativeBuildVersion || '1';

            // Informations de l'appareil (Expo Device)
            fingerprint.brand = Device.brand || 'unknown-brand';
            fingerprint.designName = Device.designName || 'unknown-design';
            fingerprint.deviceName = Device.deviceName || 'unknown-device';
            fingerprint.deviceType = Device.deviceType || 0;
            fingerprint.manufacturer = Device.manufacturer || 'unknown-manufacturer';
            fingerprint.modelId = Device.modelId || 'unknown-model-id';
            fingerprint.modelName = Device.modelName || 'unknown-model';
            fingerprint.osName = Device.osName || Platform.OS;
            fingerprint.osVersion = Device.osVersion || '0.0';
            fingerprint.platformApiLevel = Device.platformApiLevel || 0;
            fingerprint.productName = Device.productName || 'unknown-product';
            fingerprint.totalMemory = Device.totalMemory || 0;
            fingerprint.isDevice = Device.isDevice || false;

            // Informations réseau (Expo Network)
            try {
                const networkState = await Network.getNetworkStateAsync();
                fingerprint.networkState = networkState.type || 'unknown';
                fingerprint.ipAddress = await this.safeCall(() => Network.getIpAddressAsync(), '0.0.0.0');
            } catch (error) {
                fingerprint.networkState = 'unknown';
                fingerprint.ipAddress = '0.0.0.0';
            }

            // Identifiants uniques générés
            fingerprint.installationId = await this.getOrCreateInstallationId();
            fingerprint.sessionId = Constants.sessionId || this.generateSessionId();

            // Créer un hash composite
            fingerprint.hash = this.createExpoCompositeHash(fingerprint as ExpoDeviceFingerprint);

            console.log('Empreinte Expo collectée:', {
                brand: fingerprint.brand,
                modelName: fingerprint.modelName,
                osName: fingerprint.osName,
                osVersion: fingerprint.osVersion,
                deviceType: fingerprint.deviceType,
                hash: fingerprint.hash
            });

        } catch (error) {
            console.error('Erreur lors de la collecte de l\'empreinte Expo:', error);
        }

        return fingerprint as ExpoDeviceFingerprint;
    },

    /**
     * Obtient ou crée un ID d'installation persistant
     */
    async getOrCreateInstallationId(): Promise<string> {
        const INSTALLATION_ID_KEY = 'expo_installation_id';

        try {
            let installationId = await storage.getItem(INSTALLATION_ID_KEY);

            if (!installationId) {
                // Générer un nouvel ID d'installation
                installationId = this.generateUniqueId();
                await storage.setItem(INSTALLATION_ID_KEY, installationId);
                console.log('Nouvel ID d\'installation généré:', installationId);
            }

            return installationId;
        } catch (error) {
            console.warn('Erreur avec l\'ID d\'installation, génération temporaire:', error);
            return this.generateUniqueId();
        }
    },

    /**
     * Génère un ID unique
     */
    generateUniqueId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${random}`;
    },

    /**
     * Génère un ID de session
     */
    generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    },

    /**
     * Exécute une fonction de manière sécurisée avec fallback
     */
    async safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
        try {
            const result = await fn();
            return result !== null && result !== undefined ? result : fallback;
        } catch (error) {
            console.warn('SafeCall failed, using fallback:', error);
            return fallback;
        }
    },

    /**
     * Crée un hash composite à partir de toutes les informations Expo
     */
    createExpoCompositeHash(fingerprint: ExpoDeviceFingerprint): string {
        const composite = [
            fingerprint.applicationId,
            fingerprint.brand,
            fingerprint.modelName,
            fingerprint.modelId,
            fingerprint.osName,
            fingerprint.osVersion,
            fingerprint.manufacturer,
            fingerprint.productName,
            fingerprint.deviceType.toString(),
            fingerprint.platformApiLevel.toString(),
            fingerprint.totalMemory.toString(),
            fingerprint.installationId,
            fingerprint.nativeBuildVersion,
            fingerprint.isDevice.toString()
        ].filter(Boolean).join('|');

        return this.stringToHash(composite);
    },

    /**
     * Convertit une chaîne en hash hexadécimal
     */
    stringToHash(str: string): string {
        let hash = 0;
        if (str.length === 0) return '0';

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16).padStart(8, '0');
    },

    /**
     * Récupère l'adresse MAC composite pour Expo
     */
    async getMacAddress(): Promise<string> {
        try {
            console.log('Génération de l\'adresse MAC Expo...');

            // Collecter l'empreinte Expo
            const fingerprint = await this.collectExpoFingerprint();

            // Stratégie de priorité pour Expo
            let macSource = '';

            // Priorité 1 : Combinaison d'identifiants uniques Expo
            if (fingerprint.installationId && fingerprint.applicationId) {
                macSource = `${fingerprint.installationId}-${fingerprint.applicationId}-${fingerprint.modelId}`;
                console.log('Utilisation des identifiants uniques Expo');
            } else {
                // Priorité 2 : Empreinte matérielle
                macSource = `${fingerprint.brand}-${fingerprint.modelName}-${fingerprint.osName}-${fingerprint.hash}`;
                console.log('Utilisation de l\'empreinte matérielle Expo');
            }

            // Convertir en format MAC
            const macAddress = this.stringToMAC(macSource);

            console.log('Adresse MAC Expo générée:', macAddress);
            console.log('Source utilisée:', macSource.substring(0, 50) + '...');

            return macAddress;

        } catch (error) {
            console.error('Erreur lors de la génération de l\'adresse MAC Expo:', error);
            return this.generateFallbackMAC();
        }
    },

    /**
     * Convertit une chaîne en format MAC address pour Expo
     */
    stringToMAC(input: string): string {
        // Créer un hash double pour plus de robustesse
        const hash1 = this.stringToHash(input);
        const hash2 = this.stringToHash(input.split('').reverse().join(''));
        const combinedHash = hash1 + hash2;

        // Prendre les premiers 12 caractères hex
        const macHex = combinedHash.substring(0, 12).padEnd(12, '0');

        // S'assurer que le premier byte n'est pas multicast
        const firstByte = parseInt(macHex.substring(0, 2), 16);
        const cleanFirstByte = (firstByte & 0xFE).toString(16).padStart(2, '0');

        const cleanMac = cleanFirstByte + macHex.substring(2);

        return cleanMac.match(/.{2}/g)?.join(':').toUpperCase() || this.generateFallbackMAC();
    },

    /**
     * Génère une MAC de fallback pour Expo
     */
    generateFallbackMAC(): string {
        console.warn('Utilisation de la MAC de fallback Expo');
        const timestamp = Date.now().toString(16);
        const random = Math.random().toString(16).substring(2, 8);
        const platform = Platform.OS.substring(0, 3);

        const fallback = (timestamp + random + platform).substring(0, 12).padEnd(12, '0');

        return fallback.match(/.{2}/g)?.join(':').toUpperCase() || 'EX:PO:00:00:00:01';
    },

    /**
     * Génère un identifiant web unique pour Expo Web
     */
    async generateExpoWebFingerprint(): Promise<string> {
        if (Platform.OS !== 'web') {
            return this.generateFallbackMAC();
        }

        try {
            // Canvas fingerprinting pour Expo Web
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillText('Expo Kiosk 2025', 2, 2);
            }
            const canvasFingerprint = canvas.toDataURL().slice(-16);

            // Informations spécifiques Expo Web
            const expoWebInfo = [
                Constants.expoVersion || 'unknown-expo',
                Constants.platform?.web?.bundler || 'unknown-bundler',
                navigator.userAgent,
                navigator.language,
                window.screen.width.toString(),
                window.screen.height.toString(),
                canvasFingerprint,
                location.hostname,
                Constants.sessionId || 'unknown-session'
            ].join('|');

            return this.stringToMAC(expoWebInfo);

        } catch (error) {
            console.error('Erreur lors de la génération de l\'empreinte Expo Web:', error);
            return this.generateFallbackMAC();
        }
    },

    /**
     * Récupère des informations détaillées sur l'empreinte Expo
     */
    async getDetailedFingerprint(): Promise<{ fingerprint: ExpoDeviceFingerprint, macAddress: string }> {
        const fingerprint = await this.collectExpoFingerprint();
        const macAddress = await this.getMacAddress();

        return { fingerprint, macAddress };
    },

    /**
     * Réinitialise l'authentification de la borne
     */
    async resetKioskAuthentication(): Promise<void> {
        try {
            await storage.multiRemove([KIOSK_AUTH_KEY, KIOSK_CODE_KEY, KIOSK_MAC_KEY]);
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            throw error;
        }
    },

    /**
     * Récupère les informations sauvegardées de la borne
     */
    async getKioskInfo(): Promise<{ code: string | null; mac: string | null }> {
        try {
            const data = await storage.multiGet([KIOSK_CODE_KEY, KIOSK_MAC_KEY]);
            return {
                code: data[0][1],
                mac: data[1][1]
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des infos borne:', error);
            return { code: null, mac: null };
        }
    }
};

export default KioskAuthService;
// CONFIGURATION CHECKIN APP
export const KIOSK_TYPE = 'CHECKIN';
export const getKioskType = () => 'checkin';
