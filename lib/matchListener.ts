import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import { useSession } from './session';

export function useMatchListener() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;
    const me = session.user.id;
    const ch = supabase
      .channel(`matches-${me}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_a_id=eq.${me}` },
        (payload: { new: { id: string } }) => router.push(`/match/${payload.new.id}`),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `profile_b_id=eq.${me}` },
        (payload: { new: { id: string } }) => router.push(`/match/${payload.new.id}`),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [session, router]);
}
