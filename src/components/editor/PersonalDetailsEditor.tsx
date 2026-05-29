import { useRef, useState } from "react";
import { createSectionId } from "../../lib/ids";
import { readFileAsDataUrl } from "../../lib/cropImage";
import type {
  CvContent,
  CvSection,
  CustomField,
  HeaderData,
  LinkField,
  PersonalDetailsData,
} from "../../types/cv";
import PhotoCropModal from "./PhotoCropModal";

interface PersonalDetailsEditorProps {
  header: CvSection;
  personal: CvSection | undefined;
  onChange: (content: CvContent) => void;
  content: CvContent;
}

function normalizeHref(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function linkDisplay(field: LinkField): string {
  return field.href || field.label;
}

function patchLinkField(field: LinkField, raw: string): LinkField {
  const v = raw.trim();
  const href = normalizeHref(v);
  return {
    href,
    label: v.replace(/^https?:\/\//, "") || field.label,
  };
}

export default function PersonalDetailsEditor({
  header,
  personal,
  onChange,
  content,
}: PersonalDetailsEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const contentRef = useRef(content);
  contentRef.current = content;

  const h = header.data as HeaderData;
  const p = (personal?.data ?? {
    dateOfBirthIso: "",
    phone: "",
    address: "",
    postCode: "",
    city: "",
    linkedIn: { label: "", href: "" },
    github: { label: "", href: "" },
    customFields: [],
  }) as PersonalDetailsData;

  function updateSections(updater: (sections: CvSection[]) => CvSection[]) {
    const current = contentRef.current;
    onChange({ ...current, sections: updater(current.sections) });
  }

  function patchHeader(patch: Partial<HeaderData>) {
    updateSections((sections) =>
      sections.map((s) =>
        s.id === header.id
          ? { ...s, data: { ...(s.data as HeaderData), ...patch } }
          : s,
      ),
    );
  }

  function patchPersonal(patch: Partial<PersonalDetailsData>) {
    if (!personal) return;
    updateSections((sections) =>
      sections.map((s) =>
        s.id === personal.id
          ? { ...s, data: { ...(s.data as PersonalDetailsData), ...patch } }
          : s,
      ),
    );
  }

  function updateCustom(id: string, patch: Partial<CustomField>) {
    if (!personal) return;
    updateSections((sections) =>
      sections.map((s) => {
        if (s.id !== personal.id) return s;
        const data = s.data as PersonalDetailsData;
        return {
          ...s,
          data: {
            ...data,
            customFields: (data.customFields ?? []).map((f) =>
              f.id === id ? { ...f, ...patch } : f,
            ),
          },
        };
      }),
    );
  }

  function removeCustom(id: string) {
    if (!personal) return;
    updateSections((sections) =>
      sections.map((s) => {
        if (s.id !== personal.id) return s;
        const data = s.data as PersonalDetailsData;
        return {
          ...s,
          data: {
            ...data,
            customFields: (data.customFields ?? []).filter((f) => f.id !== id),
          },
        };
      }),
    );
  }

  function addCustomField() {
    if (!personal) return;
    updateSections((sections) =>
      sections.map((s) => {
        if (s.id !== personal.id) return s;
        const data = s.data as PersonalDetailsData;
        return {
          ...s,
          data: {
            ...data,
            customFields: [
              ...(data.customFields ?? []),
              { id: createSectionId(), label: "", value: "" },
            ],
          },
        };
      }),
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCropSrc(dataUrl);
  }

  return (
    <>
      <div className="personal-form">
        <div className="personal-form__top">
          <button
            type="button"
            className="personal-form__photo"
            onClick={() => fileRef.current?.click()}
            title="Upload photo"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {h.photoDataUrl ? (
              <img src={h.photoDataUrl} alt="" />
            ) : (
              <span className="personal-form__photo-icon" aria-hidden="true">
                📷
              </span>
            )}
          </button>
          <div className="personal-form__name-fields">
            <label>
              Given name
              <input
                value={h.givenName}
                onChange={(e) => patchHeader({ givenName: e.target.value })}
              />
            </label>
            <label>
              Family name
              <input
                value={h.familyName}
                onChange={(e) => patchHeader({ familyName: e.target.value })}
              />
            </label>
            <label className="personal-form__full">
              Job title / headline
              <input
                value={h.headline ?? ""}
                onChange={(e) => patchHeader({ headline: e.target.value })}
                placeholder="e.g. Software Engineer"
              />
            </label>
          </div>
        </div>

        {h.photoDataUrl && (
          <button
            type="button"
            className="personal-form__photo-remove"
            onClick={() => patchHeader({ photoDataUrl: undefined })}
          >
            Remove photo
          </button>
        )}

        <div className="personal-form__row personal-form__row--2">
          <label>
            Email address
            <input
              type="email"
              value={h.email}
              onChange={(e) => patchHeader({ email: e.target.value })}
            />
          </label>
          <label>
            Phone number
            <input
              value={p.phone}
              onChange={(e) => patchPersonal({ phone: e.target.value })}
            />
          </label>
        </div>

        <label className="personal-form__full">
          Address
          <input
            value={p.address}
            onChange={(e) => patchPersonal({ address: e.target.value })}
          />
        </label>

        <div className="personal-form__row personal-form__row--2">
          <label>
            Post code
            <input
              value={p.postCode}
              onChange={(e) => patchPersonal({ postCode: e.target.value })}
            />
          </label>
          <label>
            City
            <input
              value={p.city}
              onChange={(e) => patchPersonal({ city: e.target.value })}
            />
          </label>
        </div>

        <label className="personal-form__full">
          Date of birth
          <input
            type="date"
            value={p.dateOfBirthIso}
            onChange={(e) => patchPersonal({ dateOfBirthIso: e.target.value })}
          />
        </label>

        <label className="personal-form__full">
          LinkedIn
          <input
            value={linkDisplay(p.linkedIn)}
            onChange={(e) =>
              patchPersonal({ linkedIn: patchLinkField(p.linkedIn, e.target.value) })
            }
            placeholder="linkedin.com/in/…"
          />
        </label>

        <label className="personal-form__full">
          Github
          <input
            value={linkDisplay(p.github)}
            onChange={(e) =>
              patchPersonal({ github: patchLinkField(p.github, e.target.value) })
            }
            placeholder="github.com/…"
          />
        </label>

        {(p.customFields ?? []).map((field) => (
          <div key={field.id} className="personal-form__custom">
            <div className="personal-form__custom-head">
              <input
                className="personal-form__custom-label"
                value={field.label}
                onChange={(e) => updateCustom(field.id, { label: e.target.value })}
                placeholder="Field name"
              />
              <button
                type="button"
                className="personal-form__custom-remove"
                onClick={() => removeCustom(field.id)}
                aria-label="Remove field"
              >
                ×
              </button>
            </div>
            <input
              value={field.value}
              onChange={(e) => updateCustom(field.id, { value: e.target.value })}
              placeholder="Value"
            />
          </div>
        ))}

        <button
          type="button"
          className="personal-form__add-custom"
          onClick={addCustomField}
        >
          + Custom field
        </button>
      </div>

      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onSave={(dataUrl) => {
            patchHeader({ photoDataUrl: dataUrl });
            setCropSrc(null);
          }}
        />
      )}
    </>
  );
}
