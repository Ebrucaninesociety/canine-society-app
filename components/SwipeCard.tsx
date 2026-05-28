import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from './Image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from './Text';
import { colors, shadows, spacing } from '../design';

type Props = {
  uri: string;
  name: string;
  age: number;
  city: string;
  onSwipe: (dir: 'like' | 'pass') => void;
  onTap: () => void;
};

export function SwipeCard({ uri, name, age, city, onSwipe, onTap }: Props) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const THRESH = width * 0.28;

  const pan = Gesture.Pan()
    .onChange((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd(() => {
      if (Math.abs(x.value) > THRESH) {
        const dir = x.value > 0 ? 'like' : 'pass';
        const target = Math.sign(x.value) * width * 1.5;
        x.value = withSpring(target, { stiffness: 90 }, (finished) => {
          if (finished) runOnJS(onSwipe)(dir as 'like' | 'pass');
        });
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)();
  });

  const composed = Gesture.Race(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-width, 0, width], [-10, 0, 10])}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, width * 0.3], [0, 1], 'clamp'),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-width * 0.3, 0], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.card, shadows.paperLow, cardStyle]}>
        <Image source={{ uri }} style={styles.img} />
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
          <Text variant="label" style={{ color: colors.sand }}>
            Like
          </Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, passStyle]}>
          <Text variant="label" style={{ color: colors.sand }}>
            Pass
          </Text>
        </Animated.View>
        <View style={styles.caption}>
          <Text variant="headline" style={{ color: colors.sand }}>
            {name}, {age}
          </Text>
          <Text variant="label" style={{ color: colors.sand }}>
            {city}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.water, borderRadius: 0, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  caption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(23,36,81,0.6)',
  },
  stamp: {
    position: 'absolute',
    top: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  stampLike: { right: spacing.md, backgroundColor: colors.deepOcean },
  stampPass: { left: spacing.md, backgroundColor: colors.mud },
});
