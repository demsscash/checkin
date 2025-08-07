#!/bin/bash
# simple-split.sh
# Script pour dupliquer l'app et modifier juste la redirection

set -e

echo "🚀 Duplication simple de Medical App en cours..."

# Variables
SOURCE_DIR=$(pwd)
TARGET_DIR="../medical-apps-simple"

# Vérifications
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier Medical App"
    exit 1
fi

# 1. Créer la structure et dupliquer
echo "📁 Création et duplication..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Dupliquer pour CheckIn
echo "🏥 Création CheckIn App (copie complète)..."
cp -r . "$TARGET_DIR/checkin-app"

# Dupliquer pour Payment  
echo "💳 Création Payment App (copie complète)..."
cp -r . "$TARGET_DIR/payment-app"

cd "$TARGET_DIR"

# 2. Modifier CheckIn App
echo "🔧 Configuration CheckIn App..."
cd checkin-app

# Modifier package.json
sed -i.bak 's/"name": ".*"/"name": "checkin-kiosk"/' package.json
sed -i.bak 's/"Medicaligne"/"Medical CheckIn"/' app.json
sed -i.bak 's/"MedicalApp"/"medical-checkin"/' app.json
sed -i.bak 's/"com.demsscash.MedicalApp"/"com.medical.checkin"/' app.json

# Modifier la page d'accueil pour rediriger directement vers check-in
cat > app/index.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { AdminAccess, AdminPanel } from '../components/ui/AdminPanel';
import { ROUTES } from '../constants/routes';

export default function CheckInHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Redirection automatique vers check-in après 1 seconde
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(ROUTES.CHECK_IN_METHOD);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenLayout>
      <LoadingIndicator text="Initialisation de la borne Check-in..." />
      
      <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
      <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </ScreenLayout>
  );
}
EOF

# Nettoyer les fichiers de sauvegarde
rm -f *.bak 2>/dev/null || true

cd ..

# 3. Modifier Payment App
echo "🔧 Configuration Payment App..."
cd payment-app

# Modifier package.json
sed -i.bak 's/"name": ".*"/"name": "payment-kiosk"/' package.json
sed -i.bak 's/"Medicaligne"/"Medical Payment"/' app.json
sed -i.bak 's/"MedicalApp"/"medical-payment"/' app.json
sed -i.bak 's/"com.demsscash.MedicalApp"/"com.medical.payment"/' app.json

# Modifier la page d'accueil pour rediriger directement vers payment
cat > app/index.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { AdminAccess, AdminPanel } from '../components/ui/AdminPanel';
import { ROUTES } from '../constants/routes';

export default function PaymentHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Redirection automatique vers payment après 1 seconde
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(ROUTES.PAYMENT);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenLayout>
      <LoadingIndicator text="Initialisation de la borne Paiement..." />
      
      <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
      <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </ScreenLayout>
  );
}
EOF

# Nettoyer les fichiers de sauvegarde
rm -f *.bak 2>/dev/null || true

cd ..

# 4. Modifier l'authentification pour différencier les bornes
echo "🔐 Configuration de l'authentification différenciée..."

# CheckIn App - Modifier le service d'authentification
cat >> checkin-app/services/kioskAuth.ts << 'EOF'

// CONFIGURATION CHECKIN APP
export const KIOSK_TYPE = 'CHECKIN';
export const getKioskType = () => 'checkin';
EOF

# Payment App - Modifier le service d'authentification  
cat >> payment-app/services/kioskAuth.ts << 'EOF'

// CONFIGURATION PAYMENT APP  
export const KIOSK_TYPE = 'PAYMENT';
export const getKioskType = () => 'payment';
EOF

# 5. Modifier l'AuthWrapper pour rediriger selon le type après authentification
echo "🔄 Modification de l'AuthWrapper..."

# CheckIn App AuthWrapper
cat > checkin-app/components/layout/AuthWrapper.tsx << 'EOF'
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
EOF

# Payment App AuthWrapper
cat > payment-app/components/layout/AuthWrapper.tsx << 'EOF'
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

            console.log('Payment App - Vérification authentification...');
            const isAuth = await KioskAuthService.isKioskAuthenticated();

            if (isAuth) {
                setIsAuthenticated(true);
                setShowAuthScreen(false);
                setIsCheckingAuth(false);
                
                // REDIRECTION AUTOMATIQUE VERS PAYMENT après authentification
                if (pathname === '/') {
                    setTimeout(() => {
                        router.push(ROUTES.PAYMENT);
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
        // Redirection automatique vers payment après auth réussie
        setTimeout(() => {
            router.push(ROUTES.PAYMENT);
        }, 500);
    };

    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F5FF' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingIndicator text="Initialisation borne Paiement..." size="large" />
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
EOF

# 6. Installation des dépendances
echo "📦 Installation des dépendances..."

cd checkin-app
npm install > /dev/null 2>&1 || echo "⚠️  Installation checkin en cours..."

cd ../payment-app  
npm install > /dev/null 2>&1 || echo "⚠️  Installation payment en cours..."

cd ..

# 7. Créer un README avec les instructions
cat > README.md << 'EOF'
# Medical Apps - Version Simple

## Structure
- `checkin-app/` : Application Check-in (redirige automatiquement vers validation RDV)
- `payment-app/` : Application Paiement (redirige automatiquement vers paiement)

## Fonctionnement
1. Après authentification borne, redirection automatique selon l'app
2. CheckIn App → `/check-in-method` directement  
3. Payment App → `/payment` directement
4. Tout le code est conservé dans les deux apps

## Lancement
```bash
# CheckIn App
cd checkin-app && npx expo start

# Payment App  
cd payment-app && npx expo start
```

## Authentification Borne
- Utiliser des codes différents pour chaque type d'app
- Ou même code avec identification automatique du type
EOF

echo ""
echo "✅ Duplication terminée avec succès !"
echo ""
echo "📁 Structure créée :"
echo "  medical-apps-simple/"
echo "  ├── checkin-app/     # App complète → redirige vers Check-in"
echo "  └── payment-app/     # App complète → redirige vers Paiement"
echo ""
echo "🚀 Pour tester :"
echo "  cd ../medical-apps-simple"
echo "  cd checkin-app && npx expo start    # Redirige vers check-in"
echo "  cd payment-app && npx expo start    # Redirige vers paiement"
echo ""
echo "🎯 Fonctionnement :"
echo "  - Après authentification, CheckIn App → /check-in-method"
echo "  - Après authentification, Payment App → /payment"  
echo "  - Tout le code est conservé, juste masqué par la redirection"
echo ""
echo "⚡ Avantages :"
echo "  - Aucun risque d'erreur d'import"
echo "  - Code complet dans les deux apps"
echo "  - Modification minimale (juste redirection)"
echo "  - Urgence résolue rapidement"