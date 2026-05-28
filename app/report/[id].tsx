import { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { reportProfile, ReportReason } from '../../lib/report';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'no_dog', label: 'No dog in photos' },
  { value: 'fake_profile', label: 'Looks fake or stock' },
  { value: 'inappropriate_photo', label: 'Inappropriate photo' },
  { value: 'harassment', label: 'Harassment in messages' },
  { value: 'underage', label: 'Appears underage' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'other', label: 'Other (please describe)' },
];

export default function ReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!id || !reason) return;
    setBusy(true);
    try {
      await reportProfile(id, reason, details);
      setSent(true);
    } catch (e) {
      const err = e as { message?: string };
      Alert.alert('Could not submit', err.message ?? 'Try again');
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <Text variant="label">Roma</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="display">Thank you</Text>
          <View style={{ height: spacing.md }} />
          <Text>A moderator will review this within twenty-four hours.</Text>
          <View style={{ height: spacing.lg }} />
          <Button onPress={() => router.replace('/(tabs)/discover')}>Continue</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="label">Report</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <View style={styles.bodyScroll}>
        <Text variant="label">A reason</Text>
        <View style={{ height: spacing.sm }} />
        {REASONS.map((r) => (
          <Pressable key={r.value} onPress={() => setReason(r.value)} style={styles.reasonRow}>
            <View style={[styles.radio, reason === r.value && styles.radioActive]} />
            <Text>{r.label}</Text>
          </Pressable>
        ))}
        <View style={{ height: spacing.md }} />
        <Text variant="label">Notes (optional)</Text>
        <Input
          value={details}
          onChangeText={setDetails}
          placeholder="Anything else we should know"
          multiline
          maxLength={500}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <View style={{ height: spacing.lg }} />
        <Button onPress={submit} disabled={busy || !reason}>
          {busy ? 'Sending...' : 'Submit report'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  bodyScroll: { flex: 1, padding: spacing.md },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: spacing.sm,
  },
  radio: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.deepOcean,
  },
  radioActive: { backgroundColor: colors.deepOcean },
});
