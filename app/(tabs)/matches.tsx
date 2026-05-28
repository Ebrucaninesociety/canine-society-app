import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

export default function Matches() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">II</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline">Matches</Text>
        <View style={{ height: spacing.md }} />
        <Text>Your conversations will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
