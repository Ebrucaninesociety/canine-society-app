import { supabaseServer } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';

export type Moderator = { user_id: string; display_name: string };

export async function getModeratorOrNull(): Promise<Moderator | null> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin
    .from('moderators')
    .select('user_id, display_name')
    .eq('user_id', user.id)
    .maybeSingle();
  return data ?? null;
}
