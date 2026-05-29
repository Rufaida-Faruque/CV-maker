import type { SectionCatalogItem } from "../types/cv";

export const sectionCatalog: SectionCatalogItem[] = [
  {
    type: "education",
    title: "Education",
    column: "main",
    defaultData: { degree: "", institution: "", period: "" },
  },
  {
    type: "bulletList",
    title: "Bullet list",
    column: "main",
    defaultData: { items: [""] },
  },
  {
    type: "bulletList",
    title: "Skills",
    column: "sidebar",
    defaultData: { items: ["Skill | 4"] },
  },
  {
    type: "text",
    title: "Text block",
    column: "main",
    defaultData: { body: "" },
  },
  {
    type: "projects",
    title: "Projects",
    column: "main",
    defaultData: { items: [{ name: "", url: "" }] },
  },
  {
    type: "personalDetails",
    title: "Personal details",
    column: "sidebar",
    defaultData: {
      dateOfBirthIso: "",
      phone: "",
      address: "",
      postCode: "",
      city: "",
      linkedIn: { label: "", href: "" },
      github: { label: "", href: "" },
      customFields: [],
    },
  },
];
