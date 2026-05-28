import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useSession } from './session';

export type ProfileStatus = 'loading' | 'none' | 'pending' | 'approved' | 'rejected' | 'banned';

export function useProfileStatus(): ProfileStatus {
  const { session } = useSession();
  const [status, setStatus] = useState<ProfileStatus>('loading');

  useEffect(() => {
    if (!session?.user) {
      setStatus('none');
      return;
    }
    let alive = true;
    supabase
      .from('profiles')
      .select('verification_status')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setStatus(data ? (data.verification_status as ProfileStatus) : 'none');
      });

    const ch = supabase
      .channel(`profile-status-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload: { new: { verification_status: ProfileStatus } }) => {
          if (alive) setStatus(payload.new.verification_status);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [session]);

  return status;
}
