import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Image, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signedPhotoUrl } from '../../lib/photos';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

type Row = {
  matchId: string;
  otherId: string;
  otherName: string;
  lastBody: string | null;
  lastAt: string | null;
  uri: string | null;
};

export default function Matches() {
  const { session } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    const me = session.user.id;
    const { data: matches } = await supabase
      .from('matches')
      .select('id, profile_a_id, profile_b_id, created_at')
      .or(`profile_a_id.eq.${me},profile_b_id.eq.${me}`)
      .is('unmatched_at', null)
      .order('created_at', { ascending: false });

    const out: Row[] = [];
    for (const m of matches ?? []) {
      const otherId = m.profile_a_id === me ? m.profile_b_id : m.profile_a_id;
      const [{ data: profile }, { data: photo }, { data: lastMsg }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', otherId).maybeSingle(),
        supabase
          .from('photos')
          .select('storage_path')
          .eq('profile_id', otherId)
          .eq('is_primary', true)
          .maybeSingle(),
        supabase
          .from('messages')
          .select('body, created_at')
          .eq('match_id', m.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      out.push({
        matchId: m.id,
        otherId,
        otherName: profile?.display_name ?? '',
        lastBody: lastMsg?.body ?? null,
        lastAt: lastMsg?.created_at ?? null,
        uri: photo ? await signedPhotoUrl(photo.storage_path) : null,
      });
    }
    setRows(out);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text variant="label">II · Matches</Text>
        <Text variant="label" style={{ color: colors.placeholder }}>
          {rows.length}
        </Text>
      </View>
      <HairlineRule />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.matchId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.deepOcean} />}
        ItemSeparatorComponent={() => <HairlineRule />}
        ListEmptyComponent={
          <View style={{ padding: spacing.md, marginTop: spacing.lg }}>
            <Text>No matches yet. Open Discover to find someone.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/chat/${item.matchId}`)} style={styles.row}>
            {item.uri ? (
              <Image source={{ uri: item.uri }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: colors.water }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text variant="title">{item.otherName}</Text>
              <Text style={{ color: colors.placeholder }} numberOfLines={1}>
                {item.lastBody ?? 'Say hello'}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  thumb: { width: 64, height: 64 },
});
