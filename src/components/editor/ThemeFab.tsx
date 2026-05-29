import { useEffect, useRef, useState } from "react";
import type { CvContent } from "../../types/cv";
import ThemeSettings from "./ThemeSettings";

interface ThemeFabProps {
  content: CvContent;
  onChange: (content: CvContent) => void;
  readOnly?: boolean;
}

export default function ThemeFab({
  content,
  onChange,
  readOnly = false,
}: ThemeFabProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="theme-fab">
      {open && (
        <div className="theme-fab__panel" role="dialog" aria-label="Template and colors">
          <div className="theme-fab__panel-head">
            <h3>Template &amp; colors</h3>
            <button
              type="button"
              className="theme-fab__close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {readOnly ? (
            <p className="theme-fab__readonly">
              Layout and colors follow the master version. Turn off sync to
              customize this version.
            </p>
          ) : (
            <ThemeSettings content={content} onChange={onChange} />
          )}
        </div>
      )}

      <button
        type="button"
        className={`theme-fab__btn${open ? " theme-fab__btn--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Customize template and colors"
        title="Template & colors"
      >
        <PaletteIcon />
        <span className="theme-fab__btn-label">Look</span>
      </button>
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3c-4.97 0-9 3.58-9 8 0 2.49 1.2 4.72 3.1 6.16.6.44 1.4.02 1.4-.55v-.87c0-.55.45-1 1-1 .28 0 .53.12.71.31 1.2 1.08 2.79 1.74 4.54 1.74 4.42 0 8-3.13 8-7s-3.58-8-8-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="10" r="1.25" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1.25" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1.25" fill="currentColor" />
    </svg>
  );
}
