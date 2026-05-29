import { forwardRef } from "react";
import type { CvContent, HeaderData } from "../../types/cv";
import {
  getEnabledSections,
  getHeaderSection,
  getPersonalSection,
} from "../../lib/cvContent";
import { displayName } from "../../lib/headerName";
import { themeToCssVars } from "../../lib/themes";
import {
  AttachmentsPreview,
  MainSection,
} from "./CvSectionViews";
import "../../styles/cv.css";

function EnvelopeIcon() {
  return (
    <svg
      className="cv-header__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6h16v12H4V6zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 4h3l1.5 4-2 1.2a12 12 0 005.8 5.8L17 13l4 1.5v3a2 2 0 01-2.1 2 9.5 9.5 0 01-9.4-9.4A2 2 0 016.5 4z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function isSkillsSection(title: string) {
  return /skill/i.test(title);
}

function isTimelineSection(type: string) {
  return type === "education";
}

const CVDocument = forwardRef<HTMLDivElement, { content: CvContent }>(
  function CVDocument({ content }, ref) {
    const layout = content.theme.layout;
    const header = getHeaderSection(content);
    const headerData = header?.data as HeaderData | undefined;
    const personal = getPersonalSection(content);
    const mainSections = getEnabledSections(content, "main");
    const sidebarSections = getEnabledSections(content, "sidebar");
    const attachments = content.attachments ?? [];

    const name = headerData ? displayName(headerData) : "";
    const headline = headerData?.headline?.trim() ?? "";
    const email = headerData?.email ?? "";
    const photo = headerData?.photoDataUrl;
    const personalData = personal?.data;

    const layoutClass = `cv cv--layout-${layout}`;
    const style = themeToCssVars(content.theme);

    const europeanSections = content.sections.filter(
      (s) =>
        s.enabled &&
        s.type !== "header" &&
        s.type !== "personalDetails",
    );

    function renderMainSection(
      section: (typeof mainSections)[0],
      index: number,
      total: number,
      variant: "default" | "timeline" = "default",
    ) {
      return (
        <MainSection
          key={section.id}
          type={section.type}
          title={section.title}
          data={section.data}
          isLast={index === total - 1 && sidebarSections.length === 0}
          variant={
            variant === "timeline" && isTimelineSection(section.type)
              ? "timeline"
              : "default"
          }
        />
      );
    }

    /* —— Professional: dark left sidebar, dated main column —— */
    if (layout === "professional") {
      return (
        <article ref={ref} id="cv-document" className={layoutClass} style={style}>
          <div className="cv-professional">
            <aside className="cv-professional__sidebar">
              {(name || headline) && (
                <div className="cv-professional__identity">
                  {name && <h1 className="cv-professional__name">{name}</h1>}
                  {headline && (
                    <p className="cv-professional__headline">{headline}</p>
                  )}
                </div>
              )}
              {personal && personalData && (
                <MainSection
                  type="personalDetails"
                  title="Personal Info"
                  data={personalData}
                  isLast={false}
                  variant="sidebar-dark"
                />
              )}
              {sidebarSections.map((section, index) => (
                <MainSection
                  key={section.id}
                  type={section.type}
                  title={section.title}
                  data={section.data}
                  isLast={index === sidebarSections.length - 1}
                  variant={
                    section.type === "bulletList" ? "default" : "sidebar-dark"
                  }
                />
              ))}
            </aside>
            <main className="cv-professional__main">
              {mainSections.map((section, index) =>
                renderMainSection(
                  section,
                  index,
                  mainSections.length,
                  isTimelineSection(section.type) ? "timeline" : "default",
                ),
              )}
              <AttachmentsPreview attachments={attachments} />
            </main>
          </div>
        </article>
      );
    }

    /* —— Creative: photo sidebar + timeline main —— */
    if (layout === "creative") {
      const locationLine = personalData
        ? [personalData.city, personalData.postCode].filter(Boolean).join(", ")
        : "";

      return (
        <article ref={ref} id="cv-document" className={layoutClass} style={style}>
          <div className="cv-creative">
            <aside className="cv-creative__sidebar">
              {photo && (
                <img
                  className="cv-creative__photo"
                  src={photo}
                  alt=""
                  width={120}
                  height={120}
                />
              )}
              {personal && personalData && (
                <MainSection
                  type="personalDetails"
                  title="Links"
                  data={personalData}
                  isLast={false}
                  variant="sidebar-dark"
                />
              )}
              {sidebarSections.map((section, index) => (
                <MainSection
                  key={section.id}
                  type={section.type}
                  title={section.title}
                  data={section.data}
                  isLast={index === sidebarSections.length - 1}
                  variant={
                    section.type === "bulletList" && isSkillsSection(section.title)
                      ? "skills"
                      : "sidebar-dark"
                  }
                />
              ))}
            </aside>
            <main className="cv-creative__main">
              <header className="cv-creative__header">
                <div className="cv-creative__header-text">
                  {name && <h1 className="cv-creative__name">{name}</h1>}
                  {headline && (
                    <p className="cv-creative__headline">{headline}</p>
                  )}
                </div>
                <div className="cv-creative__contact">
                  {locationLine && (
                    <span className="cv-creative__contact-item">
                      <PinIcon />
                      {locationLine}
                    </span>
                  )}
                  {personalData?.phone && (
                    <span className="cv-creative__contact-item">
                      <PhoneIcon />
                      {personalData.phone}
                    </span>
                  )}
                  {email && (
                    <a
                      className="cv-creative__contact-item"
                      href={`mailto:${email}`}
                    >
                      <EnvelopeIcon />
                      {email}
                    </a>
                  )}
                </div>
              </header>

              {mainSections.map((section, index) => (
                <MainSection
                  key={section.id}
                  type={section.type}
                  title={section.title}
                  data={section.data}
                  isLast={index === mainSections.length - 1}
                  variant={
                    isTimelineSection(section.type)
                      ? "timeline"
                      : section.type === "bulletList" &&
                          isSkillsSection(section.title)
                        ? "skills"
                        : "default"
                  }
                />
              ))}
              <AttachmentsPreview attachments={attachments} />
            </main>
          </div>
        </article>
      );
    }

    /* —— Classic / Modern / European —— */
    const isEuropean = layout === "european";

    return (
      <article ref={ref} id="cv-document" className={layoutClass} style={style}>
        {headerData && (name || email) && (
          <header className="cv-header">
            <div className="cv-header__inner">
              {photo && (
                <img
                  className="cv-header__photo"
                  src={photo}
                  alt=""
                  width={96}
                  height={96}
                />
              )}
              <div className="cv-header__text">
                {name && <h1 className="cv-header__name">{name}</h1>}
                {headline && (
                  <p className="cv-header__headline">{headline}</p>
                )}
                {email && (
                  <a className="cv-header__email" href={`mailto:${email}`}>
                    <EnvelopeIcon />
                    {email}
                  </a>
                )}
              </div>
            </div>
          </header>
        )}

        {isEuropean ? (
          <div className="cv-body cv-body--single">
            {europeanSections.map((section, index) => (
              <MainSection
                key={section.id}
                type={section.type}
                title={section.title}
                data={section.data}
                isLast={
                  index === europeanSections.length - 1 && !personalData
                }
              />
            ))}
            {personal && personalData && (
              <MainSection
                type="personalDetails"
                title={personal.title}
                data={personalData}
                isLast={!attachments.length}
              />
            )}
            <AttachmentsPreview attachments={attachments} />
          </div>
        ) : (
          <div className="cv-body">
            <div className="cv-main">
              {mainSections.map((section, index) => (
                <MainSection
                  key={section.id}
                  type={section.type}
                  title={section.title}
                  data={section.data}
                  isLast={
                    index === mainSections.length - 1 &&
                    !personalData &&
                    sidebarSections.length === 0
                  }
                />
              ))}
              <AttachmentsPreview attachments={attachments} />
            </div>
            {(personalData || sidebarSections.length > 0) && (
              <aside className="cv-sidebar">
                {personal && personalData && (
                  <MainSection
                    type="personalDetails"
                    title={personal.title}
                    data={personalData}
                    isLast={sidebarSections.length === 0}
                  />
                )}
                {sidebarSections.map((section, index) => (
                  <MainSection
                    key={section.id}
                    type={section.type}
                    title={section.title}
                    data={section.data}
                    isLast={index === sidebarSections.length - 1}
                  />
                ))}
              </aside>
            )}
          </div>
        )}
      </article>
    );
  },
);

export default CVDocument;
