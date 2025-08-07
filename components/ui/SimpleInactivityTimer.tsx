// components/ui/SimpleInactivityTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import Svg, { Circle } from 'react-native-svg';
import { useActivity } from '../layout/ActivityWrapper';

type SimpleInactivityTimerProps = {
    timeoutDuration?: number; // en secondes
    warningThreshold?: number; // en secondes
    initialDelay?: number; // en secondes avant que le timer apparaisse
    disabledRoutes?: string[]; // routes où le timer est désactivé
};

const SimpleInactivityTimer: React.FC<SimpleInactivityTimerProps> = ({
    timeoutDuration = 30,
    warningThreshold = 10,
    initialDelay = 5, // Apparaît après 5 secondes d'inactivité
    disabledRoutes = [ROUTES.HOME], // désactivé sur la page d'accueil par défaut
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeoutDuration);
    const [circleProgress, setCircleProgress] = useState(100); // pourcentage du cercle rempli

    // Stocker toutes les valeurs importantes dans des refs pour éviter les boucles
    const timeoutDurationRef = useRef(timeoutDuration);
    const isVisibleRef = useRef(isVisible);
    const pathNameRef = useRef(pathname);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const activityListenerIdRef = useRef<string | null>(null);
    const isTimerDisabledRef = useRef(disabledRoutes.includes(pathname));

    const activity = useActivity();

    // Mettre à jour les refs lorsque les props changent
    useEffect(() => {
        timeoutDurationRef.current = timeoutDuration;
    }, [timeoutDuration]);

    // Mettre à jour isVisibleRef lorsque isVisible change
    useEffect(() => {
        isVisibleRef.current = isVisible;
    }, [isVisible]);

    // Mettre à jour pathNameRef et vérifier si le timer est désactivé
    useEffect(() => {
        pathNameRef.current = pathname;
        const newIsDisabled = disabledRoutes.includes(pathname);

        // Si l'état a changé
        if (newIsDisabled !== isTimerDisabledRef.current) {
            isTimerDisabledRef.current = newIsDisabled;

            if (newIsDisabled && isVisible) {
                // Si on passe à une route désactivée et que le timer est visible, le masquer
                setIsVisible(false);

                if (countdownTimerRef.current) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                }
            } else if (!newIsDisabled && !isVisible) {
                // Si on passe à une route activée, réinitialiser le timer
                resetInactivityTimer();
            }
        }
    }, [pathname, disabledRoutes, isVisible]);

    // Fonction pour démarrer le compte à rebours
    const startCountdown = () => {
        // Ne pas démarrer le timer si nous sommes sur une route où il est désactivé
        if (isTimerDisabledRef.current) {
            return;
        }

        setIsVisible(true);
        setTimeLeft(timeoutDurationRef.current);
        setCircleProgress(100); // commencer avec le cercle plein

        // Démarrer le décompte
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }

        countdownTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTimeLeft = prev - 1;

                // Calculer le pourcentage de remplissage
                const newProgress = (newTimeLeft / timeoutDurationRef.current) * 100;
                setCircleProgress(newProgress);

                if (newTimeLeft <= 0) {
                    // Temps écoulé, rediriger vers l'accueil
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = null;
                    }

                    // Utiliser setTimeout pour éviter de modifier l'état pendant le rendu
                    setTimeout(() => {
                        router.push(ROUTES.HOME);
                        setIsVisible(false);
                    }, 0);

                    return 0;
                }
                return newTimeLeft;
            });
        }, 1000);
    };

    // Fonction pour réinitialiser le timer à 30s
    const resetTimerToMax = () => {
        setTimeLeft(timeoutDurationRef.current);
        setCircleProgress(100);

        // Arrêter le timer actuel
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }

        // Redémarrer le décompte
        countdownTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTimeLeft = prev - 1;

                // Calculer le pourcentage de remplissage
                const newProgress = (newTimeLeft / timeoutDurationRef.current) * 100;
                setCircleProgress(newProgress);

                if (newTimeLeft <= 0) {
                    // Temps écoulé, rediriger vers l'accueil
                    if (countdownTimerRef.current) {
                        clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = null;
                    }

                    // Utiliser setTimeout pour éviter de modifier l'état pendant le rendu
                    setTimeout(() => {
                        router.push(ROUTES.HOME);
                        setIsVisible(false);
                    }, 0);

                    return 0;
                }
                return newTimeLeft;
            });
        }, 1000);
    };

    // Fonction pour réinitialiser le timer d'inactivité
    const resetInactivityTimer = () => {
        // Si la route actuelle est désactivée, ne rien faire
        if (isTimerDisabledRef.current) {
            return;
        }

        // Si le timer est visible, réinitialiser à la valeur maximale
        if (isVisibleRef.current) {
            resetTimerToMax();
        } else {
            // Le timer n'est pas visible, préparer l'apparition

            // Nettoyer le timer d'inactivité précédent
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }

            // Démarrer un nouveau timer d'inactivité
            inactivityTimerRef.current = setTimeout(() => {
                startCountdown();
            }, initialDelay * 1000);
        }
    };

    // Configurer le gestionnaire d'activité une seule fois
    useEffect(() => {
        // Fonction pour gérer l'activité
        const handleActivity = () => {
            if (isVisibleRef.current) {
                // Si le timer est visible, le réinitialiser à 30s
                resetTimerToMax();
            } else {
                // Sinon, réinitialiser le délai d'inactivité
                resetInactivityTimer();
            }
        };

        // S'abonner à l'événement d'activité
        activityListenerIdRef.current = activity.addActivityListener(handleActivity);

        // Initialiser le timer au montage
        resetInactivityTimer();

        // Surveiller l'état de l'application
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                resetInactivityTimer();
            }
            appStateRef.current = nextAppState;
        });

        // Nettoyage à la destruction du composant
        return () => {
            if (activityListenerIdRef.current) {
                activity.removeActivityListener(activityListenerIdRef.current);
            }

            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }

            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }

            subscription.remove();
        };
    }, []); // Dépendances vides pour n'exécuter qu'une seule fois

    // Ne rien afficher si le timer n'est pas visible ou si nous sommes sur la page d'accueil
    if (!isVisible || isTimerDisabledRef.current) {
        return null;
    }

    // Déterminer si nous sommes en mode alerte
    const isWarning = timeLeft <= warningThreshold;

    // Utiliser explicitement la couleur rouge du thème ou une couleur rouge fixe
    const circleColor = isWarning ? '#FF3B30' : '#4169E1';

    // Calculs pour le cercle SVG
    const size = 60;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - circleProgress / 100);

    return (
        <View style={styles.container}>
            <View style={styles.timerContainer}>
                {/* Utiliser SVG pour un meilleur contrôle du remplissage du cercle */}
                <Svg width={size} height={size}>
                    {/* Cercle de fond */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(0, 0, 0, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Cercle de progression qui se vide */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={circleColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        // Rotation pour commencer en haut
                        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    />
                </Svg>

                {/* Cercle central avec le temps restant */}
                <View style={styles.centerCircle}>
                    <Text style={[styles.timerText, { color: circleColor }]}>
                        {timeLeft}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 9999,
    },
    timerContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerCircle: {
        position: 'absolute',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
    },
    timerText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default SimpleInactivityTimer;