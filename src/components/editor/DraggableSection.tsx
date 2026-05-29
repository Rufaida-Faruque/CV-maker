import { useState, type ReactNode } from "react";
import Accordion from "./Accordion";

interface DraggableSectionProps {
  id: string;
  title: string;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onReorder: (dragId: string, targetId: string) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export default function DraggableSection({
  id,
  title,
  enabled,
  onToggleEnabled,
  onReorder,
  defaultOpen,
  disabled = false,
  children,
}: DraggableSectionProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`draggable-section${dragOver ? " draggable-section--over" : ""}${disabled ? " draggable-section--disabled" : ""}`}
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) return;
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const dragId = e.dataTransfer.getData("text/plain");
        if (dragId && dragId !== id) onReorder(dragId, id);
      }}
    >
      <div className="draggable-section__handle" title="Drag to reorder">
        ⋮⋮
      </div>
      <div className="draggable-section__content">
        <Accordion
          title={title}
          enabled={enabled}
          onToggleEnabled={onToggleEnabled}
          defaultOpen={defaultOpen}
        >
          {children}
        </Accordion>
      </div>
    </div>
  );
}
