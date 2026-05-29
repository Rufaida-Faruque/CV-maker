import { createSectionId } from "./ids";
import type { AttachmentKind, CvAttachment } from "../types/cv";

export const MAX_ATTACHMENTS = 12;
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

const ACCEPTED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function classifyAttachment(mimeType: string): AttachmentKind {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function fileToAttachment(
  file: File,
  label?: string,
): Promise<CvAttachment> {
  if (!ACCEPTED_MIME.has(file.type)) {
    throw new Error(
      "Use PDF, JPEG, PNG, WebP, or GIF files for certificates.",
    );
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Each file must be under ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`,
    );
  }

  const dataUrl = await readFileAsDataUrl(file);
  return {
    id: createSectionId(),
    label: label?.trim() || file.name.replace(/\.[^.]+$/, ""),
    fileName: file.name,
    mimeType: file.type,
    kind: classifyAttachment(file.type),
    dataUrl,
    sizeBytes: file.size,
  };
}

/** Skill bar level from "Skill | 4" or "Skill — 4" (1–5) */
export function parseSkillLevel(item: string): { name: string; level: number } {
  const pipe = item.split(/\s*[|—–-]\s*/);
  if (pipe.length >= 2) {
    const level = Number.parseInt(pipe[pipe.length - 1].trim(), 10);
    if (level >= 1 && level <= 5) {
      return {
        name: pipe.slice(0, -1).join(" — ").trim(),
        level,
      };
    }
  }
  return { name: item.trim(), level: 4 };
}
