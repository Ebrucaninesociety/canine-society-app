import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { listBlocked, unblockUser, BlockedRow } from '../../lib/block';

export default function BlockedScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<BlockedRow[]>([]);

  const load = useCallback(async () => {
    setRows(await listBlocked());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUnblock = (row: BlockedRow) => {
    Alert.alert(
      `Unblock ${row.blocked?.display_name ?? 'this member'}?`,
      'They will be visible to you again in Discover, and you to them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            try {
              await unblockUser(row.blocked_id);
              load();
            } catch (e) {
              const err = e as { message?: string };
              Alert.alert('Could not unblock', err.message ?? 'Try again');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="label">Blocked</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.blocked_id}
        ItemSeparatorComponent={() => <HairlineRule />}
        ListEmptyComponent={
          <View style={{ padding: spacing.md, marginTop: spacing.lg }}>
            <Text>No blocked members.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.blocked?.display_name ?? 'Unknown'}</Text>
            <Pressable onPress={() => onUnblock(item)}>
              <Text variant="label" style={{ color: colors.mud }}>
                Unblock
              </Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
});
