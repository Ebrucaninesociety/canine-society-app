import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors, spacing } from '../design';
import { signOut } from '../lib/auth';

export default function UnderReview() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">Roma · Society</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display">Under review</Text>
        <View style={{ height: spacing.md }} />
        <Text>
          Welcome to the Society. We are looking over your profile. We will write the moment you are in.
        </Text>
        <View style={{ height: spacing.lg }} />
        <Button variant="ghost" onPress={signOut}>
          Sign out
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // The 'One Water Rule' moment per the brand book — pale blue used at
  // most once per long session for the chapter-turn feeling.
  root: { flex: 1, backgroundColor: colors.water },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
