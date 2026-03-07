import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PDF_SCALE = 2;
const PAGE_MARGIN_PT = 24;
const SECTION_GAP_PT = 12;

const getCloneStyleText = () => `
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  table, .card, .border, [class*="rounded"] {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  [class*="max-h-"], [class*="overflow-auto"], [class*="overflow-hidden"], [class*="overflow-scroll"] {
    max-height: none !important;
    overflow: visible !important;
  }
  .truncate, [class*="truncate"], [class*="line-clamp"] {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: normal !important;
    -webkit-line-clamp: unset !important;
  }
`;

const createPdfCaptureOptions = (targetHeight?: number): Parameters<typeof html2canvas>[1] => ({
  scale: PDF_SCALE,
  backgroundColor: "#fff",
  useCORS: true,
  logging: false,
  windowHeight: targetHeight,
  height: targetHeight,
  onclone: (clonedDoc) => {
    const style = clonedDoc.createElement("style");
    style.textContent = getCloneStyleText();
    clonedDoc.head.appendChild(style);
  },
});

const addCanvasChunkToPdf = (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  yPt: number,
  widthPt: number,
) => {
  const renderedHeightPt = (canvas.height * widthPt) / canvas.width;
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", PAGE_MARGIN_PT, yPt, widthPt, renderedHeightPt);
  return renderedHeightPt;
};

const sliceCanvasByHeight = (source: HTMLCanvasElement, maxSliceHeightPx: number) => {
  const slices: HTMLCanvasElement[] = [];
  let offsetY = 0;

  while (offsetY < source.height) {
    const currentSliceHeight = Math.min(maxSliceHeightPx, source.height - offsetY);
    const slice = document.createElement("canvas");
    slice.width = source.width;
    slice.height = currentSliceHeight;

    const ctx = slice.getContext("2d");
    if (!ctx) break;

    ctx.drawImage(
      source,
      0,
      offsetY,
      source.width,
      currentSliceHeight,
      0,
      0,
      source.width,
      currentSliceHeight,
    );

    slices.push(slice);
    offsetY += currentSliceHeight;
  }

  return slices;
};

/**
 * Renders a DOM node as a PDF and triggers download.
 * @param nodeRef - ref to the DOM node to render as PDF
 * @param filename - name of the resulting PDF
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN_PT * 2;
  const contentHeight = pageHeight - PAGE_MARGIN_PT * 2;

  const fitMode = nodeRef.getAttribute("data-pdf-fit");

  if (fitMode === "single") {
    const fullCanvas = await html2canvas(nodeRef, createPdfCaptureOptions(nodeRef.scrollHeight));
    const fitRatio = Math.min(contentWidth / fullCanvas.width, contentHeight / fullCanvas.height);
    const imgWidth = fullCanvas.width * fitRatio;
    const imgHeight = fullCanvas.height * fitRatio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(fullCanvas.toDataURL("image/png"), "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
    return;
  }

  const sections = Array.from(nodeRef.querySelectorAll<HTMLElement>("[data-pdf-section]"));
  const targets = sections.length > 0 ? sections : [nodeRef];

  let currentY = PAGE_MARGIN_PT;

  for (let i = 0; i < targets.length; i++) {
    const section = targets[i];
    const canvas = await html2canvas(section, createPdfCaptureOptions(section.scrollHeight));
    const sectionHeightPt = (canvas.height * contentWidth) / canvas.width;
    const remainingHeightPt = pageHeight - PAGE_MARGIN_PT - currentY;

    if (sectionHeightPt <= remainingHeightPt) {
      const renderedHeight = addCanvasChunkToPdf(pdf, canvas, currentY, contentWidth);
      currentY += renderedHeight + SECTION_GAP_PT;
      continue;
    }

    if (sectionHeightPt <= contentHeight) {
      pdf.addPage();
      currentY = PAGE_MARGIN_PT;
      const renderedHeight = addCanvasChunkToPdf(pdf, canvas, currentY, contentWidth);
      currentY += renderedHeight + SECTION_GAP_PT;
      continue;
    }

    const maxSliceHeightPx = Math.floor((contentHeight * canvas.width) / contentWidth);
    const slices = sliceCanvasByHeight(canvas, Math.max(1, maxSliceHeightPx));

    for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      const slice = slices[sliceIndex];
      const remaining = pageHeight - PAGE_MARGIN_PT - currentY;
      const sliceHeightPt = (slice.height * contentWidth) / slice.width;

      if (sliceHeightPt > remaining) {
        pdf.addPage();
        currentY = PAGE_MARGIN_PT;
      }

      const renderedHeight = addCanvasChunkToPdf(pdf, slice, currentY, contentWidth);
      currentY += renderedHeight;

      const hasMoreSlices = sliceIndex < slices.length - 1;
      if (hasMoreSlices) {
        pdf.addPage();
        currentY = PAGE_MARGIN_PT;
      }
    }

    currentY += SECTION_GAP_PT;
  }

  pdf.save(filename);
}
