import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  applyContentToStore,
  createVersionFromMaster,
  isMasterVersion,
  mergeStore,
  renameVersion,
  switchActiveVersion,
  syncVersionFromMaster,
} from "../lib/cvStore";
import { displayName } from "../lib/headerName";
import { downloadCvPdf } from "../lib/downloadPdf";
import type { CopySelection } from "../lib/versionCopy";
import { loadOrCreateCv, saveCv } from "../services/cvService";
import type { CvContent, CvRecord, CvStore, HeaderData } from "../types/cv";
import CVDocument from "./cv/CVDocument";
import EditorPanel from "./editor/EditorPanel";
import ThemeFab from "./editor/ThemeFab";
import VersionCopyModal from "./VersionCopyModal";
import VersionSwitcher from "./VersionSwitcher";

const AUTO_SAVE_MS = 3 * 60_000;

function cloneContent(content: CvContent): CvContent {
  return structuredClone(content);
}

function formatError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "SESSION_EXPIRED") {
      return "Session expired. Sign out and sign in again.";
    }
    if (err.message.startsWith("DRIVE_FORBIDDEN")) {
      return err.message.replace("DRIVE_FORBIDDEN: ", "");
    }
    return err.message;
  }
  return "Something went wrong.";
}

export default function CvWorkspace() {
  const { user, accessToken, signOut } = useAuth();
  const cvRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [record, setRecord] = useState<CvRecord | null>(null);
  const [store, setStore] = useState<CvStore | null>(null);
  const [content, setContent] = useState<CvContent | null>(null);
  /** Frozen snapshot for the preview pane — updates on load, save, or "Update preview". */
  const [previewContent, setPreviewContent] = useState<CvContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const storeRef = useRef(store);
  const recordRef = useRef(record);
  const savingRef = useRef(false);

  storeRef.current = store;
  recordRef.current = record;

  const syncContentFromStore = useCallback((next: CvStore) => {
    const merged = mergeStore(next);
    setStore(next);
    setContent(merged);
    setPreviewContent(cloneContent(merged));
  }, []);

  const refreshPreview = useCallback(() => {
    if (!content) return;
    setPreviewContent(cloneContent(content));
    setMessage("Preview updated");
  }, [content]);

  useEffect(() => {
    if (!user || !accessToken) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cv = await loadOrCreateCv(accessToken, user);
        if (cancelled) return;
        setRecord(cv);
        syncContentFromStore(cv.store);
        setDirty(false);
      } catch (err) {
        if (!cancelled) setError(formatError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, accessToken, syncContentFromStore]);

  const handleContentChange = useCallback((next: CvContent) => {
    const currentStore = storeRef.current;
    if (!currentStore) return;

    const nextStore = applyContentToStore(currentStore, next);
    storeRef.current = nextStore;
    setStore(nextStore);
    setContent(mergeStore(nextStore));
    setDirty(true);
    setMessage(null);
  }, []);

  const persistStore = useCallback(
    async (opts?: { silent?: boolean }) => {
      const currentRecord = recordRef.current;
      const currentStore = storeRef.current;
      const token = accessToken;
      if (!currentRecord || !currentStore || !token || savingRef.current) {
        return false;
      }

      const silent = opts?.silent ?? false;
      savingRef.current = true;
      if (!silent) setSaving(true);
      setError(null);
      try {
        const updated = await saveCv(token, currentRecord.fileId, currentStore);
        setRecord(updated);
        if (silent) {
          setDirty(false);
        } else {
          setDirty(false);
          setMessage("Saved to Google Drive");
        }
        const merged = mergeStore(currentStore);
        setPreviewContent(cloneContent(merged));
        return true;
      } catch (err) {
        if (!silent) setError(formatError(err));
        return false;
      } finally {
        savingRef.current = false;
        if (!silent) setSaving(false);
      }
    },
    [accessToken, syncContentFromStore],
  );

  const handleSave = useCallback(() => persistStore(), [persistStore]);

  const editGenerationRef = useRef(0);

  useEffect(() => {
    if (!dirty || !record) return;

    const generation = ++editGenerationRef.current;
    const timer = window.setTimeout(() => {
      if (editGenerationRef.current !== generation) return;
      void persistStore({ silent: true });
    }, AUTO_SAVE_MS);

    return () => window.clearTimeout(timer);
  }, [dirty, record, content, persistStore]);

  async function handleDownload() {
    const exportEl = exportRef.current;
    if (!exportEl || downloading || !content) return;
    setDownloading(true);
    setError(null);
    try {
      const header = content.sections.find((s) => s.type === "header");
      const name = header
        ? displayName(header.data as HeaderData).trim()
        : "";
      const fileName = name
        ? `${name.replace(/\s+/g, "_")}_CV.pdf`
        : "CV.pdf";
      await downloadCvPdf(
        exportEl,
        content.attachments ?? [],
        fileName,
      );
    } catch {
      setError("PDF export failed. Use Print → Save as PDF.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleSwitchVersion(versionId: string) {
    const current = storeRef.current;
    if (!current || versionId === current.activeVersionId) return;
    if (dirty) {
      await persistStore({ silent: true });
    }
    const latest = storeRef.current ?? current;
    syncContentFromStore(switchActiveVersion(latest, versionId));
    setDirty(false);
    setMessage(null);
  }

  function handleCreateVersion(name: string, selection: CopySelection) {
    if (!store) return;
    syncContentFromStore(createVersionFromMaster(store, name, selection));
    setDirty(true);
    setMessage(`Created "${name}" — save when ready`);
  }

  function handleRename(versionId: string, name: string) {
    if (!store) return;
    syncContentFromStore(renameVersion(store, versionId, name));
    setDirty(true);
  }

  function handleSyncConfirm(selection: CopySelection) {
    if (!store) return;
    setShowSyncModal(false);
    syncContentFromStore(
      syncVersionFromMaster(store, store.activeVersionId, selection),
    );
    setDirty(true);
    setMessage("Synced from master — save when ready");
  }

  if (loading) {
    return <div className="workspace-loading">Loading your CV from Google…</div>;
  }

  if (!content || !previewContent || !store) {
    return (
      <div className="workspace-loading workspace-loading--error">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  const activeIsMaster = isMasterVersion(store, store.activeVersionId);

  return (
    <div className="workspace">
      <header className="workspace-bar">
        <div className="workspace-bar__left">
          <span className="workspace-bar__brand">CV Maker</span>
          <VersionSwitcher
            store={store}
            onSwitch={handleSwitchVersion}
            onCreateVersion={handleCreateVersion}
            onRename={handleRename}
          />
        </div>
        <div className="workspace-bar__actions">
          {message && <span className="workspace-bar__msg">{message}</span>}
          {dirty && !saving && (
            <span className="workspace-bar__dirty">Unsaved</span>
          )}
          {saving && (
            <span className="workspace-bar__dirty workspace-bar__dirty--save">
              Saving…
            </span>
          )}
          {!activeIsMaster && (
            <button
              type="button"
              className="toolbar-btn toolbar-btn--sync"
              onClick={() => setShowSyncModal(true)}
            >
              Sync from master
            </button>
          )}
          <button
            type="button"
            className="toolbar-btn toolbar-btn--primary"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Preparing PDF…" : "Download"}
          </button>
          <button
            type="button"
            className="toolbar-btn toolbar-btn--ghost"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <span className="workspace-bar__email">{user?.email}</span>
          <button
            type="button"
            className="toolbar-btn toolbar-btn--ghost"
            onClick={() => window.print()}
          >
            Print
          </button>
          <button
            type="button"
            className="toolbar-btn toolbar-btn--ghost"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="workspace-error">{error}</p>}

      <div className="workspace-body">
        <EditorPanel
          content={content}
          onChange={handleContentChange}
          sharedProfileNote={activeIsMaster}
          store={store}
        />
        <div className="workspace-preview">
          <div className="workspace-preview__head">
            <p className="workspace-preview__label">Preview</p>
            {dirty && (
              <button
                type="button"
                className="workspace-preview__refresh"
                onClick={refreshPreview}
              >
                Update preview
              </button>
            )}
          </div>
          {dirty && (
            <p className="workspace-preview__stale-hint">
              Showing last saved preview — click Update preview to see your edits.
            </p>
          )}
          <div className="workspace-preview__frame">
            <CVDocument ref={cvRef} content={previewContent} />
          </div>
          <ThemeFab content={content} onChange={handleContentChange} />
        </div>
      </div>

      {showSyncModal && (
        <VersionCopyModal
          mode="sync"
          store={store}
          onCancel={() => setShowSyncModal(false)}
          onConfirm={handleSyncConfirm}
        />
      )}

      {content && (
        <div className="cv-pdf-mount" aria-hidden="true">
          <CVDocument ref={exportRef} content={content} />
        </div>
      )}
    </div>
  );
}
