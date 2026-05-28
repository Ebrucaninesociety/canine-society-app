import { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { deleteAccount } from '../../lib/account';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const confirm = () => {
    Alert.alert(
      'Delete your account?',
      'This removes your profile, dog, photos, and matches. Messages to others will be anonymised but stay readable for them. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount();
            } catch (e) {
              const err = e as { message?: string };
              Alert.alert('Could not delete', err.message ?? 'Try again');
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="label">Account</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <View style={styles.body}>
        <Text variant="label">A final note</Text>
        <View style={{ height: spacing.sm }} />
        <Text variant="display">Delete account</Text>
        <View style={{ height: spacing.md }} />
        <Text>
          If you delete your account, your profile is removed, your photos are erased from our storage, and your
          active matches are closed. Conversations you sent stay readable to the other side, with your name
          replaced by 'Former member'. You can sign up again at any time, but past conversations will not return.
        </Text>
        <View style={{ height: spacing.lg }} />
        <Button onPress={confirm} disabled={busy}>
          {busy ? 'Deleting...' : 'Delete my account'}
        </Button>
      </View>
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
  body: { flex: 1, padding: spacing.md },
});
