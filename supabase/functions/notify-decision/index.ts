// Decision-email Edge Function. Invoked from the admin web after a
// moderator approves/rejects/requests-revision on a profile.
//
// Required env vars (set with `supabase secrets set`):
//   RESEND_API_KEY        — Resend.com API key
//   RESEND_FROM           — e.g. "Canine Society <hello@canine-society.com>"
//   SUPABASE_URL          — auto-set by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — auto-set by Supabase

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Decision = 'approved' | 'rejected' | 'revision_requested';

type Body = {
  profileId: string;
  decision: Decision;
  reason?: string;
  note?: string;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'Canine Society <onboarding@resend.dev>';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

function subjectFor(decision: Decision): string {
  switch (decision) {
    case 'approved':
      return 'Welcome to the Society';
    case 'rejected':
      return 'A note on your profile';
    case 'revision_requested':
      return 'A small adjustment, then back to us';
  }
}

function bodyFor(decision: Decision, name: string, note?: string): string {
  const greeting = `Dear ${name},`;
  switch (decision) {
    case 'approved':
      return `${greeting}

You are now part of the Society. Open the app to begin.

Canine Society
Roma · DACH`;
    case 'rejected':
      return `${greeting}

We could not approve your profile in its current form. ${note ?? 'Please review the entrance and try again.'}

You can edit and resubmit at any time from the app.

Canine Society
Roma · DACH`;
    case 'revision_requested':
      return `${greeting}

Almost in. We would like a small adjustment first:

${note ?? 'Please update your profile and resubmit.'}

Open the app, make the change, and resubmit. We will look again straight away.

Canine Society
Roma · DACH`;
  }
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('[notify-decision] RESEND_API_KEY missing, skipping email to', to);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, text }),
  });
  if (!res.ok) {
    console.error('[notify-decision] Resend error', res.status, await res.text());
  }
}

serve(async (req) => {
  try {
    const { profileId, decision, note } = (await req.json()) as Body;
    if (!profileId || !decision) {
      return new Response('profileId and decision required', { status: 400 });
    }

    const { data: profile } = await sb
      .from('profiles')
      .select('id, display_name')
      .eq('id', profileId)
      .maybeSingle();
    if (!profile) return new Response('profile not found', { status: 404 });

    const {
      data: { user },
      error: userErr,
    } = await sb.auth.admin.getUserById(profileId);
    if (userErr || !user?.email) {
      console.log('[notify-decision] no email for', profileId);
      return new Response('ok');
    }

    await sendEmail(user.email, subjectFor(decision), bodyFor(decision, profile.display_name, note));
    return new Response('ok');
  } catch (e) {
    console.error('[notify-decision] exception', e);
    return new Response('error', { status: 500 });
  }
});
