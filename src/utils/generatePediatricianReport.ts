
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders a DOM node as a PDF and triggers download.
 * Uses smart page breaks based on data-pdf-section attributes.
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  // Wait a tick for charts to render
  await new Promise(resolve => setTimeout(resolve, 500));

  const canvas = await html2canvas(nodeRef, {
    scale: 2,
    backgroundColor: "#fff",
    useCORS: true,
    logging: false,
    windowWidth: 850,
    windowHeight: nodeRef.scrollHeight,
    width: 850,
    height: nodeRef.scrollHeight,
    onclone: (clonedDoc, clonedElement) => {
      // Ensure the cloned element is visible for rendering
      clonedElement.style.position = 'static';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.opacity = '1';
      clonedElement.style.pointerEvents = 'auto';

      const style = clonedDoc.createElement('style');
      style.textContent = `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .truncate {
          overflow: visible !important;
          text-overflow: unset !important;
          white-space: normal !important;
        }
        .overflow-auto, .overflow-hidden {
          overflow: visible !important;
        }
        [class*="max-h-"] {
          max-height: none !important;
        }
        .pdf-table-container {
          max-height: none !important;
          overflow: visible !important;
        }
        table, .card, .border, [class*="rounded"] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      `;
      clonedDoc.head.appendChild(style);
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
  
  // Add margins
  const marginX = 16;
  const marginY = 20;
  const usableWidth = pdfWidth - (marginX * 2);
  const usableHeight = pdfHeight - (marginY * 2);
  
  const ratio = usableWidth / canvas.width;
  const canvasPerPage = usableHeight / ratio;

  const fitMode = nodeRef.getAttribute('data-pdf-fit');
  if (fitMode === 'single') {
    const fitRatio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
    const imgWidth = canvas.width * fitRatio;
    const imgHeight = canvas.height * fitRatio;
    const x = marginX + (usableWidth - imgWidth) / 2;
    const y = marginY + (usableHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
    return;
  }
  
  // Collect candidate cut positions from sections
  const candidates = new Set<number>([0, canvas.height]);
  
  const sections = nodeRef.querySelectorAll('[data-pdf-section]');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    // Add both top and bottom of each section as candidates
    const relativeTop = rect.top - nodeRect.top;
    const relativeBottom = rect.bottom - nodeRect.top;
    const canvasYTop = (relativeTop / nodeRef.scrollHeight) * canvas.height;
    const canvasYBottom = (relativeBottom / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasYTop));
    candidates.add(Math.round(canvasYBottom));
  });
  
  // Add table row boundaries
  const tableRows = nodeRef.querySelectorAll('table tbody tr');
  tableRows.forEach(row => {
    const rect = row.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeTop = rect.top - nodeRect.top;
    const canvasY = (relativeTop / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasY));
  });

  // Also add card boundaries
  const cards = nodeRef.querySelectorAll('.rounded-lg, [class*="Card"]');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeTop = rect.top - nodeRect.top;
    const canvasY = (relativeTop / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasY));
  });
  
  const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);
  
  // Build pages with smart cuts
  let lastCut = 0;
  let pageNum = 0;
  
  while (lastCut < canvas.height - 5) {
    const limit = lastCut + canvasPerPage;
    
    // Find the best cut that fits within the page
    let nextCut = canvas.height;
    
    // Look for the largest candidate that fits within the page limit
    for (let i = sortedCandidates.length - 1; i >= 0; i--) {
      const candidate = sortedCandidates[i];
      if (candidate > lastCut + 50 && candidate <= limit + 5) {
        nextCut = candidate;
        break;
      }
    }
    
    // If no good candidate, use the raw page limit
    if (nextCut === canvas.height && lastCut + canvasPerPage < canvas.height - 50) {
      nextCut = Math.min(lastCut + canvasPerPage, canvas.height);
    }
    
    if (pageNum > 0) {
      pdf.addPage();
    }
    
    // Slice the canvas for this page
    const sliceHeight = nextCut - lastCut;
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = Math.ceil(sliceHeight);
    
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0, lastCut, canvas.width, sliceHeight,
        0, 0, canvas.width, sliceHeight
      );
    }
    
    const sliceData = sliceCanvas.toDataURL("image/png");
    const imgWidth = usableWidth;
    const imgHeight = sliceHeight * ratio;
    
    pdf.addImage(sliceData, "PNG", marginX, marginY, imgWidth, imgHeight);
    
    // Add page number
    pageNum++;
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `Page ${pageNum}`,
      pdfWidth / 2,
      pdfHeight - 10,
      { align: 'center' }
    );
    
    lastCut = nextCut;
  }

  pdf.save(filename);
}
