import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { GOOGLE_CLIENT_IDS, GOOGLE_CONFIGURED } from '@/lib/config';
import { useAuth } from './auth-context';

type GoogleAuth = { available: boolean; signIn: () => void };

/**
 * Google sign-in (scaffolded). expo-auth-session's `useIdTokenAuthRequest`
 * throws if the current platform's client ID is missing, so we must not call it
 * until Google is configured. `GOOGLE_CONFIGURED` is a build-time constant, so
 * selecting the real vs. stub hook at module load keeps hook order stable.
 */
function useGoogleAuthStub(): GoogleAuth {
  return {
    available: false,
    signIn: () =>
      Alert.alert(
        'Google sign-in',
        'Google sign-in isn’t configured yet. Add your client IDs in app.json → extra.google.',
      ),
  };
}

function useGoogleAuthReal(): GoogleAuth {
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

  return { available: !!request, signIn: () => promptAsync() };
}

export const useGoogleAuth: () => GoogleAuth = GOOGLE_CONFIGURED
  ? useGoogleAuthReal
  : useGoogleAuthStub;
