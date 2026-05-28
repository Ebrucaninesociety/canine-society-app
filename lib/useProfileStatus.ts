import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useSession } from './session';

export type ProfileStatus = 'loading' | 'none' | 'pending' | 'approved' | 'rejected' | 'banned';

export function useProfileStatus(): ProfileStatus {
  const { session } = useSession();
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setStatus('none');
      return;
    }
    let alive = true;
    supabase
      .from('profiles')
      .select('verification_status')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setStatus(data ? (data.verification_status as ProfileStatus) : 'none');
      });

    const channelName = `profile-status-${userId}-${Math.random().toString(36).slice(2, 8)}`;
    const ch = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload: { new: { verification_status: ProfileStatus } }) => {
          if (alive) setStatus(payload.new.verification_status);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [userId]);

  return status;
}
