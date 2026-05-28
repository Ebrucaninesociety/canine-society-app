// Account-deletion Edge Function.
//
// Verifies the caller via the user JWT, then uses the service-role key to:
//  1. Update sender_id = NULL on the caller's messages (kept readable for
//     the other side; appears as 'Former member').
//  2. Soft-unmatch every match the caller is in.
//  3. Remove all of the caller's storage objects in profile-photos/<uid>/.
//  4. Delete the auth user — cascades and removes the profile + dog rows
//     via the FK chain.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response('unauthenticated', { status: 401 });

    // Verify the caller by hitting auth with their JWT.
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return new Response('unauthenticated', { status: 401 });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1. Anonymise messages (sender_id -> NULL).
    await admin.from('messages').update({ sender_id: null }).eq('sender_id', user.id);

    // 2. Soft-unmatch any matches involving this user.
    await admin
      .from('matches')
      .update({ unmatched_at: new Date().toISOString(), unmatched_by: user.id })
      .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`)
      .is('unmatched_at', null);

    // 3. Delete storage objects under <user-id>/.
    const { data: objects } = await admin.storage.from('profile-photos').list(user.id);
    if (objects && objects.length > 0) {
      const paths = objects.map((o) => `${user.id}/${o.name}`);
      await admin.storage.from('profile-photos').remove(paths);
    }

    // 4. Delete the auth user (cascades to profile, dog, photos, swipes via FK).
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return new Response(delErr.message, { status: 500 });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[delete-account]', e);
    return new Response('error', { status: 500 });
  }
});
