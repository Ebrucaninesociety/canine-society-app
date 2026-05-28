import { supabase } from './supabase';

export type Message = {
  id: string;
  match_id: string;
  sender_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function fetchMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(matchId: string, body: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase.from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    body,
  });
  if (error) throw error;
}

export function subscribeMessages(matchId: string, onMessage: (msg: Message) => void): () => void {
  const ch = supabase
    .channel(`chat-${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload: { new: Message }) => onMessage(payload.new),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export async function markRead(matchId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .is('read_at', null);
}
