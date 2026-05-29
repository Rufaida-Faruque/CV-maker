import type { LinkField } from "../types/cv";

export function normalizeHref(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

export function linkFieldIsEmpty(field: LinkField | undefined): boolean {
  if (!field) return true;
  return !field.href.trim() && !field.label.trim();
}

export function normalizeLinkField(field?: LinkField): LinkField {
  if (linkFieldIsEmpty(field)) return { label: "", href: "" };
  const f = field!;
  return {
    href: f.href.trim(),
    label: f.label.trim(),
  };
}

export function linkDisplay(field: LinkField): string {
  if (linkFieldIsEmpty(field)) return "";
  return field.label.trim() || field.href.replace(/^https?:\/\//, "");
}

export function patchLinkField(_field: LinkField, raw: string): LinkField {
  const v = raw.trim();
  if (!v) return { label: "", href: "" };
  const href = normalizeHref(v);
  return {
    href,
    label: v.replace(/^https?:\/\//, "") || v,
  };
}
