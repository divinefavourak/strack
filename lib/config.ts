/**
 * App configuration. The API base URL and Google OAuth client IDs can be
 * overridden via `expo.extra` in app.json; sensible defaults live here.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const API_BASE_URL =
  (extra.apiBaseUrl as string) ?? 'https://strack-api-zyaa.onrender.com/api/v1';

/**
 * Google OAuth client IDs. Fill these in (here or via app.json `extra.google`)
 * to enable Google sign-in — until then the button surfaces a "not configured"
 * message rather than failing silently.
 */
const google = (extra.google ?? {}) as Record<string, string>;
export const GOOGLE_CLIENT_IDS = {
  ios: google.iosClientId ?? '',
  android: google.androidClientId ?? '',
  web: google.webClientId ?? '',
};

export const GOOGLE_CONFIGURED = Boolean(
  GOOGLE_CLIENT_IDS.ios || GOOGLE_CLIENT_IDS.android || GOOGLE_CLIENT_IDS.web,
);

/** Render free tier can cold-start; give the first requests room to breathe. */
export const REQUEST_TIMEOUT_MS = 30000;
