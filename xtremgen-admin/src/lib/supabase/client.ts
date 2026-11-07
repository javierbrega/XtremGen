const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dmbvelimtgwlvcuwnvdq.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYnZlbGltdGd3bHZjdXdudmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNjMzNTIsImV4cCI6MjEwOTYzOTM1Mn0.UrKuARxgVVYCROJEhaot8VQLJnE_44UVwkl1gLhpffg';

const STORAGE_KEY = 'xg_admin_supabase_session';

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

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
};
