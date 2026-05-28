import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { useMe } from '../../lib/me';
import { signedPhotoUrl } from '../../lib/photos';
import { signOut } from '../../lib/auth';

// Replace with the production URL of the admin web (Vercel deploy of admin/).
// Until you have one, the in-app links 404. They are only required for
// App Store / Play Store submission.
const LEGAL_BASE = 'https://canine-society.com';

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function Row({ label, onPress, destructive }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={{ color: destructive ? colors.mud : colors.deepOcean }}>{label}</Text>
      <Text variant="label" style={{ color: destructive ? colors.mud : colors.placeholder }}>
        →
      </Text>
    </Pressable>
  );
}

export default function Society() {
  const router = useRouter();
  const { profile, dog, primaryPhoto } = useMe();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!primaryPhoto) {
      setPhotoUri(null);
      return;
    }
    signedPhotoUrl(primaryPhoto).then(setPhotoUri).catch(() => setPhotoUri(null));
  }, [primaryPhoto]);

  // Re-fetch on focus so edits show up.
  useFocusEffect(
    useCallback(() => {
      // useMe re-fetches on session change; for stale-photo refresh after
      // an edit we'd ideally re-key. Acceptable for Slice 1.
    }, []),
  );

  if (!profile) {
    return <SafeAreaView style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text variant="label">III · Society</Text>
        </View>
        <View style={styles.profile}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.portrait} />
          ) : (
            <View style={[styles.portrait, { backgroundColor: colors.water }]} />
          )}
          <View style={{ height: spacing.md }} />
          <Text variant="display">{profile.display_name}</Text>
          <Text variant="label">
            {ageOf(profile.birthdate)} · {profile.city}, {profile.country}
          </Text>
          {profile.bio && (
            <>
              <View style={{ height: spacing.md }} />
              <Text>{profile.bio}</Text>
            </>
          )}
          {dog && (
            <>
              <View style={{ height: spacing.md }} />
              <HairlineRule />
              <View style={{ height: spacing.md }} />
              <Text variant="label">Dog</Text>
              <Text variant="headline">
                {dog.name}
                {dog.breed ? `, ${dog.breed}` : ''}
              </Text>
              <Text variant="label">{dog.size}</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xs }}>
            Profile
          </Text>
          <HairlineRule />
          <Row label="Edit profile" onPress={() => router.push('/edit-profile')} />
          <HairlineRule />
          <Row label="Edit photos" onPress={() => router.push('/edit-photos')} />
          <HairlineRule />
          <Row label="Edit dog" onPress={() => router.push('/edit-dog')} />
          <HairlineRule />
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xs }}>
            Safety
          </Text>
          <HairlineRule />
          <Row label="Blocked members" onPress={() => router.push('/settings/blocked')} />
          <HairlineRule />
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xs }}>
            Legal
          </Text>
          <HairlineRule />
          <Row label="Privacy policy" onPress={() => Linking.openURL(`${LEGAL_BASE}/legal/privacy`)} />
          <HairlineRule />
          <Row label="Terms of use" onPress={() => Linking.openURL(`${LEGAL_BASE}/legal/terms`)} />
          <HairlineRule />
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xs }}>
            Account
          </Text>
          <HairlineRule />
          <Row label="Sign out" onPress={() => signOut()} />
          <HairlineRule />
          <Row label="Delete account" destructive onPress={() => router.push('/settings/delete')} />
          <HairlineRule />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  profile: { padding: spacing.md, alignItems: 'flex-start' },
  portrait: { width: '60%', aspectRatio: 1, alignSelf: 'center' },
  section: { marginTop: spacing.lg },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
