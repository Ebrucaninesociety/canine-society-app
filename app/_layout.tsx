import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, BodoniModa_400Regular, BodoniModa_400Regular_Italic } from '@expo-google-fonts/bodoni-moda';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { useEffect } from 'react';
import { View } from 'react-native';
import { colors } from '../design';
import { SessionProvider, useSession } from '../lib/session';
import { useProfileStatus } from '../lib/useProfileStatus';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const status = useProfileStatus();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inUnderReview = segments[0] === 'under-review';
    const inRejected = segments[0] === 'rejected';
    const inTabs = segments[0] === '(tabs)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)');
      return;
    }
    if (status === 'loading') return;

    if (status === 'none' && !inOnboarding) {
      router.replace('/onboarding');
    } else if (status === 'pending' && !inUnderReview) {
      router.replace('/under-review');
    } else if (status === 'rejected' && !inRejected && !inOnboarding) {
      router.replace('/rejected');
    } else if (status === 'approved' && !inTabs) {
      router.replace('/(tabs)/discover');
    }
  }, [session, loading, status, segments, router]);

  return <>{children}</>;
}

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
        <SessionProvider>
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.sand },
                animation: 'fade',
              }}
            />
          </AuthGate>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
