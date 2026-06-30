import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { GOOGLE_CLIENT_IDS, GOOGLE_CONFIGURED } from '@/lib/config';
import { useAuth } from './auth-context';

/**
 * Google sign-in (scaffolded). Wires the button to expo-auth-session's Google
 * id_token flow; until real client IDs are added to config/app.json it stays
 * disabled and explains itself instead of failing. When configured, a
 * successful prompt yields an id_token that we exchange via POST /auth/google.
 */
export function useGoogleAuth() {
  const { signInWithGoogle } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) signInWithGoogle(idToken).catch(() => {});
    }
  }, [response]);

  const available = GOOGLE_CONFIGURED && !!request;

  return {
    available,
    signIn: () => {
      if (!available) {
        Alert.alert('Google sign-in', 'Google sign-in isn’t configured yet. Add your client IDs in lib/config.ts.');
        return;
      }
      promptAsync();
    },
  };
}
