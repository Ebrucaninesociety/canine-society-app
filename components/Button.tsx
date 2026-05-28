import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import { ReactNode } from 'react';
import { Text } from './Text';
import { colors, spacing } from '../design';

type Props = {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ onPress, children, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed && (variant === 'primary' ? styles.primaryPressed : styles.ghostPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <View>
        <Text variant="label" style={{ color: variant === 'primary' ? colors.sand : colors.deepOcean }}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.deepOcean },
  primaryPressed: { backgroundColor: colors.mud },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.deepOcean },
  ghostPressed: { backgroundColor: colors.water },
  disabled: { opacity: 0.4 },
});
