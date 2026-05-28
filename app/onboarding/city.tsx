import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding, Country } from '../../lib/onboarding';

const COUNTRIES: { value: Country; label: string }[] = [
  { value: 'DE', label: 'Germany' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
];

export default function OnboardingCity() {
  const router = useRouter();
  const { city, country, set } = useOnboarding();
  const valid = city.trim().length > 1 && (['DE', 'AT', 'CH'] as Country[]).includes(country);

  return (
    <View style={styles.root}>
      <Text variant="label">IV</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Where you are</Text>
      <View style={{ height: spacing.md }} />
      <Input value={city} onChangeText={(v) => set({ city: v })} placeholder="City" />
      <View style={{ height: spacing.md }} />
      <Text variant="label">Country</Text>
      <View style={styles.row}>
        {COUNTRIES.map((c) => (
          <Chip key={c.value} label={c.label} active={country === c.value} onPress={() => set({ country: c.value })} />
        ))}
      </View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/photos')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
});
