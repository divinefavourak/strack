import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ApiError, setAuthHandlers } from '@/lib/api/client';
import { authApi, usersApi } from '@/lib/api/endpoints';
import { type TokenResponse, type UserRead } from '@/lib/api/types';
import { clearTokens, loadTokens, saveTokens, type StoredTokens } from './token-store';

type Status = 'loading' | 'authed' | 'guest';

type AuthContextValue = {
  status: Status;
  user: UserRead | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Refetch /users/me (e.g. after onboarding writes). */
  refreshUser: () => Promise<UserRead | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<UserRead | null>(null);
  // Tokens live in a ref so the api client always reads the latest synchronously.
  const tokens = useRef<StoredTokens | null>(null);

  // Register token getter + refresh with the api client once.
  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => tokens.current?.accessToken ?? null,
      refreshTokens: async () => {
        const current = tokens.current;
        if (!current) return null;
        try {
          const res = await authApi.refresh(current.refreshToken);
          await persist(res);
          return res.access_token;
        } catch {
          await wipe();
          return null;
        }
      },
      onAuthExpired: () => {
        wipe();
      },
    });
  }, []);

  async function persist(res: TokenResponse) {
    const stored: StoredTokens = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      userId: res.user_id,
    };
    tokens.current = stored;
    await saveTokens(stored);
  }

  async function wipe() {
    tokens.current = null;
    await clearTokens();
    setUser(null);
    setStatus('guest');
  }

  async function hydrateUser() {
    const me = await usersApi.me();
    setUser(me);
    setStatus('authed');
    return me;
  }

  // Boot: restore session from SecureStore.
  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (!stored) {
        setStatus('guest');
        return;
      }
      tokens.current = stored;
      try {
        await hydrateUser();
      } catch (err) {
        // Only sign the user out on a *genuine* auth failure. `/users/me` returns
        // 401/403 only after the client already tried (and failed) to refresh, so
        // reaching here with one of those means the session is truly dead.
        //
        // Any other failure — offline, request timeout, or a cold-started backend
        // 5xx — is transient. Wiping tokens there is exactly what logged people out
        // every time they reopened the app. Keep the session and let React Query
        // re-fetch the profile once connectivity returns.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          await wipe();
        } else {
          setStatus('authed');
        }
      }
    })();
  }, []);

  async function authenticate(res: TokenResponse) {
    await persist(res);
    await hydrateUser();
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: async (email, password) => authenticate(await authApi.login({ email, password })),
      signUp: async (email, password) => authenticate(await authApi.register({ email, password })),
      signInWithGoogle: async (idToken) => authenticate(await authApi.google({ id_token: idToken })),
      signOut: async () => {
        try {
          await authApi.logout();
        } catch {
          // best-effort; clear locally regardless
        }
        await wipe();
      },
      refreshUser: async () => {
        try {
          return await hydrateUser();
        } catch {
          return null;
        }
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
