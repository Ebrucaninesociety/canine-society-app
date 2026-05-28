import { supabase } from './supabase';

type CachedUrl = { url: string; expires: number };
const cache = new Map<string, CachedUrl>();
const TTL_MS = 60 * 60 * 1000; // 1h

export async function signedPhotoUrl(storagePath: string): Promise<string> {
  const now = Date.now();
  const hit = cache.get(storagePath);
  if (hit && hit.expires > now + 60_000) return hit.url;
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .createSignedUrl(storagePath, 60 * 60);
  if (error || !data) throw error ?? new Error('no signed url');
  cache.set(storagePath, { url: data.signedUrl, expires: now + TTL_MS });
  return data.signedUrl;
}
