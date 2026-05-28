import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing } from '../../design';
import { ARTICLES } from '../../lib/articles';

export default function ArticlePage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          <Text>Not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Edition</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.body}>
          <Text variant="label">{article.category}</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="display">{article.title}</Text>
          <View style={{ height: spacing.sm }} />
          <Text variant="label" style={{ color: colors.placeholder }}>
            {article.dek}
          </Text>
          <View style={{ height: spacing.md }} />
          <HairlineRule />
          <View style={{ height: spacing.md }} />
          {article.body.split('\n\n').map((para, i) => (
            <View key={i}>
              <Text>{para}</Text>
              <View style={{ height: spacing.md }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  body: { padding: spacing.md },
});
