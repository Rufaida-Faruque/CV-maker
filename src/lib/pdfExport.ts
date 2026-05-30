/** A4 dimensions and px conversion at 96dpi */
export const PDF_PAGE_WIDTH_MM = 210;
export const PDF_PAGE_HEIGHT_MM = 297;
export const PDF_MARGIN_MM = 8;

export function mmToPx(mm: number): number {
  return (mm * 96) / 25.4;
}

export const PDF_PAGE_WIDTH_PX = mmToPx(PDF_PAGE_WIDTH_MM);
export const PDF_PAGE_HEIGHT_PX = mmToPx(PDF_PAGE_HEIGHT_MM);
export const PDF_CONTENT_HEIGHT_PX =
  PDF_PAGE_HEIGHT_PX - mmToPx(PDF_MARGIN_MM) * 2;

const PDF_BLOCK_SELECTOR = [
  ".cv-header",
  ".cv-creative__header",
  ".cv-professional__identity",
  ".cv-section:not(.cv-attachments)",
].join(", ");

/** Y positions (px) of section bottoms relative to the CV root — used to avoid cutting mid-section. */
export function collectSectionBreaks(root: HTMLElement): number[] {
  const rootTop = root.getBoundingClientRect().top;
  const breaks = new Set<number>([0]);

  root.querySelectorAll(PDF_BLOCK_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect();
    breaks.add(Math.round(rect.bottom - rootTop));
  });

  breaks.add(root.scrollHeight);
  return Array.from(breaks).sort((a, b) => a - b);
}

/**
 * Page slice start/end positions (px) within the rendered CV, snapped to section boundaries.
 */
export function computePageSlices(
  totalHeight: number,
  maxSliceHeight: number,
  sectionBreaks: number[],
): { start: number; end: number }[] {
  if (totalHeight <= maxSliceHeight) {
    return [{ start: 0, end: totalHeight }];
  }

  const slices: { start: number; end: number }[] = [];
  let start = 0;

  while (start < totalHeight - 1) {
    const idealEnd = start + maxSliceHeight;
    if (idealEnd >= totalHeight) {
      slices.push({ start, end: totalHeight });
      break;
    }

    const candidates = sectionBreaks.filter((y) => y > start + 40 && y <= idealEnd);
    const end =
      candidates.length > 0
        ? candidates[candidates.length - 1]
        : sectionBreaks.find((y) => y > start + 40) ?? idealEnd;

    slices.push({ start, end: Math.min(end, totalHeight) });
    start = end;
  }

  return slices.length ? slices : [{ start: 0, end: totalHeight }];
}

export function createPdfMount(): HTMLDivElement {
  const mount = document.createElement("div");
  mount.className = "cv-pdf-mount";
  mount.setAttribute("aria-hidden", "true");
  document.body.appendChild(mount);
  return mount;
}

export function removePdfMount(mount: HTMLElement): void {
  mount.remove();
}
