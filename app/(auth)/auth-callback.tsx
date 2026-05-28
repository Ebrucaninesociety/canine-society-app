import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../design';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();

  useEffect(() => {
    if (params.access_token && params.refresh_token) {
      supabase.auth
        .setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        })
        .then(() => router.replace('/'));
    }
  }, [params, router]);

  return <View style={{ flex: 1, backgroundColor: colors.sand }} />;
}
