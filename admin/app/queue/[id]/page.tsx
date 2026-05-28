import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getModeratorOrNull } from '@/lib/moderator';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Actions } from './Actions';

async function loadProfile(id: string) {
  const sb = supabaseAdmin();
  const [{ data: profile }, { data: dogs }, { data: photos }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', id).maybeSingle(),
    sb.from('dogs').select('*').eq('owner_id', id),
    sb.from('photos').select('*').eq('profile_id', id).order('position'),
  ]);

  if (!profile) return null;

  const signedPhotos = await Promise.all(
    (photos ?? []).map(async (p: { id: string; storage_path: string; is_dog_photo: boolean }) => {
      const { data } = await sb.storage
        .from('profile-photos')
        .createSignedUrl(p.storage_path, 60 * 60);
      return { ...p, url: data?.signedUrl ?? null };
    }),
  );

  return { profile, dogs: dogs ?? [], photos: signedPhotos };
}

function ageOf(birthdate: string): number {
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default async function QueueProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const moderator = await getModeratorOrNull();
  if (!moderator) redirect('/no-access');

  const { id } = await params;
  const data = await loadProfile(id);
  if (!data) {
    return (
      <main style={{ maxWidth: 720, margin: '12vh auto', padding: '0 32px' }}>
        <h1>Profile not found</h1>
        <p>It may have been deleted.</p>
        <Link href="/queue" className="label">← back to queue</Link>
      </main>
    );
  }

  const { profile, dogs, photos } = data;

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '64px 32px' }}>
      <Link href="/queue" className="label" style={{ color: 'var(--color-deep-ocean)', textDecoration: 'none' }}>
        ← back to queue
      </Link>
      <div style={{ height: 16 }} />
      <div className="label">Review</div>
      <h1 style={{ fontSize: 48, lineHeight: 1, marginTop: 8 }}>
        {profile.display_name}, {ageOf(profile.birthdate)}
      </h1>
      <p className="label" style={{ marginTop: 8 }}>
        {profile.city} · {profile.country} · {profile.gender} · looking for {(profile.looking_for ?? []).join(', ')}
      </p>
      <hr />

      <section>
        <div className="label">Photos</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 16,
          }}
        >
          {photos.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
              {p.url ? (
                <img src={p.url} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              ) : (
                <div style={{ aspectRatio: '1/1', background: 'var(--color-water)' }} />
              )}
              {p.is_dog_photo && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'var(--color-deep-ocean)',
                    color: 'var(--color-sand)',
                    padding: '4px 8px',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  With dog
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <hr />

      <section>
        <div className="label">Bio</div>
        <p style={{ marginTop: 8 }}>{profile.bio || <em style={{ opacity: 0.6 }}>No bio.</em>}</p>
      </section>

      <hr />

      <section>
        <div className="label">Dog</div>
        {dogs.length === 0 ? (
          <p style={{ marginTop: 8 }}>
            <em style={{ opacity: 0.6 }}>No dog details.</em>
          </p>
        ) : (
          dogs.map((d: { id: string; name: string; breed: string | null; size: string; bio: string | null }) => (
            <div key={d.id} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>
                {d.name}
                {d.breed ? `, ${d.breed}` : ''}
              </div>
              <div className="label" style={{ marginTop: 4 }}>
                {d.size}
              </div>
              {d.bio && <p style={{ marginTop: 8 }}>{d.bio}</p>}
            </div>
          ))
        )}
      </section>

      <hr />

      <Actions profileId={profile.id} />
    </main>
  );
}
