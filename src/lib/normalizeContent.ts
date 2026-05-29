import { createSectionId } from "./ids";
import { toIsoDate } from "./dateFormat";
import { splitFullName } from "./headerName";
import { ensureTheme } from "./themes";
import type {
  CvContent,
  CvSection,
  CustomField,
  HeaderData,
  PersonalDetailsData,
} from "../types/cv";

function normalizeHeader(section: CvSection): CvSection {
  const d = section.data as HeaderData & { name?: string };
  let givenName = d.givenName ?? "";
  let familyName = d.familyName ?? "";
  if (!givenName && !familyName && d.name) {
    const split = splitFullName(d.name);
    givenName = split.givenName;
    familyName = split.familyName;
  }
  return {
    ...section,
    data: {
      givenName,
      familyName,
      headline: d.headline ?? "",
      email: d.email ?? "",
      photoDataUrl: d.photoDataUrl,
    },
  };
}

function migrateLegacyLinks(
  d: PersonalDetailsData & {
    extraLinks?: { id: string; label: string; href: string }[];
  },
): CustomField[] {
  if (d.customFields?.length) return d.customFields;
  const legacy = d.extraLinks ?? [];
  return legacy.map((link) => ({
    id: link.id || createSectionId(),
    label: link.label || "Link",
    value: link.href || link.label,
  }));
}

function normalizePersonal(section: CvSection): CvSection {
  const d = section.data as PersonalDetailsData & {
    dateOfBirth?: string;
    dateOfBirthIso?: string;
    extraLinks?: { id: string; label: string; href: string }[];
  };
  const legacyDob = d.dateOfBirth ?? "";
  const iso =
    d.dateOfBirthIso && /^\d{4}-\d{2}-\d{2}$/.test(d.dateOfBirthIso)
      ? d.dateOfBirthIso
      : toIsoDate(legacyDob);

  return {
    ...section,
    data: {
      dateOfBirthIso: iso,
      phone: d.phone ?? "",
      address: d.address ?? "",
      postCode: d.postCode ?? "",
      city: d.city ?? "",
      linkedIn: d.linkedIn ?? { label: "", href: "" },
      github: d.github ?? { label: "", href: "" },
      customFields: migrateLegacyLinks(d),
    },
  };
}

export function normalizeCvContent(raw: CvContent): CvContent {
  const sections = (raw.sections ?? []).map((s) => {
    if (s.type === "header") return normalizeHeader(s);
    if (s.type === "personalDetails") return normalizePersonal(s);
    return s;
  });

  return {
    theme: ensureTheme(raw.theme),
    sections,
  };
}
