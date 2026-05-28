import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../components/Text';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { HairlineRule } from '../components/HairlineRule';
import { colors, spacing } from '../design';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/session';

export default function EditProfile() {
  const router = useRouter();
  const { session } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('profiles')
      .select('display_name, city, bio')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? '');
          setCity(data.city ?? '');
          setBio(data.bio ?? '');
        }
      });
  }, [session]);

  const save = async () => {
    if (!session?.user) return;
    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        city: city.trim(),
        bio: bio.trim() || null,
      })
      .eq('id', session.user.id);
    setBusy(false);
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="label">Profile</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text variant="label">Display name</Text>
        <View style={{ height: spacing.xs }} />
        <Input value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <View style={{ height: spacing.md }} />
        <Text variant="label">City</Text>
        <View style={{ height: spacing.xs }} />
        <Input value={city} onChangeText={setCity} placeholder="City" />
        <View style={{ height: spacing.md }} />
        <Text variant="label">Bio (optional)</Text>
        <View style={{ height: spacing.xs }} />
        <Input
          value={bio}
          onChangeText={setBio}
          placeholder="A few lines"
          multiline
          maxLength={500}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <View style={{ height: spacing.lg }} />
        <Button onPress={save} disabled={busy || displayName.trim().length < 2 || city.trim().length < 2}>
          {busy ? 'Saving...' : 'Save'}
        </Button>
      </ScrollView>
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
});
