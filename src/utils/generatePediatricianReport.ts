
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const A4_MARGIN_X_PT = 16;
const A4_MARGIN_Y_PT = 20;
const SECTION_GAP_PT = 8;

const isIOSDevice = () => /iPad|iPhone|iPod/.test(window.navigator.userAgent);

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error instanceof DOMException) return `${error.name}: ${error.message}`;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
};

const triggerPdfDownload = (pdf: jsPDF, filename: string) => {
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener noreferrer";
  link.style.display = "none";

  if (isIOSDevice()) {
    link.target = "_blank";
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isIOSDevice()) {
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 100);
  }

  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

const addCanvasSliceToPdf = (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  currentY: number,
  usableWidth: number,
  usableHeight: number
) => {
  const ratio = usableWidth / canvas.width;
  const renderedHeight = canvas.height * ratio;

  // Fits in remaining space
  if (renderedHeight <= usableHeight - (currentY - A4_MARGIN_Y_PT)) {
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", A4_MARGIN_X_PT, currentY, usableWidth, renderedHeight);
    return { currentY: currentY + renderedHeight + SECTION_GAP_PT };
  }

  // Fits in one full page but not in remaining area
  if (renderedHeight <= usableHeight) {
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", A4_MARGIN_X_PT, A4_MARGIN_Y_PT, usableWidth, renderedHeight);
    return { currentY: A4_MARGIN_Y_PT + renderedHeight + SECTION_GAP_PT };
  }

  // Too tall: split into slices
  const pxPerFullPage = usableHeight / ratio;
  let offsetPx = 0;
  let firstSlice = true;

  while (offsetPx < canvas.height - 1) {
    if (!firstSlice || currentY !== A4_MARGIN_Y_PT) {
      pdf.addPage();
    }

    const sliceHeightPx = Math.min(pxPerFullPage, canvas.height - offsetPx);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = Math.ceil(sliceHeightPx);

    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context during PDF slicing");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      Math.floor(offsetPx),
      canvas.width,
      Math.ceil(sliceHeightPx),
      0,
      0,
      canvas.width,
      Math.ceil(sliceHeightPx)
    );

    const sliceRenderHeight = sliceCanvas.height * ratio;
    pdf.addImage(
      sliceCanvas.toDataURL("image/png"),
      "PNG",
      A4_MARGIN_X_PT,
      A4_MARGIN_Y_PT,
      usableWidth,
      sliceRenderHeight
    );

    offsetPx += sliceHeightPx;
    firstSlice = false;
  }

  return { currentY: A4_MARGIN_Y_PT + SECTION_GAP_PT };
};

/**
 * Render a hidden report node and download it as PDF.
 * Uses section-based capture to reduce memory pressure on mobile.
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const parent = nodeRef.parentElement;
  const originalNodeStyle = nodeRef.style.cssText;
  const originalParentStyle = parent?.style.cssText ?? "";

  // Temporarily make hidden report renderable for html2canvas
  nodeRef.style.position = "absolute";
  nodeRef.style.left = "0";
  nodeRef.style.top = "0";
  nodeRef.style.opacity = "1";
  nodeRef.style.pointerEvents = "none";
  nodeRef.style.zIndex = "-1";
  nodeRef.style.width = "850px";
  nodeRef.style.visibility = "visible";

  if (parent) {
    parent.style.position = "absolute";
    parent.style.left = "0";
    parent.style.top = "0";
    parent.style.opacity = "1";
    parent.style.pointerEvents = "none";
    parent.style.zIndex = "-1";
    parent.style.visibility = "visible";
    parent.style.overflow = "visible";
  }

  try {
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - A4_MARGIN_X_PT * 2;
    const usableHeight = pageHeight - A4_MARGIN_Y_PT * 2;

    const sections = Array.from(nodeRef.querySelectorAll("[data-pdf-section]")) as HTMLElement[];
    const captureTargets = sections.length > 0 ? sections : [nodeRef];

    let currentY = A4_MARGIN_Y_PT;

    for (const section of captureTargets) {
      section.setAttribute("data-pdf-capture-root", "true");

      try {
        const targetWidth = Math.max(section.scrollWidth || 0, section.clientWidth || 0, 850);
        const targetHeight = Math.max(section.scrollHeight || 0, Math.ceil(section.getBoundingClientRect().height), 1);

        const canvas = await html2canvas(section, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: targetWidth,
          height: targetHeight,
          windowWidth: targetWidth,
          windowHeight: targetHeight,
          removeContainer: true,
          onclone: (clonedDoc) => {
            const clonedTarget = clonedDoc.querySelector('[data-pdf-capture-root="true"]') as HTMLElement | null;
            if (clonedTarget) {
              clonedTarget.style.overflow = "visible";
              clonedTarget.style.maxHeight = "none";
            }
          },
        });

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error("Rendered empty canvas");
        }

        const result = addCanvasSliceToPdf(pdf, canvas, currentY, usableWidth, usableHeight);
        currentY = result.currentY;
      } catch (error) {
        const sectionName = section.getAttribute("data-pdf-section") || "unknown-section";
        throw new Error(`Section '${sectionName}' failed: ${getErrorMessage(error)}`);
      } finally {
        section.removeAttribute("data-pdf-capture-root");
      }
    }

    triggerPdfDownload(pdf, filename);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  } finally {
    nodeRef.style.cssText = originalNodeStyle;
    if (parent) {
      parent.style.cssText = originalParentStyle;
    }
  }
}
