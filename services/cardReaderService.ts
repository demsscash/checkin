// services/cardReaderService.ts
// Ce service servira de base pour l'intégration du système réel de lecture

// Types d'informations attendus de la carte Vitale
export interface VitaleCardInfo {
    nom: string;
    prenom: string;
    dateNaissance: string;
    numeroSecu: string;
    droits: {
        regime: string;
        dateExpiration: string;
    };
}

// Service simulé de lecture de carte
export const CardReaderService = {
    // Initialiser le lecteur de carte
    initReader: async (): Promise<boolean> => {
        // Simuler l'initialisation du lecteur
        console.log('Initialisation du lecteur de carte Vitale');
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    },

    // Lire les informations de la carte
    readVitaleCard: async (): Promise<VitaleCardInfo | null> => {
        console.log('Lecture de la carte Vitale en cours...');

        // Simuler le délai de lecture
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simuler des informations de carte
        // Cette partie sera remplacée par l'intégration réelle
        return {
            nom: 'DUPONT',
            prenom: 'Sophie',
            dateNaissance: '24/01/1990',
            numeroSecu: '2 90 01 75 123 456 78',
            droits: {
                regime: 'Régime général',
                dateExpiration: '31/12/2025'
            }
        };
    },

    // Comparer les informations de la carte avec les informations du patient
    validateCardInfo: (cardInfo: VitaleCardInfo, patientInfo: any): boolean => {
        // Logique de validation à implémenter
        // Par exemple, vérifier que le numéro de sécurité sociale correspond
        return cardInfo.numeroSecu === patientInfo.numeroSecu;
    },

    // Fermer la connexion avec le lecteur
    closeReader: async (): Promise<void> => {
        console.log('Fermeture de la connexion au lecteur de carte');
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

export default CardReaderService;