import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue: require('../../assets/fonts/BebasNeue-Regular.ttf'),
    FuturaPTBold: require('../../assets/fonts/FuturaCyrillicBold.ttf'),
    FuturaPTBook: require('../../assets/fonts/FuturaCyrillicBook.ttf'),
    FuturaPTDemi: require('../../assets/fonts/FuturaCyrillicDemi.ttf'),
    FuturaPTExtraBold: require('../../assets/fonts/FuturaCyrillicExtraBold.ttf'),
    FuturaPTHeavy: require('../../assets/fonts/FuturaCyrillicHeavy.ttf'),
    FuturaPTLight: require('../../assets/fonts/FuturaCyrillicLight.ttf'),
    FuturaPTMedium: require('../../assets/fonts/FuturaCyrillicMedium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
