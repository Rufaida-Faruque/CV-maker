import { useRef } from "react";
import { sectionCatalog } from "../../data/sectionCatalog";
import { createSectionId } from "../../lib/ids";
import { reorderMovableSections } from "../../lib/sectionOrder";
import type { CvContent, CvSection, CvStore, SectionType } from "../../types/cv";
import Accordion from "./Accordion";
import AttachmentsEditor from "./AttachmentsEditor";
import DraggableSection from "./DraggableSection";
import PersonalDetailsEditor from "./PersonalDetailsEditor";
import SectionEditor from "./SectionEditor";

interface EditorPanelProps {
  content: CvContent;
  onChange: (content: CvContent) => void;
  sharedProfileNote?: boolean;
  store: CvStore;
}

export default function EditorPanel({
  content,
  onChange,
  sharedProfileNote,
  store,
}: EditorPanelProps) {
  const header = content.sections.find((s) => s.type === "header");
  const personal = content.sections.find((s) => s.type === "personalDetails");
  const editableSections = content.sections.filter(
    (s) => s.type !== "header" && s.type !== "personalDetails",
  );

  const contentRef = useRef(content);
  contentRef.current = content;

  function updateSections(sections: CvSection[]) {
    const current = contentRef.current;
    onChange({ ...current, sections });
  }

  function updateSection(updated: CvSection) {
    const current = contentRef.current;
    updateSections(
      current.sections.map((s) => (s.id === updated.id ? updated : s)),
    );
  }

  function toggleSection(id: string, enabled: boolean) {
    const current = contentRef.current;
    updateSections(
      current.sections.map((s) => (s.id === id ? { ...s, enabled } : s)),
    );
  }

  function removeSection(id: string) {
    updateSections(contentRef.current.sections.filter((s) => s.id !== id));
  }

  function handleReorder(dragId: string, targetId: string) {
    updateSections(
      reorderMovableSections(contentRef.current.sections, dragId, targetId),
    );
  }

  function addSection(type: SectionType) {
    const catalog = sectionCatalog.find((c) => c.type === type);
    if (!catalog) return;

    const section: CvSection = {
      id: createSectionId(),
      type: catalog.type,
      title: catalog.title,
      column: catalog.column,
      enabled: true,
      data: structuredClone(catalog.defaultData),
    };
    updateSections([...contentRef.current.sections, section]);
  }

  const addableTypes = sectionCatalog.filter(
    (c) => c.type !== "personalDetails" && c.type !== "header",
  );

  return (
    <aside className="editor-panel">
      <div className="editor-panel__scroll">
        {header && (
          <Accordion title="Personal details" defaultOpen>
            {sharedProfileNote && (
              <p className="editor-shared-note">
                You are editing the master version. Personal info here is the
                default for new versions unless they override it.
              </p>
            )}
            {!sharedProfileNote && (
              <p className="editor-shared-note">
                This version has its own personal info. Use Sync from master to
                pull selected fields from the master copy.
              </p>
            )}
            <PersonalDetailsEditor
              content={content}
              header={header}
              personal={personal}
              onChange={onChange}
            />
          </Accordion>
        )}

        <p className="editor-drag-hint">Drag ⋮⋮ to reorder sections on the CV</p>

        {editableSections.map((section) => (
          <DraggableSection
            key={section.id}
            id={section.id}
            title={section.title}
            enabled={section.enabled}
            onToggleEnabled={(on) => toggleSection(section.id, on)}
            onReorder={handleReorder}
          >
            <label className="editor-inline-label">
              Section title on CV
              <input
                value={section.title}
                onChange={(e) =>
                  updateSection({ ...section, title: e.target.value })
                }
              />
            </label>
            <SectionEditor section={section} onChange={updateSection} />
            <button
              type="button"
              className="editor-btn editor-btn--danger"
              onClick={() => {
                if (window.confirm(`Remove "${section.title}" from your CV?`)) {
                  removeSection(section.id);
                }
              }}
            >
              Remove section
            </button>
          </DraggableSection>
        ))}

        <Accordion title="Certificates & attachments" defaultOpen={false}>
          <AttachmentsEditor content={content} onChange={onChange} />
        </Accordion>

        <div className="editor-panel__add">
          <select
            className="editor-select editor-select--full"
            defaultValue=""
            onChange={(e) => {
              const type = e.target.value as SectionType;
              if (type) addSection(type);
              e.target.value = "";
            }}
          >
            <option value="">+ Add section</option>
            {addableTypes.map((c) => (
              <option key={c.type + c.title} value={c.type}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}
