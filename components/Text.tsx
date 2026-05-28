import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { typography, colors } from '../design';

type Variant = keyof typeof typography;

export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <RNText {...rest} style={[styles.base, typography[variant], style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.deepOcean },
});
