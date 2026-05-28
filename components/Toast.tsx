import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors, spacing } from '../design';

type Toast = { id: number; message: string };
type Ctx = { show: (message: string) => void };

const ToastContext = createContext<Ctx>({ show: () => {} });

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <SafeAreaView pointerEvents="none" style={styles.layer} edges={['top']}>
        {toasts.map((t) => (
          <ToastItem key={t.id} message={t.message} />
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

function ToastItem({ message }: { message: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    return () => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    };
  }, [opacity, translateY]);
  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Text variant="label" style={{ color: colors.sand }}>
        {message}
      </Text>
    </Animated.View>
  );
}

export function useToast(): Ctx {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  toast: {
    backgroundColor: colors.deepOcean,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
});
