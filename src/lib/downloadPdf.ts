import type { CvAttachment } from "../types/cv";

const DEFAULT_FILENAME = "CV.pdf";

export async function downloadCvPdf(
  element: HTMLElement,
  attachments: CvAttachment[] = [],
  filename = DEFAULT_FILENAME,
): Promise<void> {
  await document.fonts.ready;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  element.classList.add("cv--pdf-export");
  await waitForLayout();

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
      width: element.offsetWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0;
    const imgWidth = pageWidth - margin * 2;
    const pageHeightPx = (canvas.width * pageHeight) / imgWidth;
    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height) {
      if (pageIndex > 0) pdf.addPage();

      const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;
      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        margin,
        margin,
        imgWidth,
        sliceHeightMm,
      );

      offsetY += pageHeightPx;
      pageIndex += 1;
    }

    addNonPdfAttachmentPages(pdf, attachments, pageWidth, pageHeight);

    const pdfFiles = attachments.filter((a) => a.kind === "pdf");
    if (pdfFiles.length > 0) {
      const bytes = await mergePdfAttachments(pdf, pdfFiles);
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
    } else {
      pdf.save(filename);
    }
  } finally {
    element.classList.remove("cv--pdf-export");
  }
}

function addNonPdfAttachmentPages(
  pdf: import("jspdf").jsPDF,
  attachments: CvAttachment[],
  pageWidth: number,
  pageHeight: number,
): void {
  for (const file of attachments) {
    if (file.kind === "pdf") continue;
    pdf.addPage();
    if (file.kind === "image") {
      addImagePage(pdf, file, pageWidth, pageHeight);
    } else {
      addFilePlaceholderPage(pdf, file, pageWidth);
    }
  }
}

async function mergePdfAttachments(
  cvPdf: import("jspdf").jsPDF,
  pdfFiles: CvAttachment[],
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.load(cvPdf.output("arraybuffer"));

  for (const file of pdfFiles) {
    const donor = await PDFDocument.load(dataUrlToUint8Array(file.dataUrl));
    const pages = await merged.copyPages(donor, donor.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}

function addImagePage(
  pdf: import("jspdf").jsPDF,
  file: CvAttachment,
  pageWidth: number,
  pageHeight: number,
): void {
  const format = file.mimeType.includes("png") ? "PNG" : "JPEG";
  const margin = 10;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 3 - 10;

  pdf.setFontSize(11);
  pdf.text(file.label || file.fileName, margin, margin + 4);

  const props = pdf.getImageProperties(file.dataUrl);
  let w = maxW;
  let h = (props.height * w) / props.width;
  if (h > maxH) {
    h = maxH;
    w = (props.width * h) / props.height;
  }

  const x = (pageWidth - w) / 2;
  const y = margin + 10;
  pdf.addImage(file.dataUrl, format, x, y, w, h);
}

function addFilePlaceholderPage(
  pdf: import("jspdf").jsPDF,
  file: CvAttachment,
  pageWidth: number,
): void {
  pdf.setFontSize(16);
  pdf.text(file.label || file.fileName, 20, 40);
  pdf.setFontSize(11);
  pdf.text(`Attached file: ${file.fileName}`, 20, 52);
  pdf.text("Open the original from your CV maker.", 20, 62, {
    maxWidth: pageWidth - 40,
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}
