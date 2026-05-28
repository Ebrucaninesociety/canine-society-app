import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { fetchDeck, fetchPrimaryPhotoPath, recordSwipe, DeckProfile } from '../../lib/deck';
import { signedPhotoUrl } from '../../lib/photos';
import { SwipeCard } from '../../components/SwipeCard';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

type Card = DeckProfile & { primaryUri: string };

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function Discover() {
  const router = useRouter();
  const [stack, setStack] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await fetchDeck(20);
      const out: Card[] = [];
      for (const p of profiles) {
        const path = await fetchPrimaryPhotoPath(p.id);
        if (!path) continue;
        const uri = await signedPhotoUrl(path);
        out.push({ ...p, primaryUri: uri });
      }
      setStack(out);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSwipe = async (dir: 'like' | 'pass' | 'superlike') => {
    const top = stack[0];
    if (!top) return;
    setStack((s) => s.slice(1));
    try {
      await recordSwipe(top.id, dir);
    } catch (e) {
      // If swipe fails (e.g. duplicate), still drop the card from the stack.
      console.warn('swipe failed', e);
    }
    if (stack.length <= 3) load();
  };

  if (loading && stack.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.deepOcean} />
      </SafeAreaView>
    );
  }

  if (stack.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text variant="label">I · Today</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="headline" style={{ textAlign: 'center' }}>
          No more profiles
        </Text>
        <View style={{ height: spacing.md }} />
        <Text style={{ textAlign: 'center' }}>
          Check back later. Members join every week.
        </Text>
        <View style={{ height: spacing.lg }} />
        <Pressable onPress={load}>
          <Text variant="label">Refresh</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text variant="label">I · Today</Text>
        <Text variant="label" style={{ color: colors.placeholder }}>
          {stack.length} {stack.length === 1 ? 'profile' : 'profiles'}
        </Text>
      </View>
      <HairlineRule />
      <View style={styles.deck}>
        {stack
          .slice(0, 2)
          .reverse()
          .map((c, idx, arr) => {
            const isTop = idx === arr.length - 1;
            return (
              <View
                key={c.id}
                style={[
                  styles.layer,
                  !isTop && { transform: [{ scale: 0.96 }, { translateY: 8 }] },
                ]}
                pointerEvents={isTop ? 'auto' : 'none'}
              >
                {isTop ? (
                  <SwipeCard
                    uri={c.primaryUri}
                    name={c.display_name}
                    age={ageOf(c.birthdate)}
                    city={c.city}
                    onSwipe={onSwipe}
                    onTap={() => router.push(`/profile/${c.id}`)}
                  />
                ) : (
                  <View style={styles.placeholder} />
                )}
              </View>
            );
          })}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => onSwipe('pass')}
          style={[styles.actionBtn, { borderColor: colors.mud }]}
        >
          <Text variant="label" style={{ color: colors.mud }}>
            Pass
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSwipe('superlike')}
          style={[styles.actionBtn, { borderColor: colors.deepOcean }]}
        >
          <Text variant="label">★ Note</Text>
        </Pressable>
        <Pressable
          onPress={() => onSwipe('like')}
          style={[styles.actionBtn, styles.actionPrimary]}
        >
          <Text variant="label" style={{ color: colors.sand }}>
            Like
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deck: { flex: 1, padding: spacing.md },
  layer: { ...StyleSheet.absoluteFillObject, padding: spacing.md },
  placeholder: { flex: 1, backgroundColor: colors.water },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionPrimary: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
});
