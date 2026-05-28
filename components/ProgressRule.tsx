import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../design';

export function ProgressRule({ progress }: { progress: number }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, { toValue: progress, duration: 400, useNativeDriver: false }).start();
  }, [progress, width]);
  return (
    <View style={{ height: 1, backgroundColor: colors.hairline, width: '100%' }}>
      <Animated.View
        style={{
          height: 1,
          backgroundColor: colors.deepOcean,
          width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
