import type { CvContent } from "../types/cv";
import { DEFAULT_THEME } from "../types/cv";
import { createSectionId } from "../lib/ids";

/** Demo CV — default layout and sample content (Rufaida) */
export const demoCvTemplate: CvContent = {
  theme: { ...DEFAULT_THEME },
  sections: [
    {
      id: createSectionId(),
      type: "header",
      title: "Header",
      column: "main",
      enabled: true,
      data: {
        givenName: "Rufaida",
        familyName: "Faruque",
        email: "rufaida.faruque@gmail.com",
      },
    },
    {
      id: createSectionId(),
      type: "education",
      title: "Education",
      column: "main",
      enabled: true,
      data: {
        degree: "Bachelor of Science in Computer Science and Engineering",
        institution: "BRAC University, Dhaka",
        period: "Jan 2023 - Sep 2026",
      },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Employment",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Languages",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Hobbies",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Courses",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Research interests",
      column: "main",
      enabled: true,
      data: {
        items: [
          "Cybersecurity",
          "Artificial Intelligence",
          "Blockchain",
          "Computer networking",
          "Cryptography",
        ],
      },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Related Courses",
      column: "main",
      enabled: true,
      data: {
        items: [
          "CSE446: Blockchain and Cryptocurrencies",
          "GCI (Ongoing)",
          "CSE447: Cryptography and Cryptoanalysis",
        ],
      },
    },
    {
      id: createSectionId(),
      type: "text",
      title: "Thesis",
      column: "main",
      enabled: true,
      data: { body: "Title: Enhancing cloud security" },
    },
    {
      id: createSectionId(),
      type: "projects",
      title: "Related projects",
      column: "main",
      enabled: true,
      data: {
        items: [
          {
            name: "Cipher Campus",
            url: "https://github.com/Rufaida-Faruque/CipherCampus",
          },
          {
            name: "D-App",
            url: "https://github.com/Rufaida-Faruque/D-App-CSE446",
          },
        ],
      },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Custom sections",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "bulletList",
      title: "Skills",
      column: "main",
      enabled: false,
      data: { items: [""] },
    },
    {
      id: createSectionId(),
      type: "personalDetails",
      title: "Personal details",
      column: "sidebar",
      enabled: true,
      data: {
        dateOfBirthIso: "2002-08-01",
        phone: "",
        address: "",
        postCode: "",
        city: "",
        linkedIn: {
          label: "linkedin.com/in/rufaida-faruque-192213288",
          href: "https://linkedin.com/in/rufaida-faruque-192213288",
        },
        github: {
          label: "github.com/Rufaida-Faruque",
          href: "https://github.com/Rufaida-Faruque",
        },
        customFields: [],
      },
    },
  ],
};
