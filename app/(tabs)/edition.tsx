import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

export default function Edition() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">IV · Edition</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline">The magazine</Text>
        <View style={{ height: spacing.md }} />
        <Text>Stories will be added here, drawn from canine-society.com.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
