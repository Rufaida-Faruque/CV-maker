import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageDataUrl } from "../../lib/cropImage";

interface PhotoCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

export default function PhotoCropModal({
  imageSrc,
  onCancel,
  onSave,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleSave() {
    if (!croppedArea) return;
    setSaving(true);
    try {
      const url = await getCroppedImageDataUrl(imageSrc, croppedArea, 240);
      onSave(url);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="photo-modal" role="dialog" aria-modal="true">
      <div className="photo-modal__backdrop" onClick={onCancel} />
      <div className="photo-modal__card">
        <h3>Crop profile photo</h3>
        <p className="photo-modal__hint">Square crop · fixed size on CV</p>
        <div className="photo-modal__crop">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="photo-modal__zoom">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
        <div className="photo-modal__actions">
          <button type="button" className="editor-btn editor-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="editor-download-btn"
            onClick={handleSave}
            disabled={saving || !croppedArea}
          >
            {saving ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
