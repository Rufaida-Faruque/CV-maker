import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  clearStoredAuth,
  loadStoredAuth,
  saveStoredAuth,
} from "../lib/authStorage";
import { GOOGLE_SCOPES, isGoogleConfigured } from "../lib/googleConfig";
import { fetchGoogleUser } from "../lib/googleUser";
import type { GoogleUser } from "../types/auth";

interface AuthContextValue {
  user: GoogleUser | null;
  accessToken: string | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadStoredAuth();
    if (stored) {
      setUser(stored.user);
      setAccessToken(stored.accessToken);
    }
    setLoading(false);
  }, []);

  const completeLogin = useCallback(async (token: string, expiresIn: number) => {
    const profile = await fetchGoogleUser(token);
    const auth = {
      accessToken: token,
      expiresAt: Date.now() + expiresIn * 1000,
      user: profile,
    };
    saveStoredAuth(auth);
    setAccessToken(token);
    setUser(profile);
  }, []);

  const googleLogin = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: (response) => {
      const expiresIn = response.expires_in ?? 3600;
      completeLogin(response.access_token, expiresIn).catch(() => {
        clearStoredAuth();
        setUser(null);
        setAccessToken(null);
      });
    },
    onError: () => {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
    },
  });

  const signInWithGoogle = useCallback(() => {
    googleLogin();
  }, [googleLogin]);

  const signOut = useCallback(() => {
    const token = accessToken;
    clearStoredAuth();
    setUser(null);
    setAccessToken(null);
    if (token) {
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: "POST",
        headers: { "Content-type": "application/x-www-form-urlencoded" },
      }).catch(() => undefined);
    }
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      configured: isGoogleConfigured,
      signInWithGoogle,
      signOut,
    }),
    [user, accessToken, loading, signInWithGoogle, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
