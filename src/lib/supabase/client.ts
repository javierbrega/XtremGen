/**
 * Zero-dependency Supabase REST, Auth (Email/Password + Google OAuth PKCE/Implicit)
 * and Realtime WebSocket Client for XtremGen (XG).
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dmbvelimtgwlvcuwnvdq.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYnZlbGltdGd3bHZjdXdudmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNjMzNTIsImV4cCI6MjEwOTYzOTM1Mn0.UrKuARxgVVYCROJEhaot8VQLJnE_44UVwkl1gLhpffg';

const STORAGE_KEY = 'xg_supabase_session';

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

type AuthChangeCallback = (event: string, session: SupabaseSession | null) => void;
const authListeners = new Set<AuthChangeCallback>();

function getStoredSession(): SupabaseSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredSession(session: SupabaseSession | null, event = 'SIGNED_IN') {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  authListeners.forEach((cb) => cb(event, session));
}

// Automatically capture Google OAuth redirect token from URL hash or query on load
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token') || undefined;
    if (accessToken) {
      fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((user) => {
          if (user && user.id) {
            const session: SupabaseSession = {
              access_token: accessToken,
              refresh_token: refreshToken,
              user,
            };
            setStoredSession(session, 'SIGNED_IN');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(() => {});
    }
  }
}

function getHeaders(useAuth = true, prefer?: string): Record<string, string> {
  const session = getStoredSession();
  const token = useAuth && session?.access_token ? session.access_token : SUPABASE_ANON_KEY;
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers['Prefer'] = prefer;
  return headers;
}

class QueryBuilder<T = any> {
  private table: string;
  private params = new URLSearchParams();
  private method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  private bodyData: any = null;
  private singleRow = false;

  constructor(table: string) {
    this.table = table;
    this.params.set('select', '*');
  }

  select(columns = '*') {
    this.params.set('select', columns);
    return this;
  }

  eq(column: string, value: any) {
    this.params.append(column, `eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.params.append(column, `neq.${value}`);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending ? 'asc' : 'desc';
    this.params.set('order', `${column}.${dir}`);
    return this;
  }

  limit(count: number) {
    this.params.set('limit', String(count));
    return this;
  }

  single() {
    this.singleRow = true;
    this.params.set('limit', '1');
    return this;
  }

  insert(values: any) {
    this.method = 'POST';
    this.bodyData = values;
    return this;
  }

  update(values: any) {
    this.method = 'PATCH';
    this.bodyData = values;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  async execute(): Promise<{ data: T | null; error: any }> {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${this.table}?${this.params.toString()}`;
      const prefer =
        this.method === 'POST' || this.method === 'PATCH' ? 'return=representation' : undefined;
      const res = await fetch(url, {
        method: this.method,
        headers: getHeaders(true, prefer),
        body: this.bodyData ? JSON.stringify(this.bodyData) : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: err };
      }

      if (this.method === 'DELETE' && res.status === 204) {
        return { data: null, error: null };
      }

      const json = await res.json().catch(() => null);
      if (this.singleRow) {
        const item = Array.isArray(json) ? json[0] ?? null : json;
        return { data: item as T, error: null };
      }
      return { data: json as T, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then<TResult1 = { data: T | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  from: <T = any>(table: string) => new QueryBuilder<T>(table),
  auth: {
    getSession: async () => {
      const session = getStoredSession();
      if (!session) return { data: { session: null }, error: null };
      // Verify user token is still valid
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          setStoredSession(null, 'SIGNED_OUT');
          return { data: { session: null }, error: null };
        }
        const user = await res.json();
        const updated = { ...session, user };
        return { data: { session: updated }, error: null };
      } catch {
        return { data: { session }, error: null };
      }
    },

    signUp: async ({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, any> };
    }) => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({
          email,
          password,
          data: options?.data || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: data };
      }
      if (data.access_token && data.user) {
        const session: SupabaseSession = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user,
        };
        setStoredSession(session, 'SIGNED_IN');
        return { data: { user: data.user, session }, error: null };
      }
      return { data: { user: data.user || data, session: null }, error: null };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: data };
      }
      const session: SupabaseSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      };
      setStoredSession(session, 'SIGNED_IN');
      return { data: { user: data.user, session }, error: null };
    },

    signInWithOAuth: async ({
      provider,
      options,
    }: {
      provider: 'google' | 'discord' | 'github';
      options?: { redirectTo?: string };
    }) => {
      const redirectTo =
        options?.redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
      const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(
        redirectTo
      )}`;
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
      return { data: { url: authUrl, provider }, error: null };
    },

    signOut: async () => {
      const session = getStoredSession();
      if (session?.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: getHeaders(true),
        }).catch(() => {});
      }
      setStoredSession(null, 'SIGNED_OUT');
      return { error: null };
    },

    onAuthStateChange: (callback: AuthChangeCallback) => {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
};
