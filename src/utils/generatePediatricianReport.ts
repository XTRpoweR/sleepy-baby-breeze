import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders a DOM node as a PDF and triggers download.
 * @param nodeRef - ref to the DOM node to render as PDF
 * @param filename - name of the resulting PDF
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  const canvas = await html2canvas(nodeRef, {
    scale: 2,
    backgroundColor: "#fff",
    useCORS: true,
    logging: false,
    windowHeight: nodeRef.scrollHeight,
    height: nodeRef.scrollHeight,
    onclone: (clonedDoc) => {
      const clonedNode = clonedDoc.querySelector('body');
      if (clonedNode) {
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table, .card, .border, [class*="rounded"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    }
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Use a small margin so content is not flush against page edges
  const margin = 20;
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = pdfHeight - margin * 2;

  const ratio = contentWidth / canvas.width;
  const canvasPerPage = contentHeight / ratio;

  const fitMode = nodeRef.getAttribute('data-pdf-fit');

  // === Single-page mode: fit whole content on one page ===
  if (fitMode === 'single') {
    const imgData = canvas.toDataURL("image/png");
    const fitRatio = Math.min(contentWidth / canvas.width, contentHeight / canvas.height);
    const imgWidth = canvas.width * fitRatio;
    const imgHeight = canvas.height * fitRatio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
    return;
  }

  // === Smart cut candidates (section boundaries + table rows + text blocks) ===
  const candidates = new Set<number>([0, canvas.height]);

  const addCandidatesFromNodes = (nodes: NodeListOf<Element>) => {
    nodes.forEach(el => {
      const rect = el.getBoundingClientRect();
      const nodeRect = nodeRef.getBoundingClientRect();
      const relativeBottom = rect.bottom - nodeRect.top;
      const canvasY = (relativeBottom / nodeRef.scrollHeight) * canvas.height;
      if (canvasY > 0 && canvasY < canvas.height) {
        candidates.add(Math.round(canvasY));
      }
    });
  };

  addCandidatesFromNodes(nodeRef.querySelectorAll('[data-pdf-section]'));
  addCandidatesFromNodes(nodeRef.querySelectorAll('table tbody tr'));
  // Also consider paragraphs, headings, and list items as safe break points
  addCandidatesFromNodes(nodeRef.querySelectorAll('p, li, h1, h2, h3, h4, div'));

  const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);

  // === Build pages by slicing the canvas into chunks (true clipping) ===
  let lastCut = 0;
  let isFirstPage = true;

  while (lastCut < canvas.height) {
    const maxLimit = lastCut + canvasPerPage;

    // Find the best cut position (largest candidate <= maxLimit)
    let nextCut = canvas.height;
    for (let i = sortedCandidates.length - 1; i >= 0; i--) {
      const c = sortedCandidates[i];
      if (c > lastCut && c <= maxLimit) {
        nextCut = c;
        break;
      }
    }

    // If no candidate found in range, force-cut at maxLimit
    if (nextCut === canvas.height && maxLimit < canvas.height) {
      nextCut = Math.floor(maxLimit);
    }

    // Safety: ensure we always advance (prevents infinite loops)
    if (nextCut <= lastCut) {
      nextCut = Math.min(lastCut + Math.floor(canvasPerPage), canvas.height);
    }

    const sliceHeight = nextCut - lastCut;

    // Create a temporary canvas for just this page's slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const pageCtx = pageCanvas.getContext('2d');

    if (pageCtx) {
      // White background (prevents transparency issues)
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      // Draw ONLY the slice of the original canvas (true clipping, no overflow)
      pageCtx.drawImage(
        canvas,
        0, lastCut, canvas.width, sliceHeight,  // source rect
        0, 0, canvas.width, sliceHeight          // destination rect
      );
    }

    const sliceImgData = pageCanvas.toDataURL("image/png");

    if (!isFirstPage) {
      pdf.addPage();
    }

    // Place the slice at top margin (no negative offset, no overflow)
    const sliceImgHeight = sliceHeight * ratio;
    pdf.addImage(sliceImgData, "PNG", margin, margin, contentWidth, sliceImgHeight);

    lastCut = nextCut;
    isFirstPage = false;
  }

  pdf.save(filename);
}
