// types/index.ts
import { TextInput } from "react-native";

export type PatientInfo = {
    id?: number; // ID du rendez-vous pour la confirmation
    nom: string;
    fullName?: string; // NOUVEAU : nom complet (nom + prénom)
    dateNaissance: string;
    dateRendezVous: string;
    heureRendezVous: string;
    numeroSecu: string;
    verified: boolean;
    // Nouvelles propriétés
    price?: number; // Prix de la consultation
    couverture?: number; // Montant de la couverture mutuelle
    status?: string; // Statut du rendez-vous
    // MISE À JOUR : Plus de salleConsultation, seulement salleAttente
    salleAttente?: string;
    medecin?: string;
};

export type PaymentInfo = {
    consultation: string;
    consultationPrice: string;
    mutuelle: string;
    mutuelleAmount: string;
    totalTTC: string;
    regimeObligatoire: string;
    regimeObligatoireValue: string;
    id?: string; // ID direct pour les documents PDF
    appointmentId?: number; // ID du rendez-vous
};

export type RoomInfo = {
    id: number;
    date: string;
    medecin: {
        nom: string;
        prenom: string | null;
    };
    etat: string;
    remarque: string;
    salle: {
        id: number;
        numero: string;
        salleAttentes: Array<{
            id: number;
            nom: string;
        }>;
    };
};

export type PressedButtonType = 'accueil' | 'paiement' | null;

export type CodeInputRef = React.RefObject<TextInput>;

// NOUVEAUX TYPES pour la recherche personnelle
export type PersonalSearchFormData = {
    nom: string;
    prenom: string;
    dateNaissance: string; // Format DD/MM/YYYY pour l'affichage
};

export type CheckInMethodType = 'code' | 'personal' | null;