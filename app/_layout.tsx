import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { useFonts, BodoniModa_400Regular, BodoniModa_400Regular_Italic } from '@expo-google-fonts/bodoni-moda';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { colors } from '../design';

export default function RootLayout() {
  const [loaded] = useFonts({
    BodoniModa_400Regular,
    BodoniModa_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.sand },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
