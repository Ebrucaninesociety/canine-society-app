import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding, Gender, LookingFor } from '../../lib/onboarding';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LOOKING: { value: LookingFor; label: string }[] = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'everyone', label: 'Everyone' },
];

export default function OnboardingGender() {
  const router = useRouter();
  const { gender, lookingFor, set } = useOnboarding();

  const toggleLooking = (v: LookingFor) => {
    if (lookingFor.includes(v)) {
      set({ lookingFor: lookingFor.filter((x) => x !== v) });
    } else {
      set({ lookingFor: [...lookingFor, v] });
    }
  };

  const valid = !!gender && lookingFor.length > 0;

  return (
    <View style={styles.root}>
      <Text variant="label">III</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">About you</Text>
      <View style={{ height: spacing.md }} />
      <Text variant="label">I am</Text>
      <View style={styles.row}>
        {GENDERS.map((g) => (
          <Chip key={g.value} label={g.label} active={gender === g.value} onPress={() => set({ gender: g.value })} />
        ))}
      </View>
      <View style={{ height: spacing.md }} />
      <Text variant="label">Looking for</Text>
      <View style={styles.row}>
        {LOOKING.map((l) => (
          <Chip
            key={l.value}
            label={l.label}
            active={lookingFor.includes(l.value)}
            onPress={() => toggleLooking(l.value)}
          />
        ))}
      </View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/city')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
});
