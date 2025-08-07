#!/usr/bin/env node
// split-medical-app.js
// Script pour diviser automatiquement votre Medical App existante

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class MedicalAppSplitter {
  constructor() {
    this.sourceDir = process.cwd();
    this.targetDir = path.join(process.cwd(), '..', 'medical-apps');
    
    // Définition des fichiers par application
    this.checkinScreens = [
      'check-in-method.tsx',
      'code-entry.tsx', 
      'personal-search.tsx',
      'checkin-carte-vitale.tsx',
      'checkin-carte-vitale-validated.tsx',
      'verification.tsx',
      'appointment-confirmed.tsx'
    ];

    this.paymentScreens = [
      'payment.tsx',
      'carte-vitale.tsx',
      'carte-vitale-validated.tsx', 
      'mutuelle-scan.tsx',
      'mutuelle-validated.tsx',
      'payment-confirmation.tsx',
      'tpe.tsx',
      'payment-success.tsx'
    ];

    this.sharedComponents = [
      'components/ui',
      'components/layout',
      'components/debug',
      'services',
      'constants',
      'hooks',
      'types',
      'utils'
    ];
  }

  async run() {
    try {
      console.log('🚀 Début de la division de Medical App\n');
      
      await this.validateSource();
      await this.createStructure();
      await this.createSharedLibrary();
      await this.createCheckinApp();
      await this.createPaymentApp();
      await this.updateImports();
      await this.createConfigurations();
      await this.installDependencies();
      
      console.log('\n✅ Division terminée avec succès !');
      this.showNextSteps();
      
    } catch (error) {
      console.error('\n❌ Erreur lors de la division:', error.message);
      process.exit(1);
    }
  }

  async validateSource() {
    console.log('🔍 Validation du projet source...');
    
    const requiredFiles = [
      'app/index.tsx',
      'components/ui',
      'services/api.ts',
      'package.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.sourceDir, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Fichier requis manquant : ${file}`);
      }
    }
    
    console.log('✓ Projet source validé');
  }

  async createStructure() {
    console.log('📁 Création de la structure...');
    
    // Nettoyer et créer le dossier target
    if (await fs.pathExists(this.targetDir)) {
      await fs.remove(this.targetDir);
    }
    
    await fs.ensureDir(this.targetDir);
    await fs.ensureDir(path.join(this.targetDir, 'shared'));
    await fs.ensureDir(path.join(this.targetDir, 'checkin-app'));
    await fs.ensureDir(path.join(this.targetDir, 'payment-app'));
    
    console.log('✓ Structure créée');
  }

  async createSharedLibrary() {
    console.log('📚 Création de la bibliothèque partagée...');
    
    const sharedDir = path.join(this.targetDir, 'shared');
    
    // Créer les dossiers de la shared library
    for (const dir of this.sharedComponents) {
      await fs.ensureDir(path.join(sharedDir, dir));
    }
    
    // Copier les fichiers partagés
    for (const component of this.sharedComponents) {
      const sourcePath = path.join(this.sourceDir, component);
      const targetPath = path.join(sharedDir, component);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
        console.log(`  ✓ ${component} → shared/`);
      }
    }

    // Copier les assets
    const assetsSource = path.join(this.sourceDir, 'assets');
    const assetsTarget = path.join(sharedDir, 'assets');
    if (await fs.pathExists(assetsSource)) {
      await fs.copy(assetsSource, assetsTarget);
      console.log('  ✓ assets → shared/');
    }

    // Créer le fichier index.ts pour la shared library
    await this.createSharedIndex();
    
    // Créer le package.json de la shared library
    await this.createSharedPackageJson();
    
    console.log('✓ Bibliothèque partagée créée');
  }

  async createCheckinApp() {
    console.log('🏥 Création de l\'application CheckIn...');
    
    const checkinDir = path.join(this.targetDir, 'checkin-app');
    
    // Initialiser le projet Expo
    process.chdir(checkinDir);
    try {
      execSync('npx create-expo-app . --template blank-typescript --yes', { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log('  ⚠️  Initialisation Expo échouée, création manuelle...');
      await this.createManualExpoProject(checkinDir);
    }
    
    // Créer le dossier app
    await fs.ensureDir(path.join(checkinDir, 'app'));
    
    // Copier les écrans CheckIn
    for (const screen of this.checkinScreens) {
      const sourcePath = path.join(this.sourceDir, 'app', screen);
      const targetPath = path.join(checkinDir, 'app', screen);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
        console.log(`  ✓ ${screen} → checkin-app/app/`);
      }
    }

    // Copier le layout et globals.css
    await this.copyLayoutFiles(checkinDir);
    
    // Créer la nouvelle page d'accueil
    await this.createCheckinHomePage(checkinDir);
    
    // Créer les fichiers de configuration
    await this.createCheckinConfig(checkinDir);
    
    console.log('✓ Application CheckIn créée');
  }

  async createPaymentApp() {
    console.log('💳 Création de l\'application Payment...');
    
    const paymentDir = path.join(this.targetDir, 'payment-app');
    
    // Initialiser le projet Expo
    process.chdir(paymentDir);
    try {
      execSync('npx create-expo-app . --template blank-typescript --yes', { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log('  ⚠️  Initialisation Expo échouée, création manuelle...');
      await this.createManualExpoProject(paymentDir);
    }
    
    // Créer le dossier app
    await fs.ensureDir(path.join(paymentDir, 'app'));
    
    // Copier les écrans Payment
    for (const screen of this.paymentScreens) {
      const sourcePath = path.join(this.sourceDir, 'app', screen);
      const targetPath = path.join(paymentDir, 'app', screen);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
        console.log(`  ✓ ${screen} → payment-app/app/`);
      }
    }

    // Copier le layout et globals.css
    await this.copyLayoutFiles(paymentDir);
    
    // Créer la nouvelle page d'accueil
    await this.createPaymentHomePage(paymentDir);
    
    // Créer les fichiers de configuration
    await this.createPaymentConfig(paymentDir);
    
    console.log('✓ Application Payment créée');
  }

  async copyLayoutFiles(appDir) {
    const layoutSource = path.join(this.sourceDir, 'app/_layout.tsx');
    const globalsSource = path.join(this.sourceDir, 'app/globals.css');
    
    if (await fs.pathExists(layoutSource)) {
      await fs.copy(layoutSource, path.join(appDir, 'app/_layout.tsx'));
    }
    
    if (await fs.pathExists(globalsSource)) {
      await fs.copy(globalsSource, path.join(appDir, 'app/globals.css'));
    }

    // Copier les configs NativeWind
    const configs = ['tailwind.config.js', 'babel.config.js', 'metro.config.js'];
    for (const config of configs) {
      const configSource = path.join(this.sourceDir, config);
      if (await fs.pathExists(configSource)) {
        await fs.copy(configSource, path.join(appDir, config));
      }
    }
  }

  async createManualExpoProject(projectDir) {
    // Créer les fichiers essentiels manuellement
    const packageJson = {
      "name": path.basename(projectDir),
      "main": "expo-router/entry",
      "version": "1.0.0",
      "scripts": {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web"
      },
      "dependencies": {
        "expo": "^52.0.46",
        "expo-router": "~4.0.20",
        "react": "18.3.1",
        "react-native": "0.76.9"
      },
      "devDependencies": {
        "@babel/core": "^7.25.2",
        "typescript": "^5.3.3"
      }
    };

    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  async createSharedIndex() {
    const indexContent = `// Point d'entrée de la bibliothèque partagée Medical Apps

// Composants UI
export * from './components/ui/Background';
export * from './components/ui/Button';
export * from './components/ui/Card';
export * from './components/ui/CodeInput';
export * from './components/ui/LoadingIndicator';
export * from './components/ui/Typography';
export * from './components/ui/Modal';
export * from './components/ui/ErrorModal';
export * from './components/ui/NetworkError';
export * from './components/ui/AdminPanel';
export * from './components/ui/SimpleInactivityTimer';

// Composants Layout
export * from './components/layout/ScreenLayout';
export * from './components/layout/ActivityWrapper';
export * from './components/layout/AuthWrapper';

// Services
export * from './services/api';
export * from './services/kioskAuth';
export * from './services/cardReaderService';

// Constants
export * from './constants/theme';
export * from './constants/apiConfig';

// Types
export * from './types';

// Hooks
export * from './hooks/useNetworkStatus';
export * from './hooks/useCodeInput';
export * from './hooks/useAppState';

// Utils
export * from './utils';
`;

    await fs.writeFile(
      path.join(this.targetDir, 'shared/index.ts'),
      indexContent
    );
  }

  async createSharedPackageJson() {
    const packageJson = {
      "name": "medical-shared",
      "version": "1.0.0",
      "main": "index.ts",
      "license": "MIT",
      "dependencies": {
        "@expo/vector-icons": "^14.0.2",
        "@react-native-community/netinfo": "^11.4.1",
        "expo": "^52.0.46",
        "expo-application": "~6.0.2",
        "expo-constants": "~17.0.8",
        "expo-device": "~7.0.3",
        "expo-network": "~7.0.5",
        "expo-secure-store": "~14.0.1",
        "react": "18.3.1",
        "react-native": "0.76.9",
        "react-native-svg": "15.8.0"
      },
      "peerDependencies": {
        "expo-router": "~4.0.20",
        "nativewind": "^4.1.23"
      }
    };

    await fs.writeFile(
      path.join(this.targetDir, 'shared/package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  async createCheckinHomePage(checkinDir) {
    const homePageContent = `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from 'medical-shared/components/layout/ScreenLayout';
import { AdminAccess, AdminPanel } from 'medical-shared/components/ui/AdminPanel';

export default function CheckInHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <ScreenLayout centered withPadding={false}>
      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push('/check-in-method')}
          className="bg-white rounded-3xl flex justify-center items-center w-80 h-80 shadow-lg"
        >
          <Image
            source={require('../assets/images/home-icon.png')}
            className="w-20 h-20 mb-8"
            resizeMode="contain"
          />
          
          <Text className="text-3xl font-bold text-[#4169E1] text-center mb-4">
            Valider mon{\"\\n\"}rendez-vous
          </Text>
          
          <Text className="text-lg text-gray-600 text-center px-4">
            Confirmez votre présence{\"\\n\"}pour votre consultation
          </Text>
        </TouchableOpacity>

        <View className="mt-8">
          <Text className="text-base text-gray-500 text-center">
            Pour toute assistance, adressez-vous au secrétariat
          </Text>
        </View>
      </View>

      <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
      <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </ScreenLayout>
  );
}`;

    await fs.writeFile(
      path.join(checkinDir, 'app/index.tsx'),
      homePageContent
    );
  }

  async createPaymentHomePage(paymentDir) {
    const homePageContent = `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from 'medical-shared/components/layout/ScreenLayout';
import { AdminAccess, AdminPanel } from 'medical-shared/components/ui/AdminPanel';

export default function PaymentHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <ScreenLayout centered withPadding={false}>
      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push('/payment')}
          className="bg-white rounded-3xl flex justify-center items-center w-80 h-80 shadow-lg"
        >
          <Image
            source={require('../assets/images/payment-icon.png')}
            className="w-20 h-20 mb-8"
            resizeMode="contain"
          />
          
          <Text className="text-3xl font-bold text-[#4169E1] text-center mb-4">
            Régler ma{\"\\n\"}facture
          </Text>
          
          <Text className="text-lg text-gray-600 text-center px-4">
            Réglez votre consultation{\"\\n\"}et récupérez vos documents
          </Text>
        </TouchableOpacity>

        <View className="mt-8">
          <Text className="text-base text-gray-500 text-center">
            Pour toute assistance, adressez-vous au secrétariat
          </Text>
        </View>
      </View>

      <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
      <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </ScreenLayout>
  );
}`;

    await fs.writeFile(
      path.join(paymentDir, 'app/index.tsx'),
      homePageContent
    );
  }

  async updateImports() {
    console.log('🔄 Mise à jour des imports...');
    
    const apps = ['checkin-app', 'payment-app'];
    
    for (const app of apps) {
      const appPath = path.join(this.targetDir, app);
      await this.updateImportsInDirectory(appPath);
    }
    
    console.log('✓ Imports mis à jour');
  }

  async updateImportsInDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory() && file.name !== 'node_modules') {
          await this.updateImportsInDirectory(filePath);
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
          await this.updateImportsInFile(filePath);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Erreur dans ${dirPath}: ${error.message}`);
    }
  }

  async updateImportsInFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      
      // Remplacer les imports relatifs par des imports de la shared library
      const replacements = [
        [/from ['"]\.\.\/(components\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
        [/from ['"]\.\.\/(services\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
        [/from ['"]\.\.\/(constants\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
        [/from ['"]\.\.\/(hooks\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
        [/from ['"]\.\.\/(types\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
        [/from ['"]\.\.\/(utils\/[^'"]+)['"]/g, "from 'medical-shared/$1'"],
      ];

      for (const [pattern, replacement] of replacements) {
        content = content.replace(pattern, replacement);
      }

      await fs.writeFile(filePath, content);
    } catch (error) {
      console.log(`  ⚠️  Erreur mise à jour ${filePath}: ${error.message}`);
    }
  }

  async createConfigurations() {
    console.log('⚙️  Création des configurations...');
    
    await this.createCheckinConfig(path.join(this.targetDir, 'checkin-app'));
    await this.createPaymentConfig(path.join(this.targetDir, 'payment-app'));
    await this.createRootPackageJson();
    
    console.log('✓ Configurations créées');
  }

  async createCheckinConfig(checkinDir) {
    // Routes
    const routesContent = `export const ROUTES = {
  HOME: '/',
  CHECK_IN_METHOD: '/check-in-method',
  CODE_ENTRY: '/code-entry',
  PERSONAL_SEARCH: '/personal-search',
  CHECKIN_CARTE_VITALE: '/checkin-carte-vitale',
  CHECKIN_CARTE_VITALE_VALIDATED: '/checkin-carte-vitale-validated',
  VERIFICATION: '/verification',
  APPOINTMENT_CONFIRMED: '/appointment-confirmed'
} as const;`;

    await fs.ensureDir(path.join(checkinDir, 'constants'));
    await fs.writeFile(
      path.join(checkinDir, 'constants/routes.ts'),
      routesContent
    );

    // Mettre à jour package.json
    const packageJsonPath = path.join(checkinDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = "checkin-kiosk";
      packageJson.dependencies = {
        ...packageJson.dependencies,
        "medical-shared": "file:../shared",
        "nativewind": "^4.1.23"
      };
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // app.json
    const appJsonContent = {
      "expo": {
        "name": "Medical CheckIn",
        "slug": "medical-checkin",
        "version": "1.0.0",
        "orientation": "landscape",
        "icon": "./assets/images/icon.png",
        "scheme": "medical-checkin",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "android": {
          "package": "com.medical.checkin",
          "versionCode": 1
        },
        "plugins": [
          "expo-router",
          "expo-font",
          "expo-secure-store"
        ],
        "experiments": {
          "typedRoutes": true
        }
      }
    };

    await fs.writeJson(path.join(checkinDir, 'app.json'), appJsonContent, { spaces: 2 });
  }

  async createPaymentConfig(paymentDir) {
    // Routes
    const routesContent = `export const ROUTES = {
  HOME: '/',
  PAYMENT: '/payment',
  CARTE_VITALE: '/carte-vitale',
  CARTE_VITALE_VALIDATED: '/carte-vitale-validated',
  MUTUELLE_SCAN: '/mutuelle-scan',
  MUTUELLE_VALIDATED: '/mutuelle-validated',
  PAYMENT_CONFIRMATION: '/payment-confirmation',
  TPE: '/tpe',
  PAYMENT_SUCCESS: '/payment-success'
} as const;`;

    await fs.ensureDir(path.join(paymentDir, 'constants'));
    await fs.writeFile(
      path.join(paymentDir, 'constants/routes.ts'),
      routesContent
    );

    // Mettre à jour package.json
    const packageJsonPath = path.join(paymentDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = "payment-kiosk";
      packageJson.dependencies = {
        ...packageJson.dependencies,
        "medical-shared": "file:../shared",
        "expo-file-system": "~18.0.12",
        "expo-sharing": "~13.0.1",
        "react-native-webview": "13.12.5",
        "nativewind": "^4.1.23"
      };
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // app.json
    const appJsonContent = {
      "expo": {
        "name": "Medical Payment",
        "slug": "medical-payment",
        "version": "1.0.0",
        "orientation": "landscape",
        "icon": "./assets/images/icon.png",
        "scheme": "medical-payment",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "android": {
          "package": "com.medical.payment",
          "versionCode": 1
        },
        "plugins": [
          "expo-router",
          "expo-font",
          "expo-secure-store"
        ],
        "experiments": {
          "typedRoutes": true
        }
      }
    };

    await fs.writeJson(path.join(paymentDir, 'app.json'), appJsonContent, { spaces: 2 });
  }

  async createRootPackageJson() {
    const rootPackageJson = {
      "name": "medical-apps",
      "version": "1.0.0",
      "private": true,
      "workspaces": [
        "shared",
        "checkin-app",
        "payment-app"
      ],
      "scripts": {
        "install:all": "npm install",
        "start:checkin": "cd checkin-app && npm start",
        "start:payment": "cd payment-app && npm start",
        "build:checkin": "cd checkin-app && eas build --platform android",
        "build:payment": "cd payment-app && eas build --platform android",
        "clean": "rm -rf */node_modules && rm -rf */.expo"
      }
    };

    await fs.writeJson(
      path.join(this.targetDir, 'package.json'),
      rootPackageJson,
      { spaces: 2 }
    );
  }

  async installDependencies() {
    console.log('📦 Installation des dépendances...');
    
    process.chdir(this.targetDir);
    
    try {
      // Installer les dépendances pour shared
      process.chdir(path.join(this.targetDir, 'shared'));
      execSync('npm install', { stdio: 'inherit' });
      
      // Installer les dépendances pour checkin-app
      process.chdir(path.join(this.targetDir, 'checkin-app'));
      execSync('npm install', { stdio: 'inherit' });
      
      // Installer les dépendances pour payment-app
      process.chdir(path.join(this.targetDir, 'payment-app'));
      execSync('npm install', { stdio: 'inherit' });
      
      console.log('✓ Dépendances installées');
    } catch (error) {
      console.log('⚠️  Installation des dépendances échouée, vous devrez les installer manuellement');
    }
  }

  showNextSteps() {
    console.log('\n📋 Prochaines étapes :');
    console.log('1. cd ../medical-apps');
    console.log('2. Tester CheckIn App : cd checkin-app && npx expo start');
    console.log('3. Tester Payment App : cd payment-app && npx expo start');
    console.log('\n🔧 Si des erreurs d\'import subsistent :');
    console.log('- Vérifiez les imports dans les fichiers .tsx');
    console.log('- Adaptez les routes dans constants/routes.ts');
    console.log('- Copiez manuellement les assets manquants');
    console.log('\n🎯 Applications créées :');
    console.log('- CheckIn : Interface de validation des rendez-vous');
    console.log('- Payment : Interface de paiement et documents');
    console.log('- Shared : Bibliothèque commune réutilisable');
  }
}

// Exécution du script
if (require.main === module) {
  const splitter = new MedicalAppSplitter();
  splitter.run().catch(console.error);
}

module.exports = MedicalAppSplitter;