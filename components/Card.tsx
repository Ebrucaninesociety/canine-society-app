import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '../design';

type Props = ViewProps & { elevation?: 'flat' | 'low' | 'lift' };

export function Card({ style, elevation = 'flat', ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        elevation === 'low' && shadows.paperLow,
        elevation === 'lift' && shadows.paperLift,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.sand, padding: spacing.md, borderRadius: 0 },
});
