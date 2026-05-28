import { supabase } from './supabase';

export async function signInWithApple(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: idToken });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: 'caninesociety://auth-callback' },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
