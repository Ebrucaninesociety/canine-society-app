import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

export default function Discover() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">I · Today</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline">Discover</Text>
        <View style={{ height: spacing.md }} />
        <Text>Profiles will appear here once approved members are nearby.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
