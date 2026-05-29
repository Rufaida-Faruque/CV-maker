import type { CvSection } from "../types/cv";

export function getMovableSections(sections: CvSection[]): CvSection[] {
  return sections.filter(
    (s) => s.type !== "header" && s.type !== "personalDetails",
  );
}

export function reorderMovableSections(
  sections: CvSection[],
  dragId: string,
  targetId: string,
): CvSection[] {
  const header = sections.filter((s) => s.type === "header");
  const personal = sections.filter((s) => s.type === "personalDetails");
  const middle = getMovableSections(sections);
  const from = middle.findIndex((s) => s.id === dragId);
  const to = middle.findIndex((s) => s.id === targetId);
  if (from < 0 || to < 0 || from === to) return sections;
  const next = [...middle];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return [...header, ...next, ...personal];
}
