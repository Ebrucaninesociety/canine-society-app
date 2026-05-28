import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy service-role client. The first call instantiates and caches it.
// Lazy because Next.js evaluates module top-level code at build time
// ("Collecting page data") where env vars may not be set yet.
// Bypasses RLS — only call after verifying the request is from a moderator.

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var');
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
