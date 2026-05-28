import { supabase } from './supabase';

export async function blockUser(targetId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase
    .from('blocks')
    .upsert({ blocker_id: user.id, blocked_id: targetId }, { onConflict: 'blocker_id,blocked_id' });
  if (error) throw error;

  // Also soft-unmatch any active matches with the blocked user.
  const a = user.id < targetId ? user.id : targetId;
  const b = user.id < targetId ? targetId : user.id;
  await supabase
    .from('matches')
    .update({ unmatched_at: new Date().toISOString(), unmatched_by: user.id })
    .eq('profile_a_id', a)
    .eq('profile_b_id', b)
    .is('unmatched_at', null);
}

export async function unblockUser(targetId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId);
  if (error) throw error;
}

export type BlockedRow = {
  blocked_id: string;
  blocked: { display_name: string } | null;
};

export async function listBlocked(): Promise<BlockedRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('blocks')
    .select('blocked_id, blocked:profiles!blocks_blocked_id_fkey(display_name)')
    .eq('blocker_id', user.id);
  return (data ?? []) as unknown as BlockedRow[];
}
