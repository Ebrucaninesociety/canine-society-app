import { supabase } from './supabase';

export type ReportReason =
  | 'fake_profile'
  | 'no_dog'
  | 'inappropriate_photo'
  | 'harassment'
  | 'underage'
  | 'spam'
  | 'other';

export async function reportProfile(
  reportedId: string,
  reason: ReportReason,
  details?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_profile_id: reportedId,
    reason,
    details: details?.trim() ? details.trim() : null,
  });
  if (error) throw error;
}
