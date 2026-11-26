// Thin typed client for the Pennywise REST API (/api/v1).

export type TxType = 'Income' | 'Expense';
export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank transfer';

export type User = { id: number; email: string; full_name: string; role: 'user' | 'admin'; created_at: string };
export type Category = { id: number; name: string; type: TxType; icon: string; is_system: boolean };
export type Transaction = {
  id: number; title: string; amount: number; type: TxType;
  category: { id: number; name: string; icon: string };
  payment_method: PaymentMethod; date: string; created_at: string; updated_at: string;
};
export type TransactionPage = { items: Transaction[]; total: number; page: number; page_size: number };
export type CategoryTotal = { category_id: number; name: string; icon: string; total: number; percentage: number };
export type Summary = {
  month: string; income: number; expense: number; balance: number; savings_rate: number;
  all_time_balance: number; transaction_count: number;
  top_expense_category: CategoryTotal | null; expense_by_category: CategoryTotal[];
};
export type CashflowPoint = { month: string; income: number; expense: number };
export type NewTransaction = {
  title: string; amount: number; type: TxType; category_id: number; payment_method: PaymentMethod; date: string;
};

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api/v1';
const TOKEN_KEY = 'pennywise-token';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const auth = {
  get token(): string | null { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set token(v: string | null) {
    try { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
  onUnauthorized: (() => {}) as () => void,
};

// FastAPI errors: {detail: "text"} or {detail: [{loc, msg}, ...]} for validation failures.
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { loc?: unknown[]; msg?: string }) => {
      const field = d.loc?.filter(p => p !== 'body').join('.');
      return field ? `${field}: ${d.msg}` : String(d.msg);
    }).join('; ');
  }
  return fallback;
}

async function request<T>(method: string, path: string, opts: { body?: unknown; query?: Record<string, string | number | undefined> } = {}): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined && v !== '') qs.set(k, String(v));
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}${qs.size ? `?${qs}` : ''}`, {
      method, headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // An expired/invalid session (not a failed login attempt) sends the user back to the login screen.
    if (res.status === 401 && auth.token) { auth.token = null; auth.onUnauthorized(); }
    throw new ApiError(res.status, errorMessage(data, `Request failed (${res.status})`));
  }
  return data as T;
}

type TokenResponse = { access_token: string; user: User };

export const api = {
  async login(email: string, password: string) {
    const r = await request<TokenResponse>('POST', '/auth/login', { body: { email, password } });
    auth.token = r.access_token;
    return r.user;
  },
  async register(full_name: string, email: string, password: string) {
    const r = await request<TokenResponse>('POST', '/auth/register', { body: { full_name, email, password } });
    auth.token = r.access_token;
    return r.user;
  },
  me: () => request<User>('GET', '/auth/me'),
  logout() { auth.token = null; },
  categories: () => request<Category[]>('GET', '/categories'),
  summary: (month: string) => request<Summary>('GET', '/dashboard/summary', { query: { month } }),
  cashflow: (endMonth: string, months = 6) =>
    request<{ months: CashflowPoint[] }>('GET', '/dashboard/cashflow', { query: { end_month: endMonth, months } }).then(r => r.months),
  transactions: (q: { type?: TxType; q?: string; page?: number; page_size?: number }) =>
    request<TransactionPage>('GET', '/transactions', { query: q }),
  createTransaction: (t: NewTransaction) => request<Transaction>('POST', '/transactions', { body: t }),
  updateTransaction: (id: number, t: NewTransaction) => request<Transaction>('PUT', `/transactions/${id}`, { body: t }),
  deleteTransaction: (id: number) => request<void>('DELETE', `/transactions/${id}`),
};
