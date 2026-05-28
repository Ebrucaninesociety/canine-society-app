import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baskervville_400Regular, Baskervville_400Regular_Italic } from '@expo-google-fonts/baskervville';
import { Manrope_400Regular, Manrope_500Medium } from '@expo-google-fonts/manrope';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { colors } from '../design';
import { SessionProvider, useSession } from '../lib/session';
import { useProfileStatus } from '../lib/useProfileStatus';
import { useOnboarding } from '../lib/onboarding';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';
import { BrandIntro } from '../components/BrandIntro';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const status = useProfileStatus();
  const segments = useSegments();
  const router = useRouter();
  const resetOnboarding = useOnboarding((s) => s.reset);

  useEffect(() => {
    if (!session) resetOnboarding();
  }, [session, resetOnboarding]);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inUnderReview = segments[0] === 'under-review';
    const inRejected = segments[0] === 'rejected';

    if (!session) {
      if (!inAuth) router.replace('/(auth)');
      return;
    }
    if (status === 'loading') return;

    if (status === 'none') {
      if (!inOnboarding) router.replace('/onboarding');
    } else if (status === 'pending') {
      if (!inUnderReview) router.replace('/under-review');
    } else if (status === 'rejected') {
      if (!inRejected && !inOnboarding) router.replace('/rejected');
    } else if (status === 'approved') {
      if (inAuth || inOnboarding || inUnderReview || inRejected) {
        router.replace('/(tabs)/discover');
      }
    }
  }, [session, loading, status, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Baskervville_400Regular,
    Baskervville_400Regular_Italic,
    Manrope_400Regular,
    Manrope_500Medium,
  });
  const [introDone, setIntroDone] = useState(false);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" backgroundColor={colors.sand} />
          <SessionProvider>
            <ToastProvider>
              <AuthGate>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.sand },
                    animation: 'fade',
                  }}
                />
              </AuthGate>
              {!introDone && <BrandIntro onDone={() => setIntroDone(true)} />}
            </ToastProvider>
          </SessionProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
