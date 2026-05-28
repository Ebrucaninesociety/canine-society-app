import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function OnboardingBio() {
  const router = useRouter();
  const { bio, set } = useOnboarding();

  return (
    <View style={styles.root}>
      <Text variant="label">VII</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">A few lines, if you wish</Text>
      <View style={{ height: spacing.md }} />
      <Input
        value={bio}
        onChangeText={(v) => set({ bio: v })}
        placeholder="Tell us about you (optional)"
        multiline
        maxLength={500}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
      />
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.push('/onboarding/notifications')}>Continue</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
});
