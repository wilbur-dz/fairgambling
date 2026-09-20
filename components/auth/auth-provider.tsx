"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

export type PendingRegistration = {
  clerkToken: string;
  clerkUserId: string;
  email: string;
  suggestedUsername: string;
  method: "email" | "oauth";
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  pendingRegistration: PendingRegistration | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string }) => Promise<void>;
  completeRegistration: (username: string) => Promise<void>;
  clearPendingRegistration: () => void;
  logout: () => Promise<void>;
  /** Dev helper: jump straight into a signed-in session. */
  loginAsDemo: () => Promise<void>;
};

const STORAGE_KEY = "fg-auth-user";
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore persistence failures
  }
}

function setAuthDataset(authenticated: boolean | null) {
  if (typeof document === "undefined") return;
  if (authenticated === null) {
    delete document.documentElement.dataset.fgAuth;
    return;
  }
  document.documentElement.dataset.fgAuth = authenticated ? "1" : "0";
}

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() || "player";
  return local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 18) || "player";
}

export function displayEmail(email?: string | null) {
  if (!email || email.endsWith("@users.fairgambling.local")) return null;
  return email;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRegistration, setPendingRegistration] =
    useState<PendingRegistration | null>(null);

  useEffect(() => {
    const stored = readStoredUser();
    setUser(stored);
    setAuthDataset(!!stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    setAuthDataset(!!user);
    writeStoredUser(user);
  }, [user, isLoading]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) {
      throw new Error("Email and password are required");
    }
    const next: AuthUser = {
      id: `user_${email}`,
      email,
      username: displayNameFromEmail(email),
      avatarUrl: null,
    };
    setPendingRegistration(null);
    setUser(next);
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string }) => {
      const email = input.email.trim().toLowerCase();
      if (!email || !input.password) {
        throw new Error("Email and password are required");
      }
      setPendingRegistration({
        clerkToken: "local-demo-token",
        clerkUserId: `clerk_${email}`,
        email,
        suggestedUsername: displayNameFromEmail(email),
        method: "email",
      });
    },
    [],
  );

  const completeRegistration = useCallback(
    async (username: string) => {
      const name = username.trim();
      if (!name) throw new Error("Username is required");
      if (!pendingRegistration) throw new Error("No pending registration");
      setUser({
        id: pendingRegistration.clerkUserId,
        email: pendingRegistration.email,
        username: name,
        avatarUrl: null,
      });
      setPendingRegistration(null);
    },
    [pendingRegistration],
  );

  const clearPendingRegistration = useCallback(() => {
    setPendingRegistration(null);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setPendingRegistration(null);
  }, []);

  const loginAsDemo = useCallback(async () => {
    setPendingRegistration(null);
    setUser({
      id: "user_demo",
      email: "demo@fairgambling.com",
      username: "DemoPlayer",
      avatarUrl: null,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      accessToken: user ? `local-${user.id}` : null,
      pendingRegistration,
      login,
      register,
      completeRegistration,
      clearPendingRegistration,
      logout,
      loginAsDemo,
    }),
    [
      user,
      isLoading,
      pendingRegistration,
      login,
      register,
      completeRegistration,
      clearPendingRegistration,
      logout,
      loginAsDemo,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
