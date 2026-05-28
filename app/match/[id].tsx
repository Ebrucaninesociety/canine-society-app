import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { signedPhotoUrl } from '../../lib/photos';
import { useSession } from '../../lib/session';
import { Image } from '../../components/Image';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const router = useRouter();
  const [otherUri, setOtherUri] = useState<string | null>(null);
  const [mineUri, setMineUri] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('');

  useEffect(() => {
    (async () => {
      if (!id || !session?.user) return;
      const me = session.user.id;
      const { data: match } = await supabase
        .from('matches')
        .select('profile_a_id, profile_b_id')
        .eq('id', id)
        .maybeSingle();
      if (!match) return;
      const otherId = match.profile_a_id === me ? match.profile_b_id : match.profile_a_id;
      const [{ data: profile }, { data: theirPhoto }, { data: myPhoto }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', otherId).maybeSingle(),
        supabase
          .from('photos')
          .select('storage_path')
          .eq('profile_id', otherId)
          .eq('is_primary', true)
          .maybeSingle(),
        supabase
          .from('photos')
          .select('storage_path')
          .eq('profile_id', me)
          .eq('is_primary', true)
          .maybeSingle(),
      ]);
      if (profile) setOtherName(profile.display_name);
      if (theirPhoto) setOtherUri(await signedPhotoUrl(theirPhoto.storage_path));
      if (myPhoto) setMineUri(await signedPhotoUrl(myPhoto.storage_path));
    })();
  }, [id, session]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Text variant="label" style={{ textAlign: 'center' }}>
          Roma
        </Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display" style={{ textAlign: 'center' }}>
          Una
        </Text>
        <Text variant="display" style={{ textAlign: 'center' }}>
          Coincidenza
        </Text>
        <View style={{ height: spacing.lg }} />
        <View style={styles.portraits}>
          <Image source={{ uri: mineUri ?? undefined }} style={styles.portrait} />
          <Image source={{ uri: otherUri ?? undefined }} style={[styles.portrait, styles.portraitOffset]} />
        </View>
        <View style={{ height: spacing.lg }} />
        <Text variant="headline" style={{ textAlign: 'center' }}>
          You and {otherName}
        </Text>
        <View style={{ height: spacing.md }} />
        <HairlineRule />
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

const PORTRAIT = 160;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  portraits: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: PORTRAIT * 2 - 28,
    height: PORTRAIT,
  },
  portrait: { width: PORTRAIT, height: PORTRAIT },
  portraitOffset: { marginLeft: -28, marginTop: 0 },
});
