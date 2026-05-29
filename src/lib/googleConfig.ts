export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export const isGoogleConfigured = Boolean(GOOGLE_CLIENT_ID);

/**
 * Per-file access for files this app creates (works in OAuth Testing mode).
 * https://www.googleapis.com/auth/drive.appdata is restricted and often 403 until verified.
 */
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  DRIVE_SCOPE,
].join(" ");

export const CV_DRIVE_FILENAME = "cv-maker.json";
