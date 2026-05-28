import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signedPhotoUrl } from '../../lib/photos';
import { useSession } from '../../lib/session';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../design';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const router = useRouter();
  const [otherUri, setOtherUri] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('');

  useEffect(() => {
    (async () => {
      if (!id || !session?.user) return;
      const { data: match } = await supabase
        .from('matches')
        .select('profile_a_id, profile_b_id')
        .eq('id', id)
        .maybeSingle();
      if (!match) return;
      const otherId =
        match.profile_a_id === session.user.id ? match.profile_b_id : match.profile_a_id;
      const [{ data: profile }, { data: photo }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', otherId).maybeSingle(),
        supabase
          .from('photos')
          .select('storage_path')
          .eq('profile_id', otherId)
          .eq('is_primary', true)
          .maybeSingle(),
      ]);
      if (profile) setOtherName(profile.display_name);
      if (photo) setOtherUri(await signedPhotoUrl(photo.storage_path));
    })();
  }, [id, session]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label">Roma</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display">Una</Text>
        <Text variant="display">Coincidenza</Text>
        <View style={{ height: spacing.lg }} />
        {otherUri && <Image source={{ uri: otherUri }} style={styles.portrait} />}
        <View style={{ height: spacing.md }} />
        <Text variant="headline" style={{ textAlign: 'center' }}>
          You and {otherName}
        </Text>
        <View style={{ height: spacing.lg }} />
        <Button onPress={() => router.replace(`/chat/${id}`)}>Send a message</Button>
        <View style={{ height: spacing.sm }} />
        <Button variant="ghost" onPress={() => router.replace('/(tabs)/discover')}>
          Keep browsing
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center', alignItems: 'stretch' },
  portrait: { width: '60%', aspectRatio: 1, alignSelf: 'center' },
});
