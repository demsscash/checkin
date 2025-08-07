// constants/theme.ts
export const COLORS = {
    primary: '#4169E1',    // Bleu principal
    background: '#F0F5FF', // Fond d'écran
    white: '#FFFFFF',
    black: '#000000',
    text: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#4169E1',
    },
    button: {
        primary: '#4169E1',
        disabled: '#D3D3D3',
    },
    success: '#4CAF50', // Vert pour les validations
};

export const FONTS = {
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 64,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8
    }
};