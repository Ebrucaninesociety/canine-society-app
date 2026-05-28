import { supabase } from './supabase';

export type DeckProfile = {
  id: string;
  display_name: string;
  birthdate: string;
  city: string;
  country: string;
  bio: string | null;
};

export type ProfileDetail = {
  profile: DeckProfile & { gender: string; looking_for: string[] };
  dogs: { id: string; name: string; breed: string | null; size: string; bio: string | null }[];
  photos: { id: string; storage_path: string; is_primary: boolean; is_dog_photo: boolean; position: number }[];
};

export async function fetchDeck(limit = 20): Promise<DeckProfile[]> {
  const { data, error } = await supabase.rpc('next_deck', { limit_count: limit });
  if (error) throw error;
  return (data ?? []) as DeckProfile[];
}

export async function fetchProfileDetail(profileId: string): Promise<ProfileDetail | null> {
  const [{ data: profile }, { data: dogs }, { data: photos }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', profileId).maybeSingle(),
    supabase.from('dogs').select('id, name, breed, size, bio').eq('owner_id', profileId),
    supabase
      .from('photos')
      .select('id, storage_path, is_primary, is_dog_photo, position')
      .eq('profile_id', profileId)
      .order('position'),
  ]);
  if (!profile) return null;
  return { profile, dogs: dogs ?? [], photos: photos ?? [] };
}

export async function fetchPrimaryPhotoPath(profileId: string): Promise<string | null> {
  const { data } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('profile_id', profileId)
    .eq('is_primary', true)
    .maybeSingle();
  return data?.storage_path ?? null;
}

export async function recordSwipe(
  swipeeId: string,
  direction: 'like' | 'pass' | 'superlike',
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');
  const { error } = await supabase.from('swipes').insert({
    swiper_id: user.id,
    swipee_id: swipeeId,
    direction,
    intent: 'date',
  });
  if (error) throw error;
}

export async function findMatchWith(otherId: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const a = user.id < otherId ? user.id : otherId;
  const b = user.id < otherId ? otherId : user.id;
  const { data } = await supabase
    .from('matches')
    .select('id')
    .eq('profile_a_id', a)
    .eq('profile_b_id', b)
    .eq('intent', 'date')
    .is('unmatched_at', null)
    .maybeSingle();
  return data?.id ?? null;
}
