// utils/index.ts
import { MOCK_PATIENT_DATA, MOCK_PAYMENT_DATA } from '../constants/mockData';
import { PatientInfo, PaymentInfo } from '../types';

/**
 * Simule une vérification d'API pour un code de rendez-vous
 */
export const verifyAppointmentCode = async (code: string): Promise<PatientInfo | null> => {
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Retourne les données simulées si le code est valide
  if (MOCK_PATIENT_DATA[code]) {
    return MOCK_PATIENT_DATA[code];
  }

  return null;
};

/**
 * Simule une vérification d'API pour un code de paiement
 */
export const verifyPaymentCode = async (code: string): Promise<PaymentInfo | null> => {
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Retourne les données simulées si le code est valide
  if (MOCK_PAYMENT_DATA[code]) {
    return MOCK_PAYMENT_DATA[code];
  }

  return null;
};

/**
 * Simule un processus de paiement
 */
export const processPayment = async (): Promise<boolean> => {
  // Simule un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Toujours réussit dans cette simulation
  return true;
};

/**
 * Simule la lecture de la carte Vitale
 */
export const readHealthCard = async (): Promise<boolean> => {
  // Simule un délai de lecture
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Toujours réussit dans cette simulation
  return true;
};

/**
 * Simule l'impression d'un reçu
 */
export const printReceipt = async (): Promise<boolean> => {
  // Simule un délai d'impression
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Toujours réussit dans cette simulation
  return true;
};