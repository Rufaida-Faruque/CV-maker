import { sectionCatalog } from "../data/sectionCatalog";
import { createSectionId } from "./ids";
import { getMasterVersion } from "./cvStore";
import { ensureTheme } from "./themes";
import type {
  CustomField,
  CvSection,
  CvStore,
  CvTheme,
  CvVersion,
  HeaderData,
  PersonalDetailsData,
} from "../types/cv";
import { DEFAULT_THEME } from "../types/cv";

export const CREATE_VERSION_OPTION = "__create_new__";

export interface CopyTreeNode {
  key: string;
  label: string;
  children?: CopyTreeNode[];
}

/** Checked keys, e.g. header:givenName, personal:phone, theme, attachments, section:abc */
export type CopySelection = Set<string>;

export function emptyHeaderSection(): CvSection {
  return {
    id: createSectionId(),
    type: "header",
    title: "Header",
    column: "main",
    enabled: true,
    data: {
      givenName: "",
      familyName: "",
      headline: "",
      email: "",
    },
  };
}

export function emptyPersonalSection(): CvSection {
  const catalog = sectionCatalog.find((c) => c.type === "personalDetails");
  return {
    id: createSectionId(),
    type: "personalDetails",
    title: catalog?.title ?? "Personal details",
    column: "sidebar",
    enabled: true,
    data: structuredClone(
      catalog?.defaultData ?? {
        dateOfBirthIso: "",
        phone: "",
        address: "",
        postCode: "",
        city: "",
        linkedIn: { label: "", href: "" },
        github: { label: "", href: "" },
        customFields: [],
      },
    ) as PersonalDetailsData,
  };
}

export function getMasterPersonal(store: CvStore): CvSection {
  return store.profile.personal;
}

export function getVersionPersonal(version: CvVersion, store: CvStore): CvSection {
  return version.personalOverride ?? store.profile.personal;
}

export function buildCopyTree(store: CvStore): CopyTreeNode[] {
  const master = getMasterVersion(store);
  const personal = getMasterPersonal(store);
  const p = personal.data as PersonalDetailsData;

  const customChildren: CopyTreeNode[] = (p.customFields ?? []).map((f) => ({
    key: `personal:custom:${f.id}`,
    label: f.label.trim() || "Custom field",
  }));

  return [
    {
      key: "header",
      label: "Name & contact",
      children: [
        { key: "header:givenName", label: "Given name" },
        { key: "header:familyName", label: "Family name" },
        { key: "header:headline", label: "Job title / headline" },
        { key: "header:email", label: "Email" },
        { key: "header:photo", label: "Photo" },
      ],
    },
    {
      key: "personal",
      label: "Personal info",
      children: [
        { key: "personal:phone", label: "Phone" },
        { key: "personal:address", label: "Address" },
        { key: "personal:postCode", label: "Post code" },
        { key: "personal:city", label: "City" },
        { key: "personal:dateOfBirth", label: "Date of birth" },
        { key: "personal:linkedIn", label: "LinkedIn" },
        { key: "personal:github", label: "Github" },
        ...customChildren,
      ],
    },
    { key: "theme", label: "Look & layout (template & colors)" },
    { key: "attachments", label: "Certificates & attachments" },
    ...master.sections.map((s) => ({
      key: `section:${s.id}`,
      label: s.title.trim() || s.type,
    })),
  ];
}

export function collectDescendantKeys(node: CopyTreeNode): string[] {
  if (!node.children?.length) return [node.key];
  return node.children.flatMap(collectDescendantKeys);
}

export function isGroupFullySelected(
  node: CopyTreeNode,
  selection: CopySelection,
): boolean {
  const keys = collectDescendantKeys(node);
  return keys.length > 0 && keys.every((k) => selection.has(k));
}

export function isGroupPartiallySelected(
  node: CopyTreeNode,
  selection: CopySelection,
): boolean {
  const keys = collectDescendantKeys(node);
  const count = keys.filter((k) => selection.has(k)).length;
  return count > 0 && count < keys.length;
}

function cloneSection(section: CvSection): CvSection {
  return { ...structuredClone(section), id: createSectionId() };
}

function applyHeaderFields(
  target: HeaderData,
  source: HeaderData,
  selection: CopySelection,
): HeaderData {
  const next = { ...target };
  if (selection.has("header:givenName")) next.givenName = source.givenName;
  if (selection.has("header:familyName")) next.familyName = source.familyName;
  if (selection.has("header:headline")) next.headline = source.headline ?? "";
  if (selection.has("header:email")) next.email = source.email;
  if (selection.has("header:photo")) {
    next.photoDataUrl = source.photoDataUrl;
  }
  return next;
}

function applyPersonalFields(
  target: PersonalDetailsData,
  source: PersonalDetailsData,
  selection: CopySelection,
): PersonalDetailsData {
  const next: PersonalDetailsData = {
    ...target,
    linkedIn: { ...target.linkedIn },
    github: { ...target.github },
    customFields: [...(target.customFields ?? [])],
  };

  if (selection.has("personal:phone")) next.phone = source.phone;
  if (selection.has("personal:address")) next.address = source.address;
  if (selection.has("personal:postCode")) next.postCode = source.postCode;
  if (selection.has("personal:city")) next.city = source.city;
  if (selection.has("personal:dateOfBirth")) {
    next.dateOfBirthIso = source.dateOfBirthIso;
  }
  if (selection.has("personal:linkedIn")) {
    next.linkedIn = structuredClone(source.linkedIn);
  }
  if (selection.has("personal:github")) {
    next.github = structuredClone(source.github);
  }

  for (const field of source.customFields ?? []) {
    const key = `personal:custom:${field.id}`;
    if (!selection.has(key)) continue;
    const idx = next.customFields.findIndex((f) => f.id === field.id);
    if (idx >= 0) {
      next.customFields[idx] = structuredClone(field);
    } else {
      next.customFields.push(structuredClone(field));
    }
  }

  return next;
}

function hasAnyPrefix(selection: CopySelection, prefix: string): boolean {
  for (const key of selection) {
    if (key === prefix || key.startsWith(`${prefix}:`)) return true;
  }
  return false;
}

function selectedSectionIds(selection: CopySelection): string[] {
  return [...selection]
    .filter((k) => k.startsWith("section:"))
    .map((k) => k.slice("section:".length));
}

function mergeBodySections(
  targetSections: CvSection[],
  masterSections: CvSection[],
  selectedIds: string[],
): CvSection[] {
  const result = [...targetSections];
  for (const id of selectedIds) {
    const masterSec = masterSections.find((s) => s.id === id);
    if (!masterSec) continue;
    const clone = cloneSection(masterSec);
    const idx = result.findIndex(
      (s) => s.type === masterSec.type && s.title === masterSec.title,
    );
    if (idx >= 0) result[idx] = clone;
    else result.push(clone);
  }
  return result;
}

export function applyCopySelectionToVersion(
  version: CvVersion,
  store: CvStore,
  selection: CopySelection,
  mode: "replace" | "merge",
): CvVersion {
  const master = getMasterVersion(store);
  const masterHeader = master.header.data as HeaderData;
  const masterPersonal = getMasterPersonal(store).data as PersonalDetailsData;

  let header = version.header;
  let personalOverride = version.personalOverride;
  let theme = version.theme;
  let sections = version.sections;
  let attachments = version.attachments ?? [];

  if (mode === "replace") {
    let headerData = emptyHeaderSection().data as HeaderData;
    if (hasAnyPrefix(selection, "header")) {
      headerData = applyHeaderFields(headerData, masterHeader, selection);
    }
    header = { ...header, data: headerData };

    let personalData = emptyPersonalSection().data as PersonalDetailsData;
    if (hasAnyPrefix(selection, "personal")) {
      personalData = applyPersonalFields(
        personalData,
        masterPersonal,
        selection,
      );
    }
    personalOverride = {
      ...emptyPersonalSection(),
      id: personalOverride?.id ?? createSectionId(),
      data: personalData,
    };

    theme = selection.has("theme")
      ? structuredClone(ensureTheme(master.theme))
      : { ...DEFAULT_THEME };

    attachments = selection.has("attachments")
      ? structuredClone(master.attachments ?? [])
      : [];

    const secIds = selectedSectionIds(selection);
    sections = secIds.length
      ? master.sections.filter((s) => secIds.includes(s.id)).map(cloneSection)
      : [];
  } else {
    if (hasAnyPrefix(selection, "header")) {
      header = {
        ...header,
        data: applyHeaderFields(
          header.data as HeaderData,
          masterHeader,
          selection,
        ),
      };
    }

    if (hasAnyPrefix(selection, "personal")) {
      const base = getVersionPersonal(version, store).data as PersonalDetailsData;
      personalOverride = {
        ...(personalOverride ?? getMasterPersonal(store)),
        id: personalOverride?.id ?? createSectionId(),
        data: applyPersonalFields(base, masterPersonal, selection),
      };
    }

    if (selection.has("theme")) {
      theme = structuredClone(ensureTheme(master.theme));
    }

    if (selection.has("attachments")) {
      attachments = structuredClone(master.attachments ?? []);
    }

    const secIds = selectedSectionIds(selection);
    if (secIds.length > 0) {
      sections = mergeBodySections(sections, master.sections, secIds);
    }
  }

  return {
    ...version,
    header,
    personalOverride,
    theme,
    sections,
    attachments,
    updatedAt: new Date().toISOString(),
  };
}

export function createVersionFromMaster(
  store: CvStore,
  name: string,
  selection: CopySelection,
): CvStore {
  const blank: CvVersion = {
    id: createSectionId(),
    name: name.trim() || "New CV",
    theme: { ...DEFAULT_THEME },
    header: emptyHeaderSection(),
    sections: [],
    attachments: [],
    personalOverride: emptyPersonalSection(),
    updatedAt: new Date().toISOString(),
  };

  const filled = applyCopySelectionToVersion(blank, store, selection, "replace");

  return {
    ...store,
    versions: [...store.versions, filled],
    activeVersionId: filled.id,
  };
}

export function syncVersionFromMaster(
  store: CvStore,
  versionId: string,
  selection: CopySelection,
): CvStore {
  const version = store.versions.find((v) => v.id === versionId);
  if (!version || versionId === store.masterVersionId) return store;

  const updated = applyCopySelectionToVersion(
    version,
    store,
    selection,
    "merge",
  );

  return {
    ...store,
    versions: store.versions.map((v) => (v.id === versionId ? updated : v)),
  };
}

export function selectionHasAny(selection: CopySelection): boolean {
  return selection.size > 0;
}
