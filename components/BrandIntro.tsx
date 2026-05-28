import { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from './Text';
import { colors } from '../design';

// Mirrors the website's LoadingIntro: Deep Ocean full bleed,
// "It's not your club." -> "It's your Canine Society." -> wordmark.
// Shown once per install; skipped thereafter (cached in AsyncStorage).

type Stage = 'pre' | 'msg1' | 'msg2' | 'logo' | 'done';

const STORAGE_KEY = 'cs:intro-seen';
const MSG1_MS = 1100;
const MSG2_MS = 1900;
const GAP_MS = 220;
const LOGO_MS = 1000;

export function BrandIntro({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>('pre');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((seen) => {
      if (seen === '1') {
        setStage('done');
        onDone();
        return;
      }
      setStage('msg1');
    });
  }, [onDone]);

  useEffect(() => {
    if (stage !== 'msg1') return;
    const t1 = setTimeout(() => setStage('msg2'), MSG1_MS + GAP_MS);
    const t2 = setTimeout(() => setStage('logo'), MSG1_MS + GAP_MS + MSG2_MS + GAP_MS);
    const t3 = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, '1');
      setStage('done');
      onDone();
    }, MSG1_MS + GAP_MS + MSG2_MS + GAP_MS + LOGO_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [stage, onDone]);

  if (stage === 'pre' || stage === 'done') return null;

  return (
    <View style={styles.root} pointerEvents="none">
      <FadeText visible={stage === 'msg1'}>
        <Text variant="headline" style={styles.tagline}>
          It’s not your club.
        </Text>
      </FadeText>
      <FadeText visible={stage === 'msg2'}>
        <Text variant="headline" style={styles.tagline}>
          It’s your Canine Society.
        </Text>
      </FadeText>
      <FadeText visible={stage === 'logo'}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="label" style={styles.label}>
            Roma · DACH · Issue I
          </Text>
          <View style={{ height: 12 }} />
          <Text variant="display" style={styles.wordmark}>
            CANINE
          </Text>
          <Text variant="display" style={styles.wordmark}>
            SOCIETY
          </Text>
        </View>
      </FadeText>
    </View>
  );
}

function FadeText({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.center, { opacity }]}>
      {children}
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.deepOcean,
    zIndex: 100,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  tagline: {
    color: colors.sand,
    textAlign: 'center',
    paddingHorizontal: 32,
    maxWidth: width * 0.9,
  },
  label: { color: colors.sand, opacity: 0.7 },
  wordmark: { color: colors.sand, textAlign: 'center' },
});
