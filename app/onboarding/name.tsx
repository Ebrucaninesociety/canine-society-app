import { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { useOnboarding } from '../../lib/onboarding';

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

function isAtLeast18(s: string): boolean {
  if (!isValidIsoDate(s)) return false;
  const birth = new Date(s);
  const eighteen = new Date();
  eighteen.setFullYear(eighteen.getFullYear() - 18);
  return birth <= eighteen;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatHuman(s: string): string {
  if (!isValidIsoDate(s)) return s;
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OnboardingName() {
  const router = useRouter();
  const { displayName, birthdate, set } = useOnboarding();
  const [picking, setPicking] = useState(false);
  const valid = displayName.trim().length >= 2 && isAtLeast18(birthdate);

  const onChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPicking(false);
    if (date) set({ birthdate: formatDate(date) });
  };

  const defaultDate = isValidIsoDate(birthdate)
    ? new Date(birthdate)
    : new Date(new Date().getFullYear() - 28, 0, 1);
  const max = new Date();
  const min = new Date(1920, 0, 1);

  return (
    <View style={styles.root}>
      <Text variant="label">II</Text>
      <View style={{ height: spacing.sm }} />
      <Text variant="headline">Your name</Text>
      <View style={{ height: spacing.md }} />
      <Input
        value={displayName}
        onChangeText={(v) => set({ displayName: v })}
        placeholder="Display name"
        autoCorrect={false}
      />
      <View style={{ height: spacing.md }} />
      <Text variant="label">Birthdate</Text>
      <View style={{ height: spacing.xs }} />
      <Pressable onPress={() => setPicking((p) => !p)}>
        <View style={styles.dateRow}>
          <Text style={{ color: birthdate ? colors.deepOcean : colors.placeholder }}>
            {birthdate ? formatHuman(birthdate) : 'Select date'}
          </Text>
          <Text variant="label" style={{ color: colors.placeholder }}>
            {picking ? '▲' : '▼'}
          </Text>
        </View>
        <HairlineRule />
      </Pressable>
      {picking && (
        <View style={{ marginTop: spacing.sm }}>
          <DateTimePicker
            value={defaultDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChange}
            maximumDate={max}
            minimumDate={min}
            themeVariant="light"
          />
        </View>
      )}
      {birthdate && !isAtLeast18(birthdate) && (
        <>
          <View style={{ height: spacing.xs }} />
          <Text variant="label" style={{ color: colors.mud }}>
            You must be eighteen or older.
          </Text>
        </>
      )}
      <View style={{ height: spacing.lg }} />
      <Button disabled={!valid} onPress={() => router.push('/onboarding/gender')}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.md },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
