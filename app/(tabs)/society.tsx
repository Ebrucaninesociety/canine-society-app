import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';
import { signOut } from '../../lib/auth';

export default function Society() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">III · You</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline">Society</Text>
        <View style={{ height: spacing.md }} />
        <Text>Your profile, your dog, your settings.</Text>
        <View style={{ height: spacing.lg }} />
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
