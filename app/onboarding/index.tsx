import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { spacing } from '../../design';

export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Text variant="label">I</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Welcome to the Society</Text>
      <View style={{ height: spacing.md }} />
      <Text>
        You must be eighteen or older to continue. Profiles are reviewed by hand; only members with their dog
        are accepted.
      </Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={() => router.push('/onboarding/name')}>I am eighteen or older</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
