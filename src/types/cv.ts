export type SectionType =
  | "header"
  | "education"
  | "bulletList"
  | "text"
  | "projects"
  | "personalDetails";

export type SectionColumn = "main" | "sidebar";

export type CvLayoutId =
  | "classic"
  | "european"
  | "modern"
  | "professional"
  | "creative";

export type AttachmentKind = "image" | "pdf" | "other";

export interface CvAttachment {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  kind: AttachmentKind;
  dataUrl: string;
  sizeBytes: number;
}

export interface CvTheme {
  layout: CvLayoutId;
  primaryColor: string;
  accentColor: string;
}

export interface HeaderData {
  givenName: string;
  familyName: string;
  /** Job title shown on sidebar / creative layouts */
  headline?: string;
  email: string;
  photoDataUrl?: string;
}

export interface EducationData {
  degree: string;
  institution: string;
  period: string;
}

export interface BulletListData {
  items: string[];
}

export interface TextData {
  body: string;
}

export interface ProjectItem {
  name: string;
  url: string;
}

export interface ProjectsData {
  items: ProjectItem[];
}

export interface LinkField {
  label: string;
  href: string;
}

/** User-defined row in personal details (nationality, website, etc.) */
export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface PersonalDetailsData {
  dateOfBirthIso: string;
  phone: string;
  address: string;
  postCode: string;
  city: string;
  linkedIn: LinkField;
  github: LinkField;
  customFields: CustomField[];
}

export type SectionData =
  | HeaderData
  | EducationData
  | BulletListData
  | TextData
  | ProjectsData
  | PersonalDetailsData;

export interface CvSection {
  id: string;
  type: SectionType;
  title: string;
  column: SectionColumn;
  enabled: boolean;
  data: SectionData;
}

/** Merged view for editor + preview */
export interface CvContent {
  sections: CvSection[];
  theme: CvTheme;
  attachments?: CvAttachment[];
}

export interface CvVersion {
  id: string;
  name: string;
  theme: CvTheme;
  /** Name, email, photo — unique per version */
  header: CvSection;
  /** Body sections (education, experience, etc.) */
  sections: CvSection[];
  /** Per-version personal details; falls back to shared profile when unset */
  personalOverride?: CvSection;
  /** Certificates and other files appended when downloading PDF */
  attachments?: CvAttachment[];
  updatedAt: string;
}

/** Shared across all CV versions */
export interface CvProfile {
  personal: CvSection;
}

export interface CvStore {
  profile: CvProfile;
  /** Source version for synced copies */
  masterVersionId: string;
  versions: CvVersion[];
  activeVersionId: string;
}

export interface CvRecord {
  fileId: string;
  store: CvStore;
  updatedAt: string;
}

export interface SectionCatalogItem {
  type: SectionType;
  title: string;
  column: SectionColumn;
  defaultData: SectionData;
}

export const DEFAULT_THEME: CvTheme = {
  layout: "classic",
  primaryColor: "#424d61",
  accentColor: "#6b7a8f",
};
