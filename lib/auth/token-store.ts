import * as SecureStore from 'expo-secure-store';

/** Persisted auth tokens. SecureStore keeps them in the device keychain/keystore. */
export type StoredTokens = { accessToken: string; refreshToken: string; userId: string };

const ACCESS = 'strack.accessToken';
const REFRESH = 'strack.refreshToken';
const USER_ID = 'strack.userId';

export async function loadTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken, userId] = await Promise.all([
    SecureStore.getItemAsync(ACCESS),
    SecureStore.getItemAsync(REFRESH),
    SecureStore.getItemAsync(USER_ID),
  ]);
  if (accessToken && refreshToken && userId) return { accessToken, refreshToken, userId };
  return null;
}

export async function saveTokens(t: StoredTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS, t.accessToken),
    SecureStore.setItemAsync(REFRESH, t.refreshToken),
    SecureStore.setItemAsync(USER_ID, t.userId),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS),
    SecureStore.deleteItemAsync(REFRESH),
    SecureStore.deleteItemAsync(USER_ID),
  ]);
}
