import { Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../design';
import { Text } from './Text';

type Props = { label: string; active?: boolean; onPress?: () => void };

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, active && styles.active]}>
      <Text variant="label" style={{ color: active ? colors.sand : colors.deepOcean }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.deepOcean,
    backgroundColor: colors.sand,
  },
  active: { backgroundColor: colors.deepOcean },
});
