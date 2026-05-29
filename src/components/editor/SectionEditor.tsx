import type {
  BulletListData,
  CvSection,
  EducationData,
  ProjectsData,
  TextData,
} from "../../types/cv";

interface SectionEditorProps {
  section: CvSection;
  onChange: (section: CvSection) => void;
  disabled?: boolean;
}

export default function SectionEditor({
  section,
  onChange,
  disabled = false,
}: SectionEditorProps) {
  function patchData(data: CvSection["data"]) {
    onChange({ ...section, data });
  }

  if (section.type === "header" || section.type === "personalDetails") {
    return null;
  }

  if (section.type === "education") {
    const d = section.data as EducationData;
    return (
      <div className="editor-fields">
        <label>
          Degree
          <input
            value={d.degree}
            disabled={disabled}
            onChange={(e) => patchData({ ...d, degree: e.target.value })}
          />
        </label>
        <label>
          Institution
          <input
            value={d.institution}
            disabled={disabled}
            onChange={(e) => patchData({ ...d, institution: e.target.value })}
          />
        </label>
        <label>
          Period
          <input
            value={d.period}
            disabled={disabled}
            onChange={(e) => patchData({ ...d, period: e.target.value })}
            placeholder="Jan 2023 - Sep 2026"
          />
        </label>
      </div>
    );
  }

  if (section.type === "bulletList") {
    const d = section.data as BulletListData;
    return (
      <div className="editor-fields">
        {d.items.map((item, index) => (
          <div key={index} className="editor-row">
            <input
              value={item}
              disabled={disabled}
              onChange={(e) => {
                const items = [...d.items];
                items[index] = e.target.value;
                patchData({ items });
              }}
              placeholder="List item"
            />
            <button
              type="button"
              className="editor-btn editor-btn--ghost"
              disabled={disabled}
              onClick={() => {
                const items = d.items.filter((_, i) => i !== index);
                patchData({ items: items.length ? items : [""] });
              }}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="editor-btn editor-btn--ghost"
          disabled={disabled}
          onClick={() => patchData({ items: [...d.items, ""] })}
        >
          + Add item
        </button>
      </div>
    );
  }

  if (section.type === "text") {
    const d = section.data as TextData;
    return (
      <div className="editor-fields">
        <label>
          Content
          <textarea
            rows={3}
            value={d.body}
            disabled={disabled}
            onChange={(e) => patchData({ body: e.target.value })}
          />
        </label>
      </div>
    );
  }

  if (section.type === "projects") {
    const d = section.data as ProjectsData;
    return (
      <div className="editor-fields">
        {d.items.map((item, index) => (
          <div key={index} className="editor-group">
            <label>
              Project name
              <input
                value={item.name}
                disabled={disabled}
                onChange={(e) => {
                  const items = [...d.items];
                  items[index] = { ...items[index], name: e.target.value };
                  patchData({ items });
                }}
              />
            </label>
            <label>
              URL
              <input
                value={item.url}
                disabled={disabled}
                onChange={(e) => {
                  const items = [...d.items];
                  items[index] = { ...items[index], url: e.target.value };
                  patchData({ items });
                }}
                placeholder="https://..."
              />
            </label>
            <button
              type="button"
              className="editor-btn editor-btn--ghost"
              disabled={disabled}
              onClick={() => {
                const items = d.items.filter((_, i) => i !== index);
                patchData({
                  items: items.length ? items : [{ name: "", url: "" }],
                });
              }}
            >
              Remove project
            </button>
          </div>
        ))}
        <button
          type="button"
          className="editor-btn editor-btn--ghost"
          disabled={disabled}
          onClick={() =>
            patchData({ items: [...d.items, { name: "", url: "" }] })
          }
        >
          + Add project
        </button>
      </div>
    );
  }

  return null;
}
