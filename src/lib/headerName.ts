import type { HeaderData } from "../types/cv";

export function buildFullName(givenName: string, familyName: string): string {
  return [givenName.trim(), familyName.trim()].filter(Boolean).join(" ");
}

export function splitFullName(name: string): Pick<HeaderData, "givenName" | "familyName"> {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return { givenName: "", familyName: "" };
  if (parts.length === 1) return { givenName: parts[0], familyName: "" };
  return {
    givenName: parts[0],
    familyName: parts.slice(1).join(" "),
  };
}

export function displayName(data: HeaderData): string {
  return buildFullName(data.givenName, data.familyName);
}
