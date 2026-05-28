import { NextResponse } from 'next/server';
import { getModeratorOrNull } from '@/lib/moderator';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const moderator = await getModeratorOrNull();
  if (!moderator) return new NextResponse('forbidden', { status: 403 });

  const { profileId, reason, note } = (await req.json()) as {
    profileId: string;
    reason: string;
    note?: string;
  };
  if (!profileId || !reason) return new NextResponse('profileId and reason required', { status: 400 });

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      verification_status: 'rejected',
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: moderator.user_id,
      verification_notes: note ? `${reason}: ${note}` : reason,
    })
    .eq('id', profileId);
  if (error) return new NextResponse(error.message, { status: 500 });

  await supabaseAdmin.functions
    .invoke('notify-decision', { body: { profileId, decision: 'rejected', reason, note } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
