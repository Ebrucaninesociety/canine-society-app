import { supabase } from './supabase';

export async function unmatch(matchId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase
    .from('matches')
    .update({ unmatched_at: new Date().toISOString(), unmatched_by: user.id })
    .eq('id', matchId);
  if (error) throw error;
}
