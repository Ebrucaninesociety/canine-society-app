import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import { useSession } from './session';

export function useMatchListener() {
  const { session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    // Unique per mount so React's StrictMode double-effect doesn't try to
    // attach .on() callbacks to a channel that already has .subscribe()
    // called on it.
    const channelName = `matches-${userId}-${Math.random().toString(36).slice(2, 8)}`;
    const ch = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_a_id=eq.${userId}` },
        (payload: { new: { id: string } }) => router.push(`/match/${payload.new.id}`),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_b_id=eq.${userId}` },
        (payload: { new: { id: string } }) => router.push(`/match/${payload.new.id}`),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, router]);
}
