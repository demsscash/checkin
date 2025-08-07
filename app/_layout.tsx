// app/_layout.tsx - Version simplifiée
import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import './globals.css';
import SimpleInactivityTimer from "../components/ui/SimpleInactivityTimer";
import { ActivityWrapper } from "../components/layout/ActivityWrapper";
import AuthWrapper from "../components/layout/AuthWrapper";
import { ROUTES } from "../constants/routes";

export default function RootLayout() {
  return (
    <ActivityWrapper>
      <AuthWrapper>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false, // 👈 désactive tous les headers
            }}
          />

          {/* Timer d'inactivité - désactivé sur l'écran d'authentification */}
          <SimpleInactivityTimer
            timeoutDuration={30}
            warningThreshold={5}
            initialDelay={5}
            disabledRoutes={[ROUTES.HOME, '/kiosk-auth']}
          />
        </View>
      </AuthWrapper>
    </ActivityWrapper>
  );
}