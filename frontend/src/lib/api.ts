/**
 * Central API client for all HTTP communication with the FastAPI backend.
 *
 * The base URL is read from VITE_API_URL (defaulting to localhost:8000).
 * Every request is authenticated with the Bearer token stored in localStorage.
 * Unauthorized (401) responses clear the token and redirect to /login.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "folio_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    return Promise.reject(new Error("Unauthorized"));
  }
  if (res.status === 403) {
    return Promise.reject(new Error("Forbidden"));
  }
  if (!res.ok) {
    return res.json().then(
      (body) => Promise.reject(new Error(body?.detail ?? `Request failed: ${res.status}`)),
      () => Promise.reject(new Error(`Request failed: ${res.status}`))
    );
  }
  if (res.status === 204) return Promise.resolve(undefined as T);
  return res.json() as Promise<T>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: getHeaders(extraHeaders),
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, opts);
  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),

  // Form-data upload (multipart/form-data)
  upload: <T>(path: string, form: FormData) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
      body: form,
    }).then(handleResponse<T>),
};
