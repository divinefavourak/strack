import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/lib/config';
import { type ApiErrorBody } from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Auth handlers are registered by the AuthProvider at startup. Keeping them as
 * module-level callbacks lets the client read the current token and trigger a
 * refresh without importing the auth context (avoids a circular dependency).
 */
type AuthHandlers = {
  getAccessToken: () => string | null;
  refreshTokens: () => Promise<string | null>;
};
let handlers: AuthHandlers = {
  getAccessToken: () => null,
  refreshTokens: async () => null,
};
export function setAuthHandlers(h: AuthHandlers) {
  handlers = h;
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshInFlight: Promise<string | null> | null = null;
function refreshOnce() {
  if (!refreshInFlight) {
    refreshInFlight = handlers.refreshTokens().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

type RequestOptions = {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Set false for the auth endpoints that must not carry a stale token. */
  auth?: boolean;
  /** Pre-built body (e.g. FormData); skips JSON serialization. */
  rawBody?: BodyInit;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(API_BASE_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // non-JSON error body
  }
  return res.statusText || `Request failed (${res.status})`;
}

async function send(method: string, path: string, opts: RequestOptions, retrying = false): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const token = handlers.getAccessToken();
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.rawBody ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  // On 401 for an authed request, refresh once and retry. If the refresh fails
  // the request simply returns the 401; refreshTokens() has already decided
  // whether the session is dead (and wiped it) or the failure was transient.
  if (res.status === 401 && opts.auth !== false && !retrying) {
    const newToken = await refreshOnce();
    if (newToken) return send(method, path, opts, true);
  }
  return res;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await send(method, path, opts);
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
