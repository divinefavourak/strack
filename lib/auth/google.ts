import { useCallback } from 'react';
import { Alert } from 'react-native';

import { GOOGLE_CLIENT_IDS, GOOGLE_CONFIGURED } from '@/lib/config';
import { useAuth } from './auth-context';

type GoogleAuth = { available: boolean; signIn: () => void };

/**
 * Native Google sign-in via the platform account picker (no browser redirect).
 *
 * We configure with `webClientId` so Google mints an `id_token` whose audience
 * is the *web* client ID — that's exactly what the backend verifies against, and
 * it's why this works where the browser-based `expo-auth-session` code flow did
 * not (that flow returned a token scoped to the Android client ID).
 *
 * The `@react-native-google-signin` package is a third-party native module that
 * is NOT present in Expo Go, nor in a dev client built before it was added.
 * Importing it at the top level eagerly runs `getEnforcing('RNGoogleSignin')`,
 * which throws and crashes the whole app on load. So we load it lazily behind a
 * guarded require and degrade to a friendly message when it isn't in the binary.
 */
type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

let cachedModule: GoogleSigninModule | null | undefined;
function getGoogleModule(): GoogleSigninModule | null {
  if (cachedModule === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cachedModule = require('@react-native-google-signin/google-signin');
    } catch {
      // Native module missing (Expo Go / stale dev client).
      cachedModule = null;
    }
  }
  return cachedModule ?? null;
}

// `configure` is idempotent; run it once, lazily, on first use.
let configured = false;
function ensureConfigured(mod: GoogleSigninModule) {
  if (configured) return;
  mod.GoogleSignin.configure({
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    scopes: ['profile', 'email'],
    // We only need the id_token for backend verification, not offline/refresh.
    offlineAccess: false,
  });
  configured = true;
}

function unavailableAlert() {
  Alert.alert(
    'Google sign-in',
    'Google sign-in needs a development build (it isn’t available in Expo Go). Use email sign-in here, or install a dev build / APK.',
  );
}

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

  const signIn = useCallback(async () => {
    const mod = getGoogleModule();
    if (!mod) {
      unavailableAlert();
      return;
    }
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = mod;
    try {
      ensureConfigured(mod);
      // Surfaces the "update Google Play services" dialog on Android when stale.
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return; // user dismissed the picker

      const idToken = response.data.idToken;
      if (!idToken) {
        Alert.alert(
          'Google sign-in',
          'Google didn’t return an ID token. Make sure a Web client ID is set in app.json → extra.google.',
        );
        return;
      }
      await signInWithGoogle(idToken);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          // In-flight request or a user cancel on older lib versions — ignore.
          case statusCodes.IN_PROGRESS:
          case statusCodes.SIGN_IN_CANCELLED:
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Google sign-in',
              'Google Play services is unavailable or out of date on this device.',
            );
            return;
        }
      }
      Alert.alert('Google sign-in', 'Sign-in failed. Please try again.');
    }
  }, [signInWithGoogle]);

  return { available: true, signIn };
}

export const useGoogleAuth: () => GoogleAuth = GOOGLE_CONFIGURED
  ? useGoogleAuthReal
  : useGoogleAuthStub;
