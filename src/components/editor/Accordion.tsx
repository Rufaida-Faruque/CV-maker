import { useState, type ReactNode } from "react";

interface AccordionProps {
  title: string;
  enabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Accordion({
  title,
  enabled = true,
  onToggleEnabled,
  defaultOpen = false,
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`accordion${open ? " accordion--open" : ""}`}>
      <div className="accordion__head">
        <button
          type="button"
          className="accordion__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="accordion__chevron" aria-hidden="true" />
          <span className="accordion__title">{title}</span>
        </button>
        {onToggleEnabled && (
          <label className="accordion__show" title="Show on CV">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
            />
            <span className="accordion__show-label">Show</span>
          </label>
        )}
      </div>
      {open && <div className="accordion__body">{children}</div>}
    </div>
  );
}
