import { supabase } from './supabase';
import type { Gender, LookingFor, DogSize } from './onboarding';

type Input = {
  displayName: string;
  birthdate: string;
  gender: Gender;
  lookingFor: LookingFor[];
  city: string;
  country: string;
  bio: string;
  photos: { uri: string; isDog: boolean }[];
  dog: { name: string; breed: string; size: DogSize; bio: string };
};

export async function createProfileAndUploads(input: Input) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not authenticated');

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: input.displayName,
    birthdate: input.birthdate,
    gender: input.gender,
    looking_for: input.lookingFor,
    city: input.city,
    country: input.country,
    bio: input.bio || null,
  });
  if (profileError) throw profileError;

  const { error: dogError } = await supabase.from('dogs').insert({
    owner_id: user.id,
    name: input.dog.name,
    breed: input.dog.breed || null,
    size: input.dog.size,
    bio: input.dog.bio || null,
  });
  if (dogError) throw dogError;

  for (let i = 0; i < input.photos.length; i++) {
    const photo = input.photos[i];
    const filename = `${Date.now()}-${i}.jpg`;
    const path = `${user.id}/${filename}`;
    const response = await fetch(photo.uri);
    const blob = await response.blob();
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;

    const { error: photoRowError } = await supabase.from('photos').insert({
      profile_id: user.id,
      storage_path: path,
      is_primary: i === 0,
      is_dog_photo: photo.isDog,
      position: i,
    });
    if (photoRowError) throw photoRowError;
  }
}
