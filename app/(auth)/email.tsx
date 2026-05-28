import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signInWithEmail, signInWithEmailOtp } from '../../lib/auth';

type Step = 'email' | 'code';

export default function EmailEntry() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithEmail(email.trim());
      setStep('code');
    } catch (error) {
      const e = error as { message?: string };
      Alert.alert('Could not send', e.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithEmailOtp(email.trim(), code.trim());
    } catch (error) {
      const e = error as { message?: string };
      Alert.alert('Wrong code', e.message ?? 'Try again, or request a new code.');
    } finally {
      setBusy(false);
    }
  };

  if (step === 'code') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <Text variant="label">II</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="headline">Enter the code</Text>
          <View style={{ height: spacing.md }} />
          <Text>We sent a one-time code to {email}. It may take a minute to arrive.</Text>
          <View style={{ height: spacing.md }} />
          <Input
            placeholder="00000000"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={8}
            autoFocus
            style={{ fontSize: 28, letterSpacing: 6, textAlign: 'center' }}
          />
          <View style={{ height: spacing.md }} />
          <Button onPress={verify} disabled={busy || code.length < 6}>
            {busy ? 'Verifying...' : 'Verify'}
          </Button>
          <View style={{ height: spacing.sm }} />
          <Button variant="ghost" onPress={() => setStep('email')}>
            Use a different email
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">I</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline">Your email</Text>
        <View style={{ height: spacing.md }} />
        <Input
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ height: spacing.md }} />
        <Button onPress={sendCode} disabled={busy || email.length < 5}>
          {busy ? 'Sending...' : 'Send Code'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
