import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useSession } from './session';

export type MyProfile = {
  id: string;
  display_name: string;
  birthdate: string;
  city: string;
  country: string;
  bio: string | null;
  language_pref: 'en' | 'de';
};

export type MyDog = { id: string; name: string; breed: string | null; size: string; bio: string | null };

export function useMe() {
  const { session } = useSession();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [dog, setDog] = useState<MyDog | null>(null);
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setDog(null);
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: d }, { data: photo }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('dogs')
          .select('id, name, breed, size, bio')
          .eq('owner_id', userId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('photos')
          .select('storage_path')
          .eq('profile_id', userId)
          .eq('is_primary', true)
          .maybeSingle(),
      ]);
      if (!alive) return;
      setProfile(p as MyProfile | null);
      setDog(d as MyDog | null);
      setPrimaryPhoto(photo?.storage_path ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return { profile, dog, primaryPhoto, loading };
}
