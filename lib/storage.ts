// src/lib/storage.ts

const TOKEN_KEY = "token";
const USERNAME_KEY = "username";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem(USERNAME_KEY);
  if (!u || u === "null" || u === "undefined") return null;
  return u;
}

export function setStoredUsername(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERNAME_KEY, email);
}

export function clearStoredUsername() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USERNAME_KEY);
}
