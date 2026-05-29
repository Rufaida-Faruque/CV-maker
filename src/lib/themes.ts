import type { CvLayoutId, CvTheme } from "../types/cv";
import { DEFAULT_THEME } from "../types/cv";

export interface LayoutOption {
  id: CvLayoutId;
  label: string;
  description: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Two columns — main content and sidebar (demo style)",
  },
  {
    id: "european",
    label: "European",
    description: "Photo and name header, single flowing column",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Bold accent bar, clean sans-serif feel",
  },
  {
    id: "professional",
    label: "Professional sidebar",
    description: "Dark left sidebar with name, dates beside work history",
  },
  {
    id: "creative",
    label: "Creative timeline",
    description: "Photo sidebar, vertical timeline, skill bars",
  },
];

const VALID_LAYOUTS = new Set<CvLayoutId>([
  "classic",
  "european",
  "modern",
  "professional",
  "creative",
]);

export const COLOR_PRESETS = [
  { label: "Slate", primary: "#424d61", accent: "#6b7a8f" },
  { label: "Navy", primary: "#1e3a5f", accent: "#4a6fa5" },
  { label: "Forest", primary: "#2d4a3e", accent: "#5a8f7b" },
  { label: "Burgundy", primary: "#5c2e3e", accent: "#9e5a73" },
  { label: "Charcoal", primary: "#2d2d2d", accent: "#666666" },
];

export function ensureTheme(theme?: Partial<CvTheme>): CvTheme {
  const layout =
    theme?.layout && VALID_LAYOUTS.has(theme.layout)
      ? theme.layout
      : DEFAULT_THEME.layout;
  return {
    layout,
    primaryColor: theme?.primaryColor ?? DEFAULT_THEME.primaryColor,
    accentColor: theme?.accentColor ?? DEFAULT_THEME.accentColor,
  };
}

// Fix React.CSSProperties without importing React in lib - use Record
export function themeToCssVars(theme: CvTheme): Record<string, string> {
  return {
    "--cv-primary": theme.primaryColor,
    "--cv-accent": theme.accentColor,
  };
}
