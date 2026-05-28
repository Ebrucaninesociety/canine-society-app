import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors, typography } from '../design';

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    color: colors.deepOcean,
    borderBottomWidth: 1,
    borderBottomColor: colors.deepOcean,
    paddingVertical: 12,
  },
});
