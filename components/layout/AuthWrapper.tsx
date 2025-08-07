import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import LoadingIndicator from '../ui/LoadingIndicator';
import { KioskAuthService } from '../../services/kioskAuth';
import KioskAuthScreen from '../../app/kiosk-auth';
import { ROUTES } from '../../constants/routes';

type AuthWrapperProps = {
    children: React.ReactNode;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthScreen, setShowAuthScreen] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            if (pathname === '/kiosk-auth') {
                setIsCheckingAuth(false);
                setIsAuthenticated(true);
                return;
            }

            console.log('CheckIn App - Vérification authentification...');
            const isAuth = await KioskAuthService.isKioskAuthenticated();

            if (isAuth) {
                setIsAuthenticated(true);
                setShowAuthScreen(false);
                setIsCheckingAuth(false);
                
                // REDIRECTION AUTOMATIQUE VERS CHECK-IN après authentification
                if (pathname === '/') {
                    setTimeout(() => {
                        router.push(ROUTES.CHECK_IN_METHOD);
                    }, 500);
                }
            } else {
                setIsAuthenticated(false);
                setShowAuthScreen(true);
                setIsCheckingAuth(false);
            }
        } catch (error) {
            console.error('Erreur authentification:', error);
            setIsAuthenticated(false);
            setShowAuthScreen(true);
            setIsCheckingAuth(false);
        }
    };

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        setShowAuthScreen(false);
        // Redirection automatique vers check-in après auth réussie
        setTimeout(() => {
            router.push(ROUTES.CHECK_IN_METHOD);
        }, 500);
    };

    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F5FF' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingIndicator text="Initialisation borne Check-in..." size="large" />
                </View>
            </View>
        );
    }

    if (showAuthScreen && !isAuthenticated) {
        return <KioskAuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return null;
};

export default AuthWrapper;
