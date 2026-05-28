import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getModeratorOrNull } from '@/lib/moderator';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Row = {
  id: string;
  display_name: string;
  birthdate: string;
  city: string;
  country: string;
  created_at: string;
  primary_photo_path: string | null;
};

async function loadQueue(): Promise<Row[]> {
  const { data: profiles } = await supabaseAdmin()
    .from('profiles')
    .select('id, display_name, birthdate, city, country, created_at')
    .eq('verification_status', 'pending')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(50);

  if (!profiles) return [];

  const ids = profiles.map((p) => p.id);
  const { data: photos } = await supabaseAdmin()
    .from('photos')
    .select('profile_id, storage_path')
    .in('profile_id', ids)
    .eq('is_primary', true);

  const photoByProfile = new Map<string, string>(
    (photos ?? []).map((p) => [p.profile_id, p.storage_path]),
  );

  return profiles.map((p) => ({
    ...p,
    primary_photo_path: photoByProfile.get(p.id) ?? null,
  }));
}

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

async function signedUrlOrNull(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabaseAdmin().storage.from('profile-photos').createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export default async function QueuePage() {
  const moderator = await getModeratorOrNull();
  if (!moderator) {
    redirect('/no-access');
  }
  const rows = await loadQueue();

  // Sign all primary photos in parallel.
  const signed = await Promise.all(rows.map((r) => signedUrlOrNull(r.primary_photo_path)));

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 32px' }}>
      <div className="label">III · Society</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>Moderation queue</h1>
      <p style={{ color: 'var(--color-deep-ocean)', opacity: 0.6, marginTop: 8 }}>
        Signed in as {moderator.display_name}. {rows.length} pending {rows.length === 1 ? 'profile' : 'profiles'}.
      </p>
      <hr />

      {rows.length === 0 ? (
        <p>No profiles to review.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 24 }}>
          {rows.map((row, i) => (
            <li key={row.id}>
              <Link
                href={`/queue/${row.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  gap: 24,
                  alignItems: 'center',
                  padding: 16,
                  borderTop: '1px solid var(--color-hairline)',
                  color: 'var(--color-deep-ocean)',
                  textDecoration: 'none',
                }}
              >
                {signed[i] ? (
                  <img
                    src={signed[i]!}
                    alt=""
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 120, height: 120, background: 'var(--color-water)' }} />
                )}
                <div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>
                    {row.display_name}, {ageOf(row.birthdate)}
                  </div>
                  <div className="label" style={{ marginTop: 4 }}>
                    {row.city} · {row.country}
                  </div>
                </div>
                <span className="label">Review →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
