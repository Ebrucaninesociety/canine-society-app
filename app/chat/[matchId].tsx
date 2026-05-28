import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchMessages,
  sendMessage,
  subscribeMessages,
  markRead,
  Message,
} from '../../lib/chat';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { colors, spacing, typography } from '../../design';

export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherName, setOtherName] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!matchId || !session?.user) return;
    let unsub: (() => void) | null = null;
    (async () => {
      const initial = await fetchMessages(matchId);
      setMessages(initial);
      await markRead(matchId);
      unsub = subscribeMessages(matchId, (m) => {
        setMessages((prev) => [...prev, m]);
      });
      // Resolve the other party's name for the header.
      const { data: match } = await supabase
        .from('matches')
        .select('profile_a_id, profile_b_id')
        .eq('id', matchId)
        .maybeSingle();
      if (!match) return;
      const otherId =
        match.profile_a_id === session.user.id ? match.profile_b_id : match.profile_a_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .maybeSingle();
      if (profile) setOtherName(profile.display_name);
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [matchId, session]);

  const send = async () => {
    if (!matchId || !text.trim()) return;
    const body = text.trim();
    setText('');
    try {
      await sendMessage(matchId, body);
    } catch (e) {
      console.warn('send failed', e);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Text variant="title">{otherName}</Text>
        <View style={{ width: 48 }} />
      </View>
      <HairlineRule />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.sender_id === session?.user?.id;
            return (
              <View style={[styles.bubbleWrap, mine ? styles.rightWrap : styles.leftWrap]}>
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={{ color: mine ? colors.sand : colors.deepOcean }}>{item.body}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.bar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!text.trim()}
            style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
          >
            <Text variant="label" style={{ color: colors.sand }}>
              Send
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: { padding: spacing.md, gap: spacing.xs },
  bubbleWrap: { flexDirection: 'row' },
  leftWrap: { justifyContent: 'flex-start' },
  rightWrap: { justifyContent: 'flex-end' },
  bubble: { padding: spacing.sm, maxWidth: '78%' },
  mine: { backgroundColor: colors.deepOcean },
  theirs: { backgroundColor: colors.sand, borderWidth: 1, borderColor: colors.deepOcean },
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.deepOcean,
    borderBottomWidth: 1,
    borderBottomColor: colors.deepOcean,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.deepOcean,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
