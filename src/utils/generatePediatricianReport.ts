
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
  
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const ratio = pdfWidth / canvas.width;
  const canvasPerPage = pdfHeight / ratio;

  const fitMode = nodeRef.getAttribute('data-pdf-fit');
  if (fitMode === 'single') {
    // Fit entire content on one page by scaling
    const fitRatio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const imgWidth = canvas.width * fitRatio;
    const imgHeight = canvas.height * fitRatio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
    return;
  }
  
  // Collect candidate cut positions from sections and table rows
  const candidates = new Set<number>([0, canvas.height]);
  
  // Add section boundaries
  const sections = nodeRef.querySelectorAll('[data-pdf-section]');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeBottom = rect.bottom - nodeRect.top;
    const canvasY = (relativeBottom / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasY));
  });
  
  // Add table row boundaries as fallback
  const tableRows = nodeRef.querySelectorAll('table tbody tr');
  tableRows.forEach(row => {
    const rect = row.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeBottom = rect.bottom - nodeRect.top;
    const canvasY = (relativeBottom / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasY));
  });
  
  // Sort candidates
  const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);
  
  // Build pages with smart cuts
  let lastCut = 0;
  let isFirstPage = true;
  
  while (lastCut < canvas.height) {
    const limit = lastCut + canvasPerPage;
    
    // Find the best cut position that fits within the page
    let nextCut = canvas.height;
    for (let i = sortedCandidates.length - 1; i >= 0; i--) {
      const candidate = sortedCandidates[i];
      if (candidate > lastCut && candidate <= limit + 10) { // Small tolerance
        nextCut = candidate;
        break;
      }
    }
    
    // If no good candidate found, use the limit
    if (nextCut === canvas.height && lastCut + canvasPerPage < canvas.height) {
      nextCut = Math.min(lastCut + canvasPerPage, canvas.height);
    }
    
    // Add the page
    if (!isFirstPage) {
      pdf.addPage();
    }
    
    const yPosition = -(lastCut * ratio);
    const imgWidth = pdfWidth;
    const imgHeight = canvas.height * ratio;
    
    pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
    
    lastCut = nextCut;
    isFirstPage = false;
  }

  pdf.save(filename);
}
