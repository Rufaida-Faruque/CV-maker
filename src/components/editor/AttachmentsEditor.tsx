import { useRef, useState } from "react";
import {
  fileToAttachment,
  formatFileSize,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
} from "../../lib/attachments";
import type { CvAttachment, CvContent } from "../../types/cv";

interface AttachmentsEditorProps {
  content: CvContent;
  onChange: (content: CvContent) => void;
  disabled?: boolean;
}

export default function AttachmentsEditor({
  content,
  onChange,
  disabled = false,
}: AttachmentsEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;
  const attachments = content.attachments ?? [];

  function updateAttachments(next: CvAttachment[]) {
    onChange({ ...contentRef.current, attachments: next });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) return;
    setError(null);

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_ATTACHMENTS} files per CV version.`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    const added: CvAttachment[] = [];

    try {
      for (const file of files) {
        added.push(await fileToAttachment(file));
      }
      updateAttachments([...attachments, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateLabel(id: string, label: string) {
    updateAttachments(
      attachments.map((a) => (a.id === id ? { ...a, label } : a)),
    );
  }

  function remove(id: string) {
    updateAttachments(attachments.filter((a) => a.id !== id));
  }

  return (
    <div className="attachments-editor">
      <p className="attachments-editor__hint">
        Upload certificates (PDF, JPEG, PNG, WebP, GIF). Each file up to{" "}
        {formatFileSize(MAX_ATTACHMENT_BYTES)}. They appear in the preview and
        are appended when you download PDF.
      </p>

      {error && <p className="attachments-editor__error">{error}</p>}

      <ul className="attachments-editor__list">
        {attachments.map((file) => (
          <li key={file.id} className="attachments-editor__item">
            <div className="attachments-editor__preview">
              {file.kind === "image" ? (
                <img src={file.dataUrl} alt="" />
              ) : (
                <span className="attachments-editor__badge">
                  {file.kind === "pdf" ? "PDF" : "FILE"}
                </span>
              )}
            </div>
            <div className="attachments-editor__fields">
              <label>
                Label
                <input
                  value={file.label}
                  disabled={disabled}
                  onChange={(e) => updateLabel(file.id, e.target.value)}
                />
              </label>
              <span className="attachments-editor__meta">
                {file.fileName} · {formatFileSize(file.sizeBytes)}
              </span>
            </div>
            <button
              type="button"
              className="attachments-editor__remove"
              disabled={disabled}
              onClick={() => remove(file.id)}
              aria-label={`Remove ${file.fileName}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="attachments-editor__upload"
        disabled={disabled || attachments.length >= MAX_ATTACHMENTS}
        onClick={() => inputRef.current?.click()}
      >
        + Upload file
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
