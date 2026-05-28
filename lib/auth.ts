import * as Linking from 'expo-linking';
import { supabase } from './supabase';

export async function signInWithApple(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: idToken });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string) {
  const redirectTo = Linking.createURL('/auth-callback');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signInWithEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
