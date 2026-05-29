import { contentToStore, headerFromDemo } from "./cvStore";
import { normalizeCvContent } from "./normalizeContent";
import { parseCvContent } from "./cvContent";
import { ensureTheme } from "./themes";
import type { CvSection, CvStore, CvVersion } from "../types/cv";
import { DEFAULT_THEME } from "../types/cv";

function normalizeHeaderSection(
  header: CvSection,
  theme = DEFAULT_THEME,
): CvSection {
  return normalizeCvContent({
    sections: [header],
    theme,
  }).sections[0];
}

function normalizePersonalSection(
  personal: CvSection,
  theme = DEFAULT_THEME,
): CvSection {
  return normalizeCvContent({
    sections: [personal],
    theme,
  }).sections[0];
}

function normalizeBodySections(
  sections: CvVersion["sections"],
  theme = DEFAULT_THEME,
) {
  return normalizeCvContent({ sections, theme }).sections.filter(
    (s) => s.type !== "header" && s.type !== "personalDetails",
  );
}

function migrateLegacyProfile(store: CvStore & {
  profile: { header?: CvSection; personal: CvSection };
}): CvStore {
  const legacyHeader = store.profile.header;
  const personal = store.profile.personal;
  const masterId =
    store.masterVersionId &&
    store.versions.some((v) => v.id === store.masterVersionId)
      ? store.masterVersionId
      : store.versions[0]?.id;

  const versions = store.versions.map((v) => {
    const vExt = v as CvVersion & { header?: CvSection };
    const header =
      vExt.header ??
      (legacyHeader
        ? structuredClone(legacyHeader)
        : headerFromDemo());
    return {
      ...v,
      header: normalizeHeaderSection(header, v.theme),
      sections: normalizeBodySections(v.sections, v.theme),
    };
  });

  return {
    profile: { personal: normalizePersonalSection(personal) },
    masterVersionId: masterId,
    activeVersionId: store.activeVersionId,
    versions,
  };
}

function isCvStore(raw: unknown): raw is CvStore {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as CvStore & {
    profile?: { personal?: CvSection; header?: CvSection };
  };
  return (
    Boolean(o.profile?.personal) &&
    Array.isArray(o.versions) &&
    o.versions.length > 0 &&
    Boolean(o.activeVersionId)
  );
}

/** Accept legacy single-CV file or new multi-version store */
export function parseAndNormalizeStore(raw: unknown): CvStore {
  if (isCvStore(raw)) {
    const store = migrateLegacyProfile(raw as CvStore & {
      profile: { header?: CvSection; personal: CvSection };
    });
    const fallbackTheme =
      store.versions.find((v) => v.id === store.activeVersionId)?.theme ??
      store.versions[0]?.theme ??
      DEFAULT_THEME;

    return {
      activeVersionId: store.versions.some((v) => v.id === store.activeVersionId)
        ? store.activeVersionId
        : store.versions[0].id,
      masterVersionId: store.versions.some(
        (v) => v.id === store.masterVersionId,
      )
        ? store.masterVersionId
        : store.versions[0].id,
      profile: {
        personal: normalizePersonalSection(
          store.profile.personal,
          fallbackTheme,
        ),
      },
      versions: store.versions.map((v) => ({
        ...v,
        theme: ensureTheme(v.theme),
        header: normalizeHeaderSection(v.header, v.theme),
        sections: normalizeBodySections(v.sections, v.theme),
        attachments: v.attachments ?? [],
        personalOverride: v.personalOverride,
      })),
    };
  }

  const content = normalizeCvContent(parseCvContent(raw));
  return contentToStore(content, "My CV");
}
