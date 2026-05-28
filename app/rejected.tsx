import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors, spacing } from '../design';
import { signOut } from '../lib/auth';

export default function Rejected() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">A note</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display">Not yet</Text>
        <View style={{ height: spacing.md }} />
        <Text>
          Your profile did not meet our entrance: we need at least one clear photo of you with your dog. Edit your
          photos and resubmit.
        </Text>
        <View style={{ height: spacing.lg }} />
        <Button onPress={() => router.push('/onboarding/photos')}>Edit photos</Button>
        <View style={{ height: spacing.sm }} />
        <Button variant="ghost" onPress={signOut}>
          Sign out
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
