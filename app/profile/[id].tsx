import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from '../../components/Image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchProfileDetail,
  ProfileDetail,
  recordSwipe,
  findMatchWith,
} from '../../lib/deck';
import { signedPhotoUrl } from '../../lib/photos';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

type Status =
  | { kind: 'loading' }
  | { kind: 'undecided' }
  | { kind: 'matched'; matchId: string }
  | { kind: 'already'; direction: string };

export default function ProfileDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();
  const [data, setData] = useState<ProfileDetail | null>(null);
  const [uris, setUris] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || !session?.user) return;
      const me = session.user.id;
      const detail = await fetchProfileDetail(id);
      if (!detail) return;
      const photoUris = await Promise.all(detail.photos.map((p) => signedPhotoUrl(p.storage_path)));
      setData(detail);
      setUris(photoUris);

      // Resolve relational state with this profile.
      const matchId = await findMatchWith(id);
      if (matchId) {
        setStatus({ kind: 'matched', matchId });
        return;
      }
      const { data: swipe } = await supabase
        .from('swipes')
        .select('direction')
        .eq('swiper_id', me)
        .eq('swipee_id', id)
        .eq('intent', 'date')
        .maybeSingle();
      if (swipe) {
        setStatus({ kind: 'already', direction: swipe.direction });
      } else {
        setStatus({ kind: 'undecided' });
      }
    })();
  }, [id, session]);

  const decide = async (direction: 'like' | 'pass' | 'superlike') => {
    if (!id || busy) return;
    setBusy(true);
    try {
      await recordSwipe(id, direction);
      // The match listener at the tabs root handles auto-opening the
      // "Una Coincidenza" modal if a match is created by this swipe.
      router.back();
    } catch (e) {
      const err = e as { message?: string };
      Alert.alert('Could not record', err.message ?? 'Try again');
      setBusy(false);
    }
  };

  if (!data) {
    return <SafeAreaView style={styles.root} />;
  }

  const { profile, dogs } = data;
  const age = ageOf(profile.birthdate);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text variant="label">← Back</Text>
      </Pressable>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {uris.map((u, i) => (
          <Image key={i} source={{ uri: u }} style={styles.img} />
        ))}
        <View style={styles.body}>
          <Text variant="label">Profile</Text>
          <View style={{ height: spacing.xs }} />
          <Text variant="display">{profile.display_name}</Text>
          <Text variant="label">
            {age} · {profile.city}, {profile.country}
          </Text>
          <View style={{ height: spacing.md }} />
          <HairlineRule />
          <View style={{ height: spacing.md }} />
          {profile.bio ? (
            <>
              <Text>{profile.bio}</Text>
              <View style={{ height: spacing.md }} />
              <HairlineRule />
              <View style={{ height: spacing.md }} />
            </>
          ) : null}
          <Text variant="label">Dog</Text>
          {dogs.map((d) => (
            <View key={d.id} style={{ marginTop: spacing.sm }}>
              <Text variant="headline">
                {d.name}
                {d.breed ? `, ${d.breed}` : ''}
              </Text>
              <Text variant="label">{d.size}</Text>
              {d.bio && (
                <>
                  <View style={{ height: spacing.xs }} />
                  <Text>{d.bio}</Text>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {status.kind === 'matched' && (
          <Button onPress={() => router.replace(`/chat/${status.matchId}`)}>
            Open chat
          </Button>
        )}
        {status.kind === 'already' && (
          <Text variant="label" style={{ textAlign: 'center', color: colors.placeholder }}>
            You already {status.direction === 'pass' ? 'passed' : 'liked'} this profile.
          </Text>
        )}
        {status.kind === 'undecided' && (
          <View style={styles.actions}>
            <Pressable
              onPress={() => decide('pass')}
              disabled={busy}
              style={[styles.actionBtn, { borderColor: colors.mud }]}
            >
              <Text variant="label" style={{ color: colors.mud }}>
                Pass
              </Text>
            </Pressable>
            <Pressable
              onPress={() => decide('superlike')}
              disabled={busy}
              style={[styles.actionBtn, { borderColor: colors.deepOcean }]}
            >
              <Text variant="label">★ Note</Text>
            </Pressable>
            <Pressable
              onPress={() => decide('like')}
              disabled={busy}
              style={[styles.actionBtn, styles.actionPrimary]}
            >
              <Text variant="label" style={{ color: colors.sand }}>
                Like
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  backBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  img: { width: '100%', aspectRatio: 1 },
  body: { padding: spacing.md },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.sand,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionPrimary: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
});
