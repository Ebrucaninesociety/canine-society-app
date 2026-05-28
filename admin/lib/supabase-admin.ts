import { createClient } from '@supabase/supabase-js';

// Service-role client. Bypasses RLS. Only use in server routes after
// verifying the caller is a moderator (see lib/moderator.ts).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
