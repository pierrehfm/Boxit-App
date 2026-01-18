import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SessionProvider, useSession } from '../context/AuthContext';
// @ts-ignore
import Logo from '../assets/images/logo.svg';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });



  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        {/* SVG Logo is now a component thanks to the transformer */}
        <Logo width={200} height={200} />
      </View>
    );
  }

  const currentRoute = segments.join('/');
  // Define public routes that don't need auth
  const isPublicRoute =
    currentRoute === 'start' ||
    currentRoute === 'login' ||
    currentRoute === 'signup';

  if (!user && !isPublicRoute) {
    return <Redirect href="/start" />;
  }

  if (user && isPublicRoute) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="start" options={{ headerShown: false }} />
        <Stack.Screen name="new-box" options={{ headerShown: false }} />
        <Stack.Screen name="box-detail" options={{ headerShown: false }} />
        <Stack.Screen name="add-item" options={{ headerShown: false }} />
        <Stack.Screen name="update-status" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
