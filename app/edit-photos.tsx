import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Image } from '../components/Image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { HairlineRule } from '../components/HairlineRule';
import { colors, spacing } from '../design';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/session';
import { signedPhotoUrl } from '../lib/photos';

type Row = {
  id: string;
  storage_path: string;
  is_primary: boolean;
  is_dog_photo: boolean;
  position: number;
  uri: string;
};

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default function EditPhotos() {
  const router = useRouter();
  const { session } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('photos')
      .select('id, storage_path, is_primary, is_dog_photo, position')
      .eq('profile_id', session.user.id)
      .order('position');
    const out: Row[] = [];
    for (const p of data ?? []) {
      out.push({ ...p, uri: await signedPhotoUrl(p.storage_path) });
    }
    setRows(out);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const addPhoto = async () => {
    if (!session?.user || rows.length >= 6 || busy) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 2048 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(base64);
      const path = `${session.user.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from('profile-photos')
        .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
      if (upErr) throw upErr;
      const nextPosition = rows.length;
      const { error: rowErr } = await supabase.from('photos').insert({
        profile_id: session.user.id,
        storage_path: path,
        is_primary: rows.length === 0,
        is_dog_photo: false,
        position: nextPosition,
      });
      if (rowErr) throw rowErr;
      await load();
    } catch (e) {
      const err = e as { message?: string };
      Alert.alert('Could not add photo', err.message ?? 'Try again');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (row: Row) => {
    Alert.alert('Remove photo?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await supabase.storage.from('profile-photos').remove([row.storage_path]);
            await supabase.from('photos').delete().eq('id', row.id);
            // If we removed the primary, promote position 1 (if any) to primary.
            if (row.is_primary) {
              const next = rows.find((r) => r.id !== row.id);
              if (next) {
                await supabase.from('photos').update({ is_primary: true }).eq('id', next.id);
              }
            }
            await load();
          } catch (e) {
            const err = e as { message?: string };
            Alert.alert('Could not remove', err.message ?? 'Try again');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const toggleDog = async (row: Row) => {
    await supabase.from('photos').update({ is_dog_photo: !row.is_dog_photo }).eq('id', row.id);
    await load();
  };

  const setPrimary = async (row: Row) => {
    if (row.is_primary) return;
    await supabase
      .from('photos')
      .update({ is_primary: false })
      .eq('profile_id', session?.user?.id);
    await supabase.from('photos').update({ is_primary: true }).eq('id', row.id);
    await load();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="label">Photos</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        {rows.map((row) => (
          <View key={row.id} style={styles.cell}>
            <Image source={{ uri: row.uri }} style={styles.img} />
            <View style={styles.actions}>
              <Chip
                label={row.is_primary ? 'Primary ✓' : 'Set primary'}
                active={row.is_primary}
                onPress={() => setPrimary(row)}
              />
              <Chip
                label={row.is_dog_photo ? 'With dog ✓' : 'Mark with dog'}
                active={row.is_dog_photo}
                onPress={() => toggleDog(row)}
              />
              <Pressable onPress={() => removePhoto(row)}>
                <Text variant="label" style={{ color: colors.mud }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
        {rows.length < 6 && (
          <Button onPress={addPhoto} disabled={busy}>
            {busy ? 'Working...' : 'Add photo'}
          </Button>
        )}
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
  cell: {},
  img: { width: '100%', aspectRatio: 1, backgroundColor: colors.water },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' },
});
