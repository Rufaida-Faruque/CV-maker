import { useMemo, useState } from "react";
import {
  buildCopyTree,
  collectDescendantKeys,
  isGroupFullySelected,
  isGroupPartiallySelected,
  type CopySelection,
  type CopyTreeNode,
} from "../lib/versionCopy";
import type { CvStore } from "../types/cv";

interface VersionCopyModalProps {
  mode: "create" | "sync";
  store: CvStore;
  onConfirm: (selection: CopySelection, name?: string) => void;
  onCancel: () => void;
}

export default function VersionCopyModal({
  mode,
  store,
  onConfirm,
  onCancel,
}: VersionCopyModalProps) {
  const tree = useMemo(() => buildCopyTree(store), [store]);
  const [selection, setSelection] = useState<CopySelection>(new Set());
  const [name, setName] = useState("");

  function toggleKey(key: string, checked: boolean) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleNode(node: CopyTreeNode, checked: boolean) {
    const keys = collectDescendantKeys(node);
    setSelection((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  function renderNode(node: CopyTreeNode, depth = 0) {
    const hasChildren = Boolean(node.children?.length);
    const full = hasChildren && isGroupFullySelected(node, selection);
    const partial = hasChildren && isGroupPartiallySelected(node, selection);
    const checked = hasChildren ? full : selection.has(node.key);

    return (
      <div
        key={node.key}
        className="copy-modal__node"
        style={{ paddingLeft: `${depth * 1.1}rem` }}
      >
        <label className="copy-modal__check">
          <input
            type="checkbox"
            checked={checked}
            ref={(el) => {
              if (el) el.indeterminate = partial;
            }}
            onChange={(e) => {
              if (hasChildren) toggleNode(node, e.target.checked);
              else toggleKey(node.key, e.target.checked);
            }}
          />
          <span>{node.label}</span>
        </label>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  const title =
    mode === "create" ? "Create new CV version" : "Sync from master";
  const hint =
    mode === "create"
      ? "Choose what to copy from the master version. Leave everything unchecked for a completely blank CV."
      : "Choose what to pull from the master into this version. Only selected items will be updated.";

  return (
    <div className="copy-modal" role="dialog" aria-modal="true">
      <div className="copy-modal__backdrop" onClick={onCancel} />
      <div className="copy-modal__card">
        <h3 className="copy-modal__title">{title}</h3>
        <p className="copy-modal__hint">{hint}</p>

        {mode === "create" && (
          <label className="copy-modal__name">
            Version name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research CV, Job CV"
            />
          </label>
        )}

        <div className="copy-modal__tree">{tree.map((node) => renderNode(node))}</div>

        <div className="copy-modal__actions">
          <button
            type="button"
            className="copy-modal__btn copy-modal__btn--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="copy-modal__btn copy-modal__btn--primary"
            onClick={() =>
              onConfirm(
                selection,
                mode === "create" ? name.trim() || "New CV" : undefined,
              )
            }
          >
            {mode === "create" ? "Create version" : "Sync selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
