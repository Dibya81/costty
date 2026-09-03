import { api, getToken, setToken, clearToken } from "../lib/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Login failed: ${res.status}`);
  }
  const data: LoginResponse = await res.json();
  setToken(data.access_token);
  return data;
}

export async function register(email: string, password: string, fullName: string): Promise<AuthUser> {
  return api.post<AuthUser>("/api/v1/auth/register", { email, password, full_name: fullName });
}

export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>("/api/v1/auth/me");
}

export function logout(): void {
  clearToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
