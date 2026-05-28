import { supabase } from './supabase';

export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account');
  if (error) throw error;
  if (data && typeof data === 'object' && 'ok' in data && data.ok !== true) {
    throw new Error('delete failed');
  }
  await supabase.auth.signOut();
}
