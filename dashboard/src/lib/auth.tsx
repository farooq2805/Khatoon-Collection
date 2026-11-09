import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, TOKEN_KEY, USER_KEY } from "./api";

export type AdminUser = { id: number; email: string; firstName?: string; lastName?: string; role?: string };

type AuthState = {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function storedUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(storedUser);
  const [ready, setReady] = useState(false);

  // Validate an existing session (also shared with the classic dashboard)
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setReady(true);
      return;
    }
    api("/auth/profile")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      })
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("kc:logout", onLogout);
    return () => window.removeEventListener("kc:logout", onLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api("/auth/login", { method: "POST", body: { email, password } });
    const token = res?.data?.token;
    if (!token) throw new Error("Login failed");
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // token may already be invalid
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
