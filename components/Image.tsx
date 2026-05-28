import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors } from '../design';

// Single image primitive used across the app. Wraps expo-image so we get
// the caching, placeholders, and decoding off the main thread for free.
// Falls back to a Water-blue paper rectangle while loading.

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'; // a generic warm-ocean placeholder

type Props = ExpoImageProps & { rounded?: boolean };

export function Image({ rounded = false, style, ...rest }: Props) {
  return (
    <View style={[styles.wrap, { borderRadius: rounded ? 9999 : 0 }, style as object]}>
      <ExpoImage
        {...rest}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={150}
        placeholder={{ blurhash: BLURHASH }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.water },
});
