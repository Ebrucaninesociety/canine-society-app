import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Pressable,
  Alert,
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
import { blockUser } from '../../lib/block';
import { unmatch } from '../../lib/match';
import { Text } from '../../components/Text';
import { HairlineRule } from '../../components/HairlineRule';
import { useToast } from '../../components/Toast';
import { colors, spacing, typography } from '../../design';

export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherName, setOtherName] = useState('');
  const [otherId, setOtherId] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!matchId || !session?.user) return;
    const me = session.user.id;
    let unsub: (() => void) | null = null;
    (async () => {
      const initial = await fetchMessages(matchId);
      setMessages(initial);
      await markRead(matchId);
      unsub = subscribeMessages(matchId, (m) => {
        if (m.sender_id === me) return;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      });
      const { data: match } = await supabase
        .from('matches')
        .select('profile_a_id, profile_b_id')
        .eq('id', matchId)
        .maybeSingle();
      if (!match) return;
      const other = match.profile_a_id === me ? match.profile_b_id : match.profile_a_id;
      setOtherId(other);
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', other)
        .maybeSingle();
      if (profile) setOtherName(profile.display_name);
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [matchId, session]);

  const send = async () => {
    if (!matchId || !text.trim() || !session?.user) return;
    const body = text.trim();
    setText('');
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      match_id: matchId,
      sender_id: session.user.id,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await sendMessage(matchId, body);
    } catch (e) {
      console.warn('send failed', e);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(body);
    }
  };

  const openMenu = () => {
    if (!otherId || !matchId) return;
    Alert.alert(otherName || 'Options', undefined, [
      { text: 'View profile', onPress: () => router.push(`/profile/${otherId}`) },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Unmatch?', 'You will no longer see each other.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unmatch',
              style: 'destructive',
              onPress: async () => {
                try {
                  await unmatch(matchId);
                  toast.show('Unmatched');
                  router.replace('/(tabs)/matches');
                } catch (e) {
                  const err = e as { message?: string };
                  Alert.alert('Could not unmatch', err.message ?? 'Try again');
                }
              },
            },
          ]);
        },
      },
      { text: 'Report', onPress: () => router.push(`/report/${otherId}`) },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => {
          Alert.alert(`Block ${otherName}?`, 'You will not see each other anywhere.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: async () => {
                try {
                  await blockUser(otherId);
                  toast.show(`Blocked ${otherName}`);
                  router.replace('/(tabs)/matches');
                } catch (e) {
                  const err = e as { message?: string };
                  Alert.alert('Could not block', err.message ?? 'Try again');
                }
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text variant="label">← Back</Text>
        </Pressable>
        <Pressable onPress={() => otherId && router.push(`/profile/${otherId}`)}>
          <Text variant="title">{otherName}</Text>
        </Pressable>
        <Pressable onPress={openMenu} style={{ paddingHorizontal: spacing.sm }}>
          <Text variant="label">⋯</Text>
        </Pressable>
      </View>
      <HairlineRule />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
