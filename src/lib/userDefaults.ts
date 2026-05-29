import { demoCvTemplate } from "../data/demoTemplate";
import type { GoogleUser } from "../types/auth";
import type { CvContent, HeaderData } from "../types/cv";

/** New users start from the demo layout with their Google name/email */
export function defaultCvForUser(user: GoogleUser): CvContent {
  const content = structuredClone(demoCvTemplate);
  const header = content.sections.find((s) => s.type === "header");
  if (header) {
    const data = header.data as HeaderData;
    const parts = (user.name ?? "").trim().split(/\s+/);
    if (parts.length >= 2) {
      data.givenName = parts[0];
      data.familyName = parts.slice(1).join(" ");
    } else if (parts.length === 1) {
      data.givenName = parts[0];
      data.familyName = "";
    }
    if (user.email) data.email = user.email;
  }
  const personal = content.sections.find((s) => s.type === "personalDetails");
  if (personal) {
    const d = personal.data as import("../types/cv").PersonalDetailsData;
    if (!d.customFields) d.customFields = [];
  }
  return content;
}
