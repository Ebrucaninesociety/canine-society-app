/**
 * Seed the Canine Society database with approved profiles, dogs, photos,
 * pre-existing swipes that "like" the founder, and a few pre-built matches
 * with conversation history.
 *
 * Usage:
 *   FOUNDER_EMAIL=peter1980.001@gmail.com npm run seed
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FOUNDER_EMAIL  — the email of the existing test user to seed AROUND
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!FOUNDER_EMAIL) {
  console.error('Missing FOUNDER_EMAIL (the email of the test user to seed around)');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Seed = {
  email: string;
  display_name: string;
  birthdate: string;
  city: string;
  country: 'DE' | 'AT' | 'CH';
  bio: string;
  dog: { name: string; breed: string; size: 'small' | 'medium' | 'large'; bio?: string };
  photoBreedSlugs: string[]; // dog.ceo breed slugs to pull photos from
};

// Eight imagined affluent DACH dog owners. Italianate first names where it
// fits the brand tone; German cities throughout.
const SEEDS: Seed[] = [
  {
    email: 'sofia.r@seed.canine-society.test',
    display_name: 'Sofia',
    birthdate: '1992-04-18',
    city: 'Berlin',
    country: 'DE',
    bio: 'Editor. Roma, Hamburg, Berlin. Reading what is on the table.',
    dog: { name: 'Giorgio', breed: 'Whippet', size: 'medium', bio: 'A long walker.' },
    photoBreedSlugs: ['whippet'],
  },
  {
    email: 'beatrice.k@seed.canine-society.test',
    display_name: 'Beatrice',
    birthdate: '1988-09-02',
    city: 'München',
    country: 'DE',
    bio: 'Architect. Books, linen, long afternoons.',
    dog: { name: 'Carla', breed: 'Italian Greyhound', size: 'small' },
    photoBreedSlugs: ['greyhound/italian'],
  },
  {
    email: 'elena.h@seed.canine-society.test',
    display_name: 'Elena',
    birthdate: '1990-11-23',
    city: 'Hamburg',
    country: 'DE',
    bio: 'Gallery, Speicherstadt. Two coffees, never one.',
    dog: { name: 'Otto', breed: 'Spinone', size: 'large' },
    photoBreedSlugs: ['spaniel/cocker'],
  },
  {
    email: 'francesca.w@seed.canine-society.test',
    display_name: 'Francesca',
    birthdate: '1995-02-14',
    city: 'Frankfurt',
    country: 'DE',
    bio: 'Banking by day, Bach by night.',
    dog: { name: 'Luna', breed: 'Saluki', size: 'large' },
    photoBreedSlugs: ['saluki'],
  },
  {
    email: 'isabel.m@seed.canine-society.test',
    display_name: 'Isabel',
    birthdate: '1986-07-30',
    city: 'Köln',
    country: 'DE',
    bio: 'I host long suppers. Not on Sundays.',
    dog: { name: 'Tito', breed: 'Border Terrier', size: 'small' },
    photoBreedSlugs: ['terrier/border'],
  },
  {
    email: 'mathilda.s@seed.canine-society.test',
    display_name: 'Mathilda',
    birthdate: '1991-05-09',
    city: 'Wien',
    country: 'AT',
    bio: 'A small studio in the first district. Mostly drawing.',
    dog: { name: 'Bianca', breed: 'Standard Poodle', size: 'large' },
    photoBreedSlugs: ['poodle/standard'],
  },
  {
    email: 'olivia.b@seed.canine-society.test',
    display_name: 'Olivia',
    birthdate: '1989-12-01',
    city: 'Zürich',
    country: 'CH',
    bio: 'Walks at six, papers at seven, the rest is negotiable.',
    dog: { name: 'Romeo', breed: 'Vizsla', size: 'large' },
    photoBreedSlugs: ['vizsla'],
  },
  {
    email: 'clara.v@seed.canine-society.test',
    display_name: 'Clara',
    birthdate: '1993-08-17',
    city: 'Hamburg',
    country: 'DE',
    bio: 'New to Hamburg, old to dogs.',
    dog: { name: 'Bruno', breed: 'Hovawart', size: 'large' },
    photoBreedSlugs: ['retriever/golden'],
  },
];

// dog.ceo returns: { message: <url>, status: "success" }
async function fetchDogPhotoBytes(breedSlug: string): Promise<Uint8Array> {
  const apiUrl = `https://dog.ceo/api/breed/${breedSlug}/images/random`;
  const apiRes = await fetch(apiUrl);
  const json = (await apiRes.json()) as { status: string; message: string };
  if (json.status !== 'success') {
    // fallback to "any random dog"
    const fb = await fetch('https://dog.ceo/api/breeds/image/random');
    const fbJson = (await fb.json()) as { message: string };
    json.message = fbJson.message;
  }
  const imgRes = await fetch(json.message);
  const arrayBuffer = await imgRes.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  // Paginate auth users; cap at 1000 — plenty for a single founder.
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email === email)?.id ?? null;
}

async function ensureSeededUser(seed: Seed): Promise<string> {
  // Check if already exists
  const existing = await findUserIdByEmail(seed.email);
  if (existing) {
    console.log(`  · existing: ${seed.email}`);
    return existing;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: seed.email,
    email_confirm: true,
    password: crypto.randomUUID(), // they will never sign in
  });
  if (error) throw error;
  console.log(`  · created:  ${seed.email}`);
  return data.user.id;
}

async function upsertProfile(userId: string, seed: Seed): Promise<void> {
  const { error } = await sb.from('profiles').upsert({
    id: userId,
    display_name: seed.display_name,
    birthdate: seed.birthdate,
    gender: 'woman',
    looking_for: ['men'],
    city: seed.city,
    country: seed.country,
    bio: seed.bio,
    verification_status: 'approved',
    verification_reviewed_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function ensureDog(userId: string, seed: Seed): Promise<void> {
  const { data } = await sb.from('dogs').select('id').eq('owner_id', userId).limit(1).maybeSingle();
  if (data) return;
  const { error } = await sb.from('dogs').insert({
    owner_id: userId,
    name: seed.dog.name,
    breed: seed.dog.breed,
    size: seed.dog.size,
    bio: seed.dog.bio ?? null,
  });
  if (error) throw error;
}

async function ensurePhotos(userId: string, seed: Seed): Promise<void> {
  const { data: existing } = await sb.from('photos').select('id').eq('profile_id', userId);
  if (existing && existing.length > 0) return;

  for (let i = 0; i < seed.photoBreedSlugs.length; i++) {
    const slug = seed.photoBreedSlugs[i];
    const bytes = await fetchDogPhotoBytes(slug);
    const path = `${userId}/seed-${Date.now()}-${i}.jpg`;
    const { error: upErr } = await sb.storage
      .from('profile-photos')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
    if (upErr) throw upErr;
    const { error: rowErr } = await sb.from('photos').insert({
      profile_id: userId,
      storage_path: path,
      is_primary: i === 0,
      is_dog_photo: true,
      position: i,
      verification_status: 'approved',
    });
    if (rowErr) throw rowErr;
  }
}

async function ensureLikeFromSeedToFounder(seedId: string, founderId: string): Promise<void> {
  const { error } = await sb.from('swipes').upsert(
    { swiper_id: seedId, swipee_id: founderId, direction: 'like', intent: 'date' },
    { onConflict: 'swiper_id,swipee_id,intent', ignoreDuplicates: true },
  );
  if (error) throw error;
}

async function ensurePreMatch(seedId: string, founderId: string, messages: { from: 'seed' | 'founder'; body: string }[]): Promise<void> {
  // The match trigger only fires on swipe insert. Make BOTH sides like each
  // other, then the trigger creates the match.
  await sb.from('swipes').upsert(
    { swiper_id: seedId, swipee_id: founderId, direction: 'like', intent: 'date' },
    { onConflict: 'swiper_id,swipee_id,intent', ignoreDuplicates: true },
  );
  await sb.from('swipes').upsert(
    { swiper_id: founderId, swipee_id: seedId, direction: 'like', intent: 'date' },
    { onConflict: 'swiper_id,swipee_id,intent', ignoreDuplicates: true },
  );

  // The trigger normalises profile_a_id < profile_b_id.
  const a = seedId < founderId ? seedId : founderId;
  const b = seedId < founderId ? founderId : seedId;
  const { data: match } = await sb
    .from('matches')
    .select('id')
    .eq('profile_a_id', a)
    .eq('profile_b_id', b)
    .eq('intent', 'date')
    .maybeSingle();
  if (!match) return;

  // Insert any missing messages (idempotent: skip if any messages exist)
  const { data: existing } = await sb.from('messages').select('id').eq('match_id', match.id).limit(1);
  if (existing && existing.length > 0) return;

  for (const m of messages) {
    await sb.from('messages').insert({
      match_id: match.id,
      sender_id: m.from === 'seed' ? seedId : founderId,
      body: m.body,
    });
  }
}

async function main() {
  console.log(`Seeding around founder: ${FOUNDER_EMAIL}`);
  const founderId = await findUserIdByEmail(FOUNDER_EMAIL);
  if (!founderId) {
    console.error(`No auth user found with email ${FOUNDER_EMAIL}. Sign up on the mobile app first.`);
    process.exit(1);
  }
  console.log(`Founder id: ${founderId}\n`);

  const ids: string[] = [];
  for (const seed of SEEDS) {
    console.log(`→ ${seed.display_name}`);
    const id = await ensureSeededUser(seed);
    await upsertProfile(id, seed);
    await ensureDog(id, seed);
    await ensurePhotos(id, seed);
    ids.push(id);
  }

  console.log('\nGiving the founder eight one-sided likes (so right-swipes match instantly)...');
  for (const id of ids) {
    await ensureLikeFromSeedToFounder(id, founderId);
  }

  console.log('\nPre-creating three matches with seeded chat history...');
  await ensurePreMatch(ids[0], founderId, [
    { from: 'seed', body: 'Hello. Giorgio noticed your dog first, I followed.' },
    { from: 'founder', body: 'A whippet of taste. Where do you walk in Berlin?' },
    { from: 'seed', body: 'Tiergarten before nine. Coffee from a small place on Potsdamer Straße.' },
  ]);
  await ensurePreMatch(ids[1], founderId, [
    { from: 'seed', body: 'München this weekend?' },
    { from: 'founder', body: 'Tell me where.' },
  ]);
  await ensurePreMatch(ids[2], founderId, [
    { from: 'seed', body: 'Otto sends his regards.' },
  ]);

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
