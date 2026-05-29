import { demoCvTemplate } from "../data/demoTemplate";
import { createSectionId } from "./ids";
import { ensureTheme } from "./themes";
import { getVersionPersonal } from "./versionCopy";
import type { CvContent, CvSection, CvStore, CvVersion } from "../types/cv";

export function cloneHeader(header: CvSection): CvSection {
  return { ...structuredClone(header), id: createSectionId() };
}

export function headerFromDemo(): CvSection {
  const header = demoCvTemplate.sections.find((s) => s.type === "header");
  if (!header) throw new Error("Demo template missing header");
  return cloneHeader(header);
}

export function getBodySections(content: CvContent): CvSection[] {
  return content.sections.filter(
    (s) => s.type !== "header" && s.type !== "personalDetails",
  );
}

export function getProfileFromContent(content: CvContent) {
  const header = content.sections.find((s) => s.type === "header");
  const personal = content.sections.find((s) => s.type === "personalDetails");
  if (!header || !personal) {
    throw new Error("CV must include header and personal details");
  }
  return { header, personal };
}

export function getActiveVersion(store: CvStore): CvVersion {
  return (
    store.versions.find((v) => v.id === store.activeVersionId) ??
    store.versions[0]
  );
}

export function getMasterVersion(store: CvStore): CvVersion {
  return (
    store.versions.find((v) => v.id === store.masterVersionId) ??
    store.versions[0]
  );
}

export function isMasterVersion(store: CvStore, versionId: string): boolean {
  return versionId === store.masterVersionId;
}

function stripPersonalFromBody(sections: CvSection[]): CvSection[] {
  return sections.filter((s) => s.type !== "personalDetails");
}

export function mergeStore(store: CvStore): CvContent {
  const version = getActiveVersion(store);
  const personal = getVersionPersonal(version, store);
  const body = stripPersonalFromBody(version.sections);
  return {
    theme: version.theme,
    sections: [version.header, ...body, personal],
    attachments: version.attachments ?? [],
  };
}

export function applyContentToStore(store: CvStore, content: CvContent): CvStore {
  const { header, personal } = getProfileFromContent(content);
  const body = stripPersonalFromBody(getBodySections(content));
  const theme = ensureTheme(content.theme);
  const attachments = content.attachments ?? [];
  const now = new Date().toISOString();
  const activeId = store.activeVersionId;
  const editingMaster = isMasterVersion(store, activeId);

  const versions = store.versions.map((v) => {
    if (v.id !== activeId) return v;
    if (editingMaster) {
      return {
        ...v,
        header,
        theme,
        sections: body,
        attachments,
        updatedAt: now,
      };
    }
    return {
      ...v,
      header,
      theme,
      sections: body,
      attachments,
      personalOverride: personal,
      updatedAt: now,
    };
  });

  return {
    profile: editingMaster ? { personal } : store.profile,
    masterVersionId: store.masterVersionId,
    activeVersionId: store.activeVersionId,
    versions,
  };
}

export function switchActiveVersion(store: CvStore, versionId: string): CvStore {
  if (!store.versions.some((v) => v.id === versionId)) return store;
  return { ...store, activeVersionId: versionId };
}

export function renameVersion(
  store: CvStore,
  versionId: string,
  name: string,
): CvStore {
  return {
    ...store,
    versions: store.versions.map((v) =>
      v.id === versionId ? { ...v, name: name.trim() || v.name } : v,
    ),
  };
}

export function contentToStore(content: CvContent, versionName: string): CvStore {
  const { header, personal } = getProfileFromContent(content);
  const version: CvVersion = {
    id: createSectionId(),
    name: versionName,
    theme: ensureTheme(content.theme),
    header,
    sections: getBodySections(content),
    attachments: content.attachments ?? [],
    updatedAt: new Date().toISOString(),
  };
  return {
    profile: { personal },
    masterVersionId: version.id,
    versions: [version],
    activeVersionId: version.id,
  };
}

export {
  createVersionFromMaster,
  syncVersionFromMaster,
} from "./versionCopy";
