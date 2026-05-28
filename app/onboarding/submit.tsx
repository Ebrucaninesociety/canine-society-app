import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { ProgressRule } from '../../components/ProgressRule';
import { spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';
import { createProfileAndUploads } from '../../lib/profile';

export default function OnboardingSubmit() {
  const router = useRouter();
  const data = useOnboarding();
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (busy || !data.gender || !data.dog.size) return;
    setBusy(true);
    try {
      await createProfileAndUploads({
        displayName: data.displayName,
        birthdate: data.birthdate,
        gender: data.gender,
        lookingFor: data.lookingFor,
        city: data.city,
        country: data.country,
        bio: data.bio,
        photos: data.photos,
        dog: {
          name: data.dog.name,
          breed: data.dog.breed,
          size: data.dog.size,
          bio: data.dog.bio,
        },
      });
      data.reset();
      router.replace('/under-review');
    } catch (error) {
      const e = error as { message?: string };
      Alert.alert('Submit failed', e.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text variant="label">IX</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Submit for review</Text>
      <View style={{ height: spacing.md }} />
      <Text>We review every new profile by hand. Most are approved within a day.</Text>
      <View style={{ height: spacing.lg }} />
      {busy && (
        <View style={{ marginBottom: spacing.md }}>
          <ProgressRule progress={0.6} />
        </View>
      )}
      <Button onPress={send} disabled={busy}>
        {busy ? 'Submitting...' : 'Submit'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md, justifyContent: 'center' },
});
