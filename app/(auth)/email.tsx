import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signInWithEmail } from '../../lib/auth';

export default function EmailEntry() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch (error) {
      const e = error as { message?: string };
      Alert.alert('Could not send', e.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <Text variant="label">I</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="headline">Check your inbox</Text>
          <View style={{ height: spacing.md }} />
          <Text>We sent a link to {email}. Tap it to continue.</Text>
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
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ height: spacing.md }} />
        <Button onPress={submit} disabled={busy || email.length < 5}>
          {busy ? 'Sending...' : 'Send Link'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
