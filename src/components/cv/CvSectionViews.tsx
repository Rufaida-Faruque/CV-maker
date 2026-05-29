import { parseSkillLevel } from "../../lib/attachments";
import type {
  BulletListData,
  EducationData,
  PersonalDetailsData,
  ProjectsData,
  TextData,
} from "../../types/cv";
import PersonalDetailsView from "./PersonalDetailsView";

export function BulletList({ items }: { items: string[] }) {
  const visible = items.filter((i) => i.trim());
  if (!visible.length) return null;
  return (
    <ul className="cv-bullets">
      {visible.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function SkillBars({ items }: { items: string[] }) {
  const visible = items.filter((i) => i.trim());
  if (!visible.length) return null;
  return (
    <ul className="cv-skill-bars">
      {visible.map((item) => {
        const { name, level } = parseSkillLevel(item);
        return (
          <li key={item} className="cv-skill-bars__item">
            <span className="cv-skill-bars__name">{name}</span>
            <span className="cv-skill-bars__track" aria-hidden="true">
              <span
                className="cv-skill-bars__fill"
                style={{ width: `${(level / 5) * 100}%` }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectList({ items }: { items: ProjectsData["items"] }) {
  const visible = items.filter((p) => p.name.trim() || p.url.trim());
  if (!visible.length) return null;
  return (
    <ul className="cv-bullets cv-bullets--projects">
      {visible.map((project) => (
        <li key={project.url || project.name}>
          {project.name && (
            <span className="cv-project-name">{project.name}:</span>
          )}{" "}
          {project.url ? (
            <a href={project.url} target="_blank" rel="noreferrer">
              {project.url}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function EducationBlock({ data }: { data: EducationData }) {
  if (!data.degree.trim() && !data.institution.trim()) return null;
  return (
    <div className="cv-education">
      <div className="cv-education__row">
        {data.degree && <p className="cv-education__degree">{data.degree}</p>}
        {data.period && <p className="cv-education__period">{data.period}</p>}
      </div>
      {data.institution && (
        <p className="cv-education__institution">{data.institution}</p>
      )}
    </div>
  );
}

export function TimelineEntry({ data }: { data: EducationData }) {
  if (!data.degree.trim() && !data.institution.trim() && !data.period.trim()) {
    return null;
  }
  return (
    <div className="cv-timeline-entry">
      <div className="cv-timeline-entry__dates">{data.period || " "}</div>
      <div className="cv-timeline-entry__body">
        {data.degree && (
          <p className="cv-timeline-entry__title">{data.degree}</p>
        )}
        {data.institution && (
          <p className="cv-timeline-entry__subtitle">{data.institution}</p>
        )}
      </div>
    </div>
  );
}

export function MainSection({
  type,
  title,
  data,
  isLast,
  variant = "default",
}: {
  type: string;
  title: string;
  data: unknown;
  isLast: boolean;
  variant?: "default" | "sidebar-dark" | "timeline" | "skills";
}) {
  const className = `cv-section${isLast ? " cv-section--last" : ""}${
    variant === "sidebar-dark" ? " cv-section--sidebar-dark" : ""
  }`;

  if (type === "personalDetails") {
    return (
      <PersonalDetailsView
        title={title}
        data={data as PersonalDetailsData}
        variant={variant === "sidebar-dark" ? "dark" : "default"}
      />
    );
  }

  if (type === "education") {
    const d = data as EducationData;
    if (variant === "timeline") {
      if (!d.degree.trim() && !d.institution.trim()) return null;
      return (
        <section className={className}>
          <h2 className="cv-section__title">{title}</h2>
          <TimelineEntry data={d} />
        </section>
      );
    }
    return (
      <section className={className}>
        <h2 className="cv-section__title">{title}</h2>
        <EducationBlock data={d} />
      </section>
    );
  }

  if (type === "bulletList") {
    const d = data as BulletListData;
    const List = variant === "skills" ? SkillBars : BulletList;
    return (
      <section className={className}>
        <h2 className="cv-section__title">{title}</h2>
        <List items={d.items} />
      </section>
    );
  }

  if (type === "text") {
    const d = data as TextData;
    if (!d.body.trim()) return null;
    return (
      <section className={className}>
        <h2 className="cv-section__title">{title}</h2>
        <p className="cv-text">{d.body}</p>
      </section>
    );
  }

  if (type === "projects") {
    const d = data as ProjectsData;
    return (
      <section className={className}>
        <h2 className="cv-section__title">{title}</h2>
        <ProjectList items={d.items} />
      </section>
    );
  }

  return null;
}

export function AttachmentsPreview({
  attachments,
}: {
  attachments: { id: string; label: string; fileName: string; kind: string; dataUrl: string }[];
}) {
  if (!attachments.length) return null;
  return (
    <section className="cv-section cv-attachments">
      <h2 className="cv-section__title">Certificates &amp; documents</h2>
      <ul className="cv-attachments__list">
        {attachments.map((file) => (
          <li key={file.id} className="cv-attachments__item">
            {file.kind === "image" ? (
              <img
                className="cv-attachments__thumb"
                src={file.dataUrl}
                alt={file.label}
              />
            ) : (
              <span className="cv-attachments__icon" aria-hidden="true">
                {file.kind === "pdf" ? "PDF" : "FILE"}
              </span>
            )}
            <div className="cv-attachments__meta">
              <strong>{file.label}</strong>
              <span>{file.fileName}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="cv-attachments__note">
        Included as extra pages when you download PDF.
      </p>
    </section>
  );
}
