import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Image } from '../../components/Image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

export default function OnboardingPhotos() {
  const router = useRouter();
  const { photos, set } = useOnboarding();

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets[0]) return;
    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 2048 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );
    set({ photos: [...photos, { uri: compressed.uri, isDog: false }] });
  };

  const toggleDog = (i: number) => {
    set({ photos: photos.map((p, idx) => (idx === i ? { ...p, isDog: !p.isDog } : p)) });
  };

  const remove = (i: number) => {
    set({ photos: photos.filter((_, idx) => idx !== i) });
  };

  const valid = photos.length >= 1 && photos.some((p) => p.isDog);

  return (
    <View style={styles.root}>
      <Text variant="label">V</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Your photos</Text>
      <View style={{ height: spacing.xs }} />
      <Text>At least one photo must include your dog. Up to six total.</Text>
      <View style={{ height: spacing.md }} />
      <ScrollView contentContainerStyle={styles.list}>
        {photos.map((p, i) => (
          <View key={i} style={styles.cell}>
            <Image source={{ uri: p.uri }} style={styles.img} />
            <View style={styles.cellActions}>
              <Chip
                label={p.isDog ? 'With dog ✓' : 'Mark as with dog'}
                active={p.isDog}
                onPress={() => toggleDog(i)}
              />
              <Pressable onPress={() => remove(i)}>
                <Text variant="label" style={{ color: colors.mud }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
        {photos.length < 6 && (
          <Pressable onPress={pick} style={styles.add}>
            <Text variant="label">Add photo</Text>
          </Pressable>
        )}
      </ScrollView>
      <Button disabled={!valid} onPress={() => router.push('/onboarding/dog')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  cell: {},
  img: { width: '100%', aspectRatio: 1, backgroundColor: colors.water },
  cellActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' },
  add: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.deepOcean,
    alignItems: 'center',
  },
});
