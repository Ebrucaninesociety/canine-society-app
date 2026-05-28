import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { spacing } from '../../design';
import { useSession } from '../../lib/session';
import { registerForPushAsync } from '../../lib/push';

export default function OnboardingNotifications() {
  const router = useRouter();
  const { session } = useSession();

  const enable = async () => {
    if (session?.user) {
      await registerForPushAsync(session.user.id);
    }
    router.push('/onboarding/submit');
  };

  return (
    <View style={styles.root}>
      <Text variant="label">VIII</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Stay reachable</Text>
      <View style={{ height: spacing.md }} />
      <Text>
        We will write only when something matters: a match, a message, a decision on your profile. Nothing more.
      </Text>
      <View style={{ height: spacing.lg }} />
      <Button onPress={enable}>Enable Notifications</Button>
      <View style={{ height: spacing.sm }} />
      <Button variant="ghost" onPress={() => router.push('/onboarding/submit')}>
        Not now
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
