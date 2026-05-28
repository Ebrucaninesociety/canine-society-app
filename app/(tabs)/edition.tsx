import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { ARTICLES } from '../../lib/articles';

export default function Edition() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text variant="label">IV · Edition</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="headline">The magazine</Text>
          <View style={{ height: spacing.xs }} />
          <Text variant="label" style={{ color: colors.placeholder }}>
            Roma · DACH · Issue I
          </Text>
        </View>
        <HairlineRule />
        {ARTICLES.map((article, i) => (
          <Pressable
            key={article.slug}
            onPress={() => router.push(`/article/${article.slug}`)}
            style={styles.card}
          >
            <Text variant="label">
              {String(i + 1).padStart(2, '0')} · {article.category}
            </Text>
            <View style={{ height: spacing.xs }} />
            <Text variant="headline">{article.title}</Text>
            <View style={{ height: spacing.sm }} />
            <Text>{article.dek}</Text>
            {article.city && (
              <>
                <View style={{ height: spacing.sm }} />
                <Text variant="label" style={{ color: colors.placeholder }}>
                  From {article.city}
                </Text>
              </>
            )}
            <View style={{ height: spacing.md }} />
            <HairlineRule />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: { padding: spacing.md, paddingTop: spacing.lg },
  card: { padding: spacing.md },
});
