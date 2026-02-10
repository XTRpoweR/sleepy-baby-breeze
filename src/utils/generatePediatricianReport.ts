
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
    windowWidth: 850,
    windowHeight: nodeRef.scrollHeight,
    width: 850,
    height: nodeRef.scrollHeight,
    onclone: (clonedDoc, clonedElement) => {
      // Force the cloned element to a fixed print-friendly width
      clonedElement.style.width = '850px';
      clonedElement.style.maxWidth = '850px';
      clonedElement.style.overflow = 'visible';

      const style = clonedDoc.createElement('style');
      style.textContent = `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }
        /* Remove truncation */
        .truncate, [class*="truncate"] {
          overflow: visible !important;
          text-overflow: unset !important;
          white-space: normal !important;
        }
        /* Prevent overflow on all containers */
        .overflow-auto, .overflow-hidden, .overflow-x-auto, .overflow-y-auto,
        [class*="overflow-"], [class*="max-h-"] {
          overflow: visible !important;
          max-height: none !important;
        }
        /* Force all content to fit within width */
        *, *::before, *::after {
          max-width: 100% !important;
        }
        /* Fix chart containers */
        .recharts-wrapper, .recharts-surface {
          max-width: 100% !important;
        }
        svg {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Ensure grids don't overflow */
        .grid {
          max-width: 100% !important;
        }
        /* Page break control */
        [data-pdf-section] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        table, .card, .border, [class*="rounded"] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      `;
      clonedDoc.head.appendChild(style);

      // Fix all SVGs to have explicit dimensions
      const svgs = clonedElement.querySelectorAll('svg');
      svgs.forEach(svg => {
        const parent = svg.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0) {
            svg.setAttribute('width', String(Math.min(rect.width, 850)));
          }
        }
      });

      // Force recharts ResponsiveContainers to have explicit size
      const chartContainers = clonedElement.querySelectorAll('.recharts-responsive-container');
      chartContainers.forEach(container => {
        (container as HTMLElement).style.width = '100%';
        (container as HTMLElement).style.maxWidth = '100%';
      });
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
  
  // Apply safe margins (18mm ≈ 51pt)
  const margin = 40;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;
  
  const ratio = usableWidth / canvas.width;
  const canvasPerPage = usableHeight / ratio;

  const fitMode = nodeRef.getAttribute('data-pdf-fit');
  if (fitMode === 'single') {
    const fitRatio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
    const imgWidth = canvas.width * fitRatio;
    const imgHeight = canvas.height * fitRatio;
    const x = margin + (usableWidth - imgWidth) / 2;
    const y = margin + (usableHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
    return;
  }
  
  // Collect candidate cut positions from sections and table rows
  const candidates = new Set<number>([0, canvas.height]);
  
  const sections = nodeRef.querySelectorAll('[data-pdf-section]');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeTop = rect.top - nodeRect.top;
    const relativeBottom = rect.bottom - nodeRect.top;
    // Prefer cutting at section tops (between sections)
    candidates.add(Math.round((relativeTop / nodeRef.scrollHeight) * canvas.height));
    candidates.add(Math.round((relativeBottom / nodeRef.scrollHeight) * canvas.height));
  });
  
  const tableRows = nodeRef.querySelectorAll('table tbody tr');
  tableRows.forEach(row => {
    const rect = row.getBoundingClientRect();
    const nodeRect = nodeRef.getBoundingClientRect();
    const relativeBottom = rect.bottom - nodeRect.top;
    const canvasY = (relativeBottom / nodeRef.scrollHeight) * canvas.height;
    candidates.add(Math.round(canvasY));
  });
  
  const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);
  
  // Build pages with smart cuts
  let lastCut = 0;
  let isFirstPage = true;
  
  while (lastCut < canvas.height - 5) {
    const limit = lastCut + canvasPerPage;
    
    // Find the best cut position that fits within the page
    let nextCut = canvas.height;
    for (let i = sortedCandidates.length - 1; i >= 0; i--) {
      const candidate = sortedCandidates[i];
      if (candidate > lastCut + 10 && candidate <= limit + 10) {
        nextCut = candidate;
        break;
      }
    }
    
    // If no good candidate found, use the limit
    if (nextCut === canvas.height && lastCut + canvasPerPage < canvas.height) {
      nextCut = Math.min(lastCut + canvasPerPage, canvas.height);
    }
    
    if (!isFirstPage) {
      pdf.addPage();
    }
    
    const yPosition = margin - (lastCut * ratio);
    const imgWidth = usableWidth;
    const imgHeight = canvas.height * ratio;
    
    // Clip to usable area with margins
    pdf.rect(margin, margin, usableWidth, usableHeight);
    pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
    
    lastCut = nextCut;
    isFirstPage = false;
  }

  pdf.save(filename);
}
