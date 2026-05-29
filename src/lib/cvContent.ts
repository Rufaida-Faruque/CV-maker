import { DEFAULT_THEME } from "../types/cv";
import type { CvContent, CvSection, CvTheme } from "../types/cv";

export function parseCvContent(raw: unknown): CvContent {
  if (!raw || typeof raw !== "object") {
    return { sections: [], theme: { ...DEFAULT_THEME } };
  }
  const obj = raw as { sections?: unknown; theme?: CvTheme };
  const sections = Array.isArray(obj.sections) ? (obj.sections as CvSection[]) : [];
  return {
    sections,
    theme: obj.theme ?? { ...DEFAULT_THEME },
  };
}

export function getHeaderSection(content: CvContent) {
  return content.sections.find((s) => s.type === "header" && s.enabled);
}

export function getPersonalSection(content: CvContent) {
  return content.sections.find(
    (s) => s.type === "personalDetails" && s.enabled,
  );
}

export function getEnabledSections(content: CvContent, column: "main" | "sidebar") {
  return content.sections.filter(
    (s) =>
      s.enabled &&
      s.type !== "header" &&
      s.type !== "personalDetails" &&
      s.column === column,
  );
}
