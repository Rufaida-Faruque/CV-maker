import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    setError(null);
    try {
      signInWithGoogle();
    } catch {
      setError("Sign-in failed. Check Google Cloud OAuth settings.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>CV Maker</h1>
        <p>
          Personal CV editor — sign in with your Google account. Your CV is saved
          as a private file in your Google Drive (only this app can access it).
        </p>
        <p className="login-hint">
          When prompted, allow access to save your CV to Google Drive. If sign-in
          is blocked, the app owner must publish the OAuth app in Google Cloud
          Console (see PRODUCTION.md).
        </p>
        <button type="button" className="google-btn" onClick={handleLogin}>
          <GoogleIcon />
          Continue with Google
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-legal">
          <a href="/privacy.html" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          {" · "}
          <a href="/terms.html" target="_blank" rel="noreferrer">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.273 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
