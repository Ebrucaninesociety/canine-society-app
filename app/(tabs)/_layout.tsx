import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../design';

function TabLabel({ numeral, label, focused }: { numeral: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: spacing.xs }}>
      <Text
        variant="label"
        style={{ color: focused ? colors.deepOcean : colors.placeholder, marginBottom: 2, fontSize: 9 }}
      >
        {numeral}
      </Text>
      <Text variant="label" style={{ color: focused ? colors.deepOcean : colors.placeholder, fontSize: 9 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.sand,
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.sand },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="I" label="Discover" focused={focused} /> }}
      />
      <Tabs.Screen
        name="matches"
        options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="II" label="Matches" focused={focused} /> }}
      />
      <Tabs.Screen
        name="society"
        options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="III" label="Society" focused={focused} /> }}
      />
      <Tabs.Screen
        name="edition"
        options={{ tabBarIcon: ({ focused }) => <TabLabel numeral="IV" label="Edition" focused={focused} /> }}
      />
    </Tabs>
  );
}
