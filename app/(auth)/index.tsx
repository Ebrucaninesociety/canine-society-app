import { View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signInWithApple } from '../../lib/auth';

export default function AuthChoice() {
  const router = useRouter();

  const onApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      if (credential.identityToken) {
        await signInWithApple(credential.identityToken);
      }
    } catch (error) {
      const e = error as { code?: string; message?: string };
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign-in failed', e.message ?? 'Unknown error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Text variant="label">Roma · DACH</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display">CANINE</Text>
        <Text variant="display">SOCIETY</Text>
      </View>
      <View style={styles.bottom}>
        {Platform.OS === 'ios' && (
          <>
            <Button onPress={onApple}>Continue with Apple</Button>
            <View style={{ height: spacing.sm }} />
          </>
        )}
        <Button variant="ghost" onPress={() => router.push('/(auth)/email')}>
          Continue with Email
        </Button>
        <View style={{ height: spacing.md }} />
        <Text variant="label" style={{ color: colors.placeholder }}>
          By continuing, you agree to our Terms and Privacy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand, padding: spacing.md },
  top: { flex: 1, justifyContent: 'center' },
  bottom: { paddingBottom: spacing.md },
});
