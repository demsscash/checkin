// constants/routes.ts - Version mise à jour
// Définition des types pour les chemins de routeur
export type AppRoutes = {
    HOME: '/',
    KIOSK_AUTH: '/kiosk-auth',
    CHECK_IN_METHOD: '/check-in-method',
    CODE_ENTRY: '/code-entry',
    PERSONAL_SEARCH: '/personal-search',
    CHECKIN_CARTE_VITALE: '/checkin-carte-vitale',
    CHECKIN_CARTE_VITALE_VALIDATED: '/checkin-carte-vitale-validated',
    VERIFICATION: '/verification',
    APPOINTMENT_CONFIRMED: '/appointment-confirmed',
    PAYMENT: '/payment',
    CARTE_VITALE: '/carte-vitale',
    CARTE_VITALE_VALIDATED: '/carte-vitale-validated',
    MUTUELLE_SCAN: '/mutuelle-scan',
    MUTUELLE_VALIDATED: '/mutuelle-validated',
    PAYMENT_CONFIRMATION: '/payment-confirmation',
    TPE: '/tpe',
    PAYMENT_SUCCESS: '/payment-success',
};

// Les chemins comme valeurs littérales pour satisfaire le typage d'Expo Router
export const ROUTES: AppRoutes = {
    HOME: '/',
    KIOSK_AUTH: '/kiosk-auth',
    CHECK_IN_METHOD: '/check-in-method',
    CODE_ENTRY: '/code-entry',
    PERSONAL_SEARCH: '/personal-search',
    CHECKIN_CARTE_VITALE: '/checkin-carte-vitale',
    CHECKIN_CARTE_VITALE_VALIDATED: '/checkin-carte-vitale-validated',
    VERIFICATION: '/verification',
    APPOINTMENT_CONFIRMED: '/appointment-confirmed',
    PAYMENT: '/payment',
    CARTE_VITALE: '/carte-vitale',
    CARTE_VITALE_VALIDATED: '/carte-vitale-validated',
    MUTUELLE_SCAN: '/mutuelle-scan',
    MUTUELLE_VALIDATED: '/mutuelle-validated',
    PAYMENT_CONFIRMATION: '/payment-confirmation',
    TPE: '/tpe',
    PAYMENT_SUCCESS: '/payment-success',
};