import { NextResponse } from 'next/server';
import { getModeratorOrNull } from '@/lib/moderator';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const moderator = await getModeratorOrNull();
  if (!moderator) return new NextResponse('forbidden', { status: 403 });

  const { profileId } = (await req.json()) as { profileId: string };
  if (!profileId) return new NextResponse('profileId required', { status: 400 });

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      verification_status: 'approved',
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: moderator.user_id,
      verification_notes: null,
    })
    .eq('id', profileId);
  if (error) return new NextResponse(error.message, { status: 500 });

  await supabaseAdmin.from('photos').update({ verification_status: 'approved' }).eq('profile_id', profileId);

  // Fire-and-forget decision email
  await supabaseAdmin.functions.invoke('notify-decision', { body: { profileId, decision: 'approved' } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
