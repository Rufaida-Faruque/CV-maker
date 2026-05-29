import { useState } from "react";
import { isMasterVersion } from "../lib/cvStore";
import { CREATE_VERSION_OPTION } from "../lib/versionCopy";
import type { CopySelection } from "../lib/versionCopy";
import type { CvStore } from "../types/cv";
import VersionCopyModal from "./VersionCopyModal";

interface VersionSwitcherProps {
  store: CvStore;
  onSwitch: (versionId: string) => void | Promise<void>;
  onCreateVersion: (name: string, selection: CopySelection) => void;
  onRename: (versionId: string, name: string) => void;
}

export default function VersionSwitcher({
  store,
  onSwitch,
  onCreateVersion,
  onRename,
}: VersionSwitcherProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const active = store.versions.find((v) => v.id === store.activeVersionId);

  function versionLabel(versionId: string, name: string) {
    if (isMasterVersion(store, versionId)) return `${name} (master)`;
    return name;
  }

  function handleSelectChange(value: string) {
    if (value === CREATE_VERSION_OPTION) {
      setShowCreateModal(true);
      return;
    }
    if (value !== store.activeVersionId) {
      void onSwitch(value);
    }
  }

  function handleRename() {
    if (!active) return;
    const next = window.prompt("Version name", active.name);
    if (next?.trim()) onRename(active.id, next.trim());
  }

  return (
    <>
      <div className="version-switcher version-switcher--compact">
        <label className="version-switcher__label">
          CV version
          <div className="version-switcher__row">
            <select
              value={store.activeVersionId}
              onChange={(e) => handleSelectChange(e.target.value)}
            >
              {store.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {versionLabel(v.id, v.name)}
                </option>
              ))}
              <option value={CREATE_VERSION_OPTION}>+ Create new version…</option>
            </select>
            <button
              type="button"
              className="version-switcher__rename"
              onClick={handleRename}
              title="Rename current version"
            >
              Rename
            </button>
          </div>
        </label>
      </div>

      {showCreateModal && (
        <VersionCopyModal
          mode="create"
          store={store}
          onCancel={() => setShowCreateModal(false)}
          onConfirm={(selection, name) => {
            setShowCreateModal(false);
            onCreateVersion(name ?? "New CV", selection);
          }}
        />
      )}
    </>
  );
}
