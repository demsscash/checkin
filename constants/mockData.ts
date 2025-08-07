// constants/mockData.ts
export const MOCK_PATIENT_DATA = {
    '123456': {
        nom: 'Dupont Sophie',
        dateNaissance: '24/01/1990',
        dateRendezVous: '20/02/2025',
        heureRendezVous: '14:30',
        numeroSecu: '2 90 01 75 123 456 78',
        verified: true,
        price: 30,
        couverture: 18,
        // Informations de salle pour les tests (plus de salleConsultation)
        salleAttente: "salle d'attente 01",
        medecin: "Dr Martin François"
    },
    // Ajout du nouveau code de test basé sur la réponse API
    '460163': {
        nom: 'Ball4 Boubou4',
        dateNaissance: '09/10/1991',
        dateRendezVous: '22/04/2025',
        heureRendezVous: '11:23',
        numeroSecu: '2 46 19 71 094 456 78',
        verified: true,
        price: 37,
        couverture: 13,
        // Informations de salle pour les tests (plus de salleConsultation)
        salleAttente: "Test",
        medecin: "Dr GUTTIEREZ Hervé"
    },
    // Nouveau code de test basé sur l'exemple fourni
    '141610': {
        nom: 'Juline BOUGAULT',
        dateNaissance: '03/08/2012',
        dateRendezVous: '14/07/2025',
        heureRendezVous: '09:40',
        numeroSecu: '2 02 43 23 304 456 78',
        verified: true,
        price: 50,
        couverture: 20,
        // Informations de salle pour les tests
        salleAttente: "OCTPSS",
        medecin: "Dr LABALLE LABALLE"
    }
};

export const MOCK_PAYMENT_DATA = {
    '123456': {
        consultation: "Consultation médicale",
        consultationPrice: "30.00 euro",
        mutuelle: "Mutuelle Couverte",
        mutuelleAmount: "-18.00 euro",
        totalTTC: "10.00 €",
        regimeObligatoire: "Regime Obligatoire",
        regimeObligatoireValue: "-6 euro",
        id: "12345" // ID direct pour le téléchargement des documents
    },
    // Ajout du nouveau code de test basé sur la réponse API
    '460163': {
        consultation: "consultation",
        consultationPrice: "37.00 euro",
        mutuelle: "Mutuelle",
        mutuelleAmount: "-13.00 euro",
        totalTTC: "24.00 €",
        regimeObligatoire: "Régime Obligatoire",
        regimeObligatoireValue: "-6.50 euro",
        id: "98765" // ID direct pour le téléchargement des documents
    },
    // Nouveau code de test
    '141610': {
        consultation: "CONSULTATION CABINET",
        consultationPrice: "50.00 euro",
        mutuelle: "Mutuelle",
        mutuelleAmount: "-20.00 euro",
        totalTTC: "30.00 €",
        regimeObligatoire: "Régime Obligatoire",
        regimeObligatoireValue: "-0.00 euro",
        id: "15480" // ID direct pour le téléchargement des documents
    }
};

export const DEFAULT_CODE_LENGTH = 6;
export const VALID_CODES = ['123456', '460163', '141610'];