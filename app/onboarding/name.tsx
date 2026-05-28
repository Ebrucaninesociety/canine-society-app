import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

export default function OnboardingName() {
  const router = useRouter();
  const { displayName, birthdate, set } = useOnboarding();
  const valid = displayName.trim().length >= 2 && isValidIsoDate(birthdate);

  return (
    <View style={styles.root}>
      <Text variant="label">II</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Your name</Text>
      <View style={{ height: spacing.md }} />
      <Input
        value={displayName}
        onChangeText={(v) => set({ displayName: v })}
        placeholder="Display name"
      />
      <View style={{ height: spacing.sm }} />
      <Input
        value={birthdate}
        onChangeText={(v) => set({ birthdate: v })}
        placeholder="Birthdate (YYYY-MM-DD)"
        keyboardType="numbers-and-punctuation"
        autoCorrect={false}
      />
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/gender')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
});
