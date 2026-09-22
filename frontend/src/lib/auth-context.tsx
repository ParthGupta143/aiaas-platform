"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, ApiError } from "./api";

interface User {
  id: string;
  email: string;
  org_id: string;
  role: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (organizationName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndSetUser = useCallback(async (accessToken: string) => {
    const me = await api.get<User>("/auth/me", accessToken);
    setUser(me);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ access_token: string }>("/auth/login", { email, password });
      setToken(res.access_token);
      await fetchAndSetUser(res.access_token);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndSetUser]);

  const register = useCallback(async (organizationName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ access_token: string }>("/auth/register", {
        organization_name: organizationName,
        email,
        password,
      });
      setToken(res.access_token);
      await fetchAndSetUser(res.access_token);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndSetUser]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

return (
  <AuthContext.Provider
    value={{ token, user, isLoading, login, register, logout }}
  >
    {children}
  </AuthContext.Provider>
);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };