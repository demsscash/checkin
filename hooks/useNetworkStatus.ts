// hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Hook pour suivre l'état de la connexion réseau
 */
export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
    const [connectionType, setConnectionType] = useState<string | null>(null);

    useEffect(() => {
        // Fonction appelée quand l'état du réseau change
        const handleNetInfoChange = (state: NetInfoState) => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
            setConnectionType(state.type);
        };

        // S'abonner aux événements de changement d'état réseau
        const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

        // Récupérer l'état initial du réseau
        NetInfo.fetch().then(handleNetInfoChange);

        // Se désabonner lors du démontage du composant
        return () => {
            unsubscribe();
        };
    }, []);

    // Vérifier la connexion sur demande
    const checkConnection = async () => {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
        setConnectionType(state.type);
        return state.isConnected && state.isInternetReachable;
    };

    return {
        isConnected,
        isInternetReachable,
        connectionType,
        checkConnection
    };
};

export default useNetworkStatus;