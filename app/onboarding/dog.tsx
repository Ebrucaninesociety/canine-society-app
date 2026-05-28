import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding, DogSize } from '../../lib/onboarding';

const SIZES: DogSize[] = ['small', 'medium', 'large'];

export default function OnboardingDog() {
  const router = useRouter();
  const { dog, set } = useOnboarding();
  const valid = dog.name.trim().length > 0 && dog.size !== null;

  const update = <K extends keyof typeof dog>(key: K, value: (typeof dog)[K]) => {
    set({ dog: { ...dog, [key]: value } });
  };

  return (
    <View style={styles.root}>
      <Text variant="label">VI</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Your dog</Text>
      <View style={{ height: spacing.md }} />
      <Input value={dog.name} onChangeText={(v) => update('name', v)} placeholder="Name" />
      <View style={{ height: spacing.sm }} />
      <Input value={dog.breed} onChangeText={(v) => update('breed', v)} placeholder="Breed (optional)" />
      <View style={{ height: spacing.md }} />
      <Text variant="label">Size</Text>
      <View style={styles.row}>
        {SIZES.map((s) => (
          <Chip key={s} label={s} active={dog.size === s} onPress={() => update('size', s)} />
        ))}
      </View>
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/bio')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
});
