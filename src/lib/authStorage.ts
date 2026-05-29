import type { StoredAuth } from "../types/auth";

const STORAGE_KEY = "cv_maker_auth";

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.accessToken || !parsed.user?.id) return null;
    if (Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
