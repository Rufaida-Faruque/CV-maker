import { CV_DRIVE_FILENAME } from "../lib/googleConfig";
import { defaultCvForUser } from "../lib/userDefaults";
import { contentToStore } from "../lib/cvStore";
import { parseAndNormalizeStore } from "../lib/normalizeStore";
import type { GoogleUser } from "../types/auth";
import type { CvRecord, CvStore } from "../types/cv";

const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

async function driveFetch(
  accessToken: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
}

async function parseDriveError(res: Response, action: string): Promise<never> {
  let detail = "";
  try {
    const body = (await res.json()) as {
      error?: { message?: string; errors?: { reason?: string }[] };
    };
    detail = body.error?.message ?? "";
    const reason = body.error?.errors?.[0]?.reason;
    if (reason) detail += ` (${reason})`;
  } catch {
    /* ignore */
  }

  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (res.status === 403) {
    throw new Error(
      `DRIVE_FORBIDDEN: ${action}${detail ? ` — ${detail}` : ""}. Sign out, enable Google Drive API, add the Drive scope on the OAuth consent screen, then sign in again.`,
    );
  }
  throw new Error(`${action} failed (${res.status})${detail ? `: ${detail}` : ""}`);
}

async function findCvFile(accessToken: string): Promise<DriveFile | null> {
  const q = encodeURIComponent(
    `name='${CV_DRIVE_FILENAME}' and trashed=false`,
  );
  const url = `${DRIVE_FILES}?q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`;
  const res = await driveFetch(accessToken, url);
  if (!res.ok) await parseDriveError(res, "Drive list");
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0] ?? null;
}

async function downloadStore(
  accessToken: string,
  fileId: string,
): Promise<CvStore> {
  const res = await driveFetch(
    accessToken,
    `${DRIVE_FILES}/${fileId}?alt=media`,
  );
  if (!res.ok) await parseDriveError(res, "Drive download");
  const json = await res.json();
  return parseAndNormalizeStore(json);
}

async function createCvFile(
  accessToken: string,
  store: CvStore,
): Promise<DriveFile> {
  const metadata = {
    name: CV_DRIVE_FILENAME,
    mimeType: "application/json",
    appProperties: { cvMaker: "true" },
  };

  const boundary = `cv_boundary_${Date.now()}`;
  const body =
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(store)}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(
    accessToken,
    `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,name,modifiedTime`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );

  if (!res.ok) await parseDriveError(res, "Drive create");
  return (await res.json()) as DriveFile;
}

async function updateCvFile(
  accessToken: string,
  fileId: string,
  store: CvStore,
): Promise<DriveFile> {
  const res = await driveFetch(
    accessToken,
    `${DRIVE_UPLOAD}/${fileId}?uploadType=media&fields=id,name,modifiedTime`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(store),
    },
  );

  if (!res.ok) await parseDriveError(res, "Drive update");
  return (await res.json()) as DriveFile;
}

function toRecord(file: DriveFile, store: CvStore): CvRecord {
  return {
    fileId: file.id,
    store,
    updatedAt: file.modifiedTime ?? new Date().toISOString(),
  };
}

export async function loadOrCreateCv(
  accessToken: string,
  user: GoogleUser,
): Promise<CvRecord> {
  const existing = await findCvFile(accessToken);

  if (existing) {
    const store = await downloadStore(accessToken, existing.id);
    return toRecord(existing, store);
  }

  const initial = contentToStore(defaultCvForUser(user), "My CV");
  const created = await createCvFile(accessToken, initial);
  const store = await downloadStore(accessToken, created.id);
  return toRecord(created, store);
}

export async function saveCv(
  accessToken: string,
  fileId: string,
  store: CvStore,
): Promise<CvRecord> {
  const updated = await updateCvFile(accessToken, fileId, store);
  return toRecord(updated, store);
}
