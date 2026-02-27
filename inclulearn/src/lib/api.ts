/**
 * API utility — Axios-style fetch wrapper that auto-attaches JWT and
 * points at the Express backend (http://localhost:5000).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('EduAble_token');
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const authToken = token ?? getToken();

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

/* ── Auth ─────────────────────────────────────────── */
export const authApi = {
  register: (payload: { name: string; email: string; password: string; confirmPassword: string }) =>
    request<{ token: string; user: AuthUser }>('/api/auth/register', { method: 'POST', body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/api/auth/login', { method: 'POST', body: payload }),
};

/* ── Profile ──────────────────────────────────────── */
export const profileApi = {
  create: (payload: OnboardingData) =>
    request('/api/profile/create', { method: 'POST', body: payload }),

  get: (userId: string) =>
    request(`/api/profile/${userId}`),
};

/* ── Dashboard ────────────────────────────────────── */
export const dashboardApi = {
  get: () => request('/api/dashboard'),
};

/* ── Courses ──────────────────────────────────────── */
export const coursesApi = {
  list: () => request<{ inProgress: unknown[]; completed: unknown[] }>('/api/courses'),
  progress: () => request('/api/courses/progress'),
};

/* ── Types ────────────────────────────────────────── */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
};

export type OnboardingData = {
  contactNumber: string;
  age: number | null;
  preferredLanguage: string;
  disabilityType: string[];
  accessibilityPreferences: Record<string, boolean | string>;
};
