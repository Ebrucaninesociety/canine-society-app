import { useEffect, useState } from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchProfileDetail, ProfileDetail } from '../../lib/deck';
import { signedPhotoUrl } from '../../lib/photos';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfileDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProfileDetail | null>(null);
  const [uris, setUris] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const detail = await fetchProfileDetail(id);
      if (!detail) return;
      const photos = await Promise.all(detail.photos.map((p) => signedPhotoUrl(p.storage_path)));
      setData(detail);
      setUris(photos);
    })();
  }, [id]);

  if (!data) {
    return <SafeAreaView style={styles.root} />;
  }

  const { profile, dogs } = data;
  const age = ageOf(profile.birthdate);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView style={{ flex: 1 }}>
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
          {profile.bio ? <Text>{profile.bio}</Text> : null}
          <View style={{ height: spacing.md }} />
          <HairlineRule />
          <View style={{ height: spacing.md }} />
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
          <View style={{ height: spacing.lg }} />
          <Button onPress={() => router.back()}>Back</Button>
          <View style={{ height: spacing.lg }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  img: { width: '100%', aspectRatio: 1 },
  body: { padding: spacing.md },
});
