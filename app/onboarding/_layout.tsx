import { Stack, useSegments } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../design';
import { ProgressRule } from '../../components/ProgressRule';

const STEPS = ['index', 'name', 'gender', 'city', 'photos', 'dog', 'bio', 'notifications', 'submit'];

export default function OnboardingLayout() {
  const segments = useSegments();
  const current = segments[segments.length - 1] || 'index';
  const index = Math.max(0, STEPS.indexOf(current));
  const progress = (index + 1) / STEPS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.sand }}>
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <ProgressRule progress={progress} />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.sand },
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaView>
  );
}
