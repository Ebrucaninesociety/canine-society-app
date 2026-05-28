import { View } from 'react-native';
import { colors } from '../design';

export function HairlineRule({ vertical = false }: { vertical?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: colors.hairline,
        ...(vertical ? { width: 1, height: '100%' } : { height: 1, width: '100%' }),
      }}
    />
  );
}
