import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../components/Text';
import { Input } from '../components/Input';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { HairlineRule } from '../components/HairlineRule';
import { colors, spacing } from '../design';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/session';

type DogSize = 'small' | 'medium' | 'large';
const SIZES: DogSize[] = ['small', 'medium', 'large'];

export default function EditDog() {
  const router = useRouter();
  const { session } = useSession();
  const [dogId, setDogId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<DogSize | null>(null);
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('dogs')
      .select('id, name, breed, size, bio')
      .eq('owner_id', session.user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDogId(data.id);
          setName(data.name ?? '');
          setBreed(data.breed ?? '');
          setSize((data.size as DogSize) ?? null);
          setBio(data.bio ?? '');
        }
      });
  }, [session]);

  const save = async () => {
    if (!session?.user || !dogId || !size) return;
    setBusy(true);
    const { error } = await supabase
      .from('dogs')
      .update({
        name: name.trim(),
        breed: breed.trim() || null,
        size,
        bio: bio.trim() || null,
      })
      .eq('id', dogId);
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
        <Text variant="label">Dog</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text variant="label">Name</Text>
        <View style={{ height: spacing.xs }} />
        <Input value={name} onChangeText={setName} placeholder="Your dog's name" />
        <View style={{ height: spacing.md }} />
        <Text variant="label">Breed (optional)</Text>
        <View style={{ height: spacing.xs }} />
        <Input value={breed} onChangeText={setBreed} placeholder="Breed" />
        <View style={{ height: spacing.md }} />
        <Text variant="label">Size</Text>
        <View style={styles.row}>
          {SIZES.map((s) => (
            <Chip key={s} label={s} active={size === s} onPress={() => setSize(s)} />
          ))}
        </View>
        <View style={{ height: spacing.md }} />
        <Text variant="label">A line or two (optional)</Text>
        <View style={{ height: spacing.xs }} />
        <Input
          value={bio}
          onChangeText={setBio}
          placeholder="A note about your dog"
          multiline
          maxLength={300}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <View style={{ height: spacing.lg }} />
        <Button onPress={save} disabled={busy || name.trim().length < 1 || !size}>
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
  row: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
});
