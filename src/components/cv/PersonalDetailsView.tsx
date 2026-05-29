import { formatDisplayDate } from "../../lib/dateFormat";
import { linkFieldIsEmpty } from "../../lib/linkField";
import type { CustomField, LinkField, PersonalDetailsData } from "../../types/cv";

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim()) || value.includes(".com");
}

function linkHref(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function LinkRow({
  label,
  field,
  dark,
}: {
  label: string;
  field: LinkField;
  dark?: boolean;
}) {
  if (linkFieldIsEmpty(field)) return null;
  const text = field.label || field.href.replace(/^https?:\/\//, "");
  return (
    <div className="cv-details__item">
      <dt>{label}</dt>
      <dd>
        {field.href ? (
          <a
            href={field.href}
            target="_blank"
            rel="noreferrer"
            className={dark ? "cv-details__link--dark" : undefined}
          >
            {text}
          </a>
        ) : (
          text
        )}
      </dd>
    </div>
  );
}

function CustomRow({ field, dark }: { field: CustomField; dark?: boolean }) {
  if (!field.label.trim() && !field.value.trim()) return null;
  const label = field.label.trim() || "Details";
  const value = field.value.trim();
  if (!value) {
    return (
      <div className="cv-details__item">
        <dt>{label}</dt>
        <dd />
      </div>
    );
  }
  if (isUrl(value)) {
    const href = linkHref(value);
    const display = value.replace(/^https?:\/\//, "");
    return (
      <div className="cv-details__item">
        <dt>{label}</dt>
        <dd>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={dark ? "cv-details__link--dark" : undefined}
          >
            {display}
          </a>
        </dd>
      </div>
    );
  }
  return (
    <div className="cv-details__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PersonalDetailsView({
  title,
  data,
  variant = "default",
}: {
  title: string;
  data: PersonalDetailsData;
  variant?: "default" | "dark";
}) {
  const dob = formatDisplayDate(data.dateOfBirthIso);
  const dark = variant === "dark";

  return (
    <section
      className={`cv-section cv-section--sidebar${dark ? " cv-section--sidebar-dark" : ""}`}
    >
      <h2 className="cv-section__title">{title}</h2>
      <dl className={`cv-details${dark ? " cv-details--dark" : ""}`}>
        {data.phone && (
          <div className="cv-details__item">
            <dt>Phone</dt>
            <dd>{data.phone}</dd>
          </div>
        )}
        {(data.address || data.city || data.postCode) && (
          <div className="cv-details__item">
            <dt>Address</dt>
            <dd>
              {[data.address, data.city, data.postCode].filter(Boolean).join(", ")}
            </dd>
          </div>
        )}
        {dob && (
          <div className="cv-details__item">
            <dt>Date of birth</dt>
            <dd>{dob}</dd>
          </div>
        )}
        <LinkRow label="LinkedIn" field={data.linkedIn} dark={dark} />
        <LinkRow label="Github" field={data.github} dark={dark} />
        {(data.customFields ?? []).map((field) => (
          <CustomRow key={field.id} field={field} dark={dark} />
        ))}
      </dl>
    </section>
  );
}
