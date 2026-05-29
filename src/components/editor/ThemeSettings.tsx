import { useRef } from "react";
import { COLOR_PRESETS, LAYOUT_OPTIONS } from "../../lib/themes";
import type { CvContent, CvTheme } from "../../types/cv";

interface ThemeSettingsProps {
  content: CvContent;
  onChange: (content: CvContent) => void;
}

export default function ThemeSettings({ content, onChange }: ThemeSettingsProps) {
  const contentRef = useRef(content);
  contentRef.current = content;
  const theme = content.theme;

  function patchTheme(patch: Partial<CvTheme>) {
    const current = contentRef.current;
    onChange({ ...current, theme: { ...current.theme, ...patch } });
  }

  function applyPreset(primary: string, accent: string) {
    patchTheme({ primaryColor: primary, accentColor: accent });
  }

  return (
    <div className="theme-settings">
      <label className="theme-settings__label">
        Layout
        <select
          value={theme.layout}
          onChange={(e) =>
            patchTheme({ layout: e.target.value as CvTheme["layout"] })
          }
        >
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <p className="theme-settings__hint">
        {LAYOUT_OPTIONS.find((o) => o.id === theme.layout)?.description}
      </p>

      <div className="theme-settings__colors">
        <label className="theme-settings__label">
          Primary
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => patchTheme({ primaryColor: e.target.value })}
          />
        </label>
        <label className="theme-settings__label">
          Accent
          <input
            type="color"
            value={theme.accentColor}
            onChange={(e) => patchTheme({ accentColor: e.target.value })}
          />
        </label>
      </div>

      <div className="theme-settings__presets">
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="theme-preset"
            title={p.label}
            onClick={() => applyPreset(p.primary, p.accent)}
            style={{
              background: `linear-gradient(135deg, ${p.primary} 50%, ${p.accent} 50%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
