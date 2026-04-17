import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Wait for images + charts to finish rendering inside a node.
 */
async function waitForContentReady(node: HTMLElement, timeoutMs = 3500) {
  const start = Date.now();

  // Wait for <img> tags
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(() => resolve(), 1500);
      });
    })
  );

  // Wait for recharts to render their SVGs
  while (Date.now() - start < timeoutMs) {
    const wrappers = node.querySelectorAll('.recharts-wrapper');
    if (wrappers.length === 0) break;

    let allReady = true;
    wrappers.forEach(w => {
      const svg = w.querySelector('svg');
      if (!svg || svg.children.length < 2) allReady = false;
    });

    if (allReady) break;
    await new Promise(r => setTimeout(r, 150));
  }

  // Final safety tick
  await new Promise(r => setTimeout(r, 500));
}

/**
 * Renders a DOM node as a multi-page PDF and triggers download.
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  // Walk up to find the export wrapper (has data-export-wrapper attr, or use parent)
  let wrapper: HTMLElement | null = nodeRef.closest('[data-export-wrapper]') as HTMLElement;
  if (!wrapper) wrapper = nodeRef.parentElement;

  // Save original styles on wrapper so we can restore them
  const originalWrapperStyle = wrapper ? {
    visibility: wrapper.style.visibility,
    left: wrapper.style.left,
    top: wrapper.style.top,
    opacity: wrapper.style.opacity,
    zIndex: wrapper.style.zIndex,
  } : null;

  // Move the wrapper temporarily to a reachable location (far below the page)
  // and make it truly visible so charts render and html2canvas can capture.
  // It's still off-screen for the user because we scroll-lock below.
  if (wrapper) {
    wrapper.style.visibility = 'visible';
    wrapper.style.opacity = '1';
    wrapper.style.left = '0px';
    wrapper.style.top = '0px';
    wrapper.style.zIndex = '-1';
  }

  try {
    // Wait for content (charts, images, data) to be ready
    await waitForContentReady(nodeRef);

    // Capture node as canvas
    const canvas = await html2canvas(nodeRef, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      allowTaint: false,
      width: nodeRef.scrollWidth,
      height: nodeRef.scrollHeight,
      windowWidth: nodeRef.scrollWidth,
      windowHeight: nodeRef.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure cloned wrapper is fully visible for rendering
        const clonedWrappers = clonedDoc.querySelectorAll('[data-export-wrapper]');
        clonedWrappers.forEach(w => {
          const el = w as HTMLElement;
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          el.style.position = 'static';
          el.style.left = 'auto';
          el.style.top = 'auto';
          el.style.zIndex = 'auto';
        });

        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          [data-pdf-section], table, .card, [class*="rounded"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    // === Build PDF, slicing canvas into page-sized chunks ===
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    const ratio = contentWidth / canvas.width;
    const canvasPerPage = Math.floor(contentHeight / ratio);

    // Collect smart cut candidates
    const candidates = new Set<number>([0, canvas.height]);
    const scaleY = canvas.height / nodeRef.scrollHeight;

    const addCandidates = (sel: string) => {
      const nodeTop = nodeRef.getBoundingClientRect().top;
      nodeRef.querySelectorAll(sel).forEach(el => {
        const rect = el.getBoundingClientRect();
        const relBottom = rect.bottom - nodeTop;
        const y = Math.round(relBottom * scaleY);
        if (y > 0 && y < canvas.height) candidates.add(y);
      });
    };
    addCandidates('[data-pdf-section]');
    addCandidates('.card, [class*="card"]');
    addCandidates('table tbody tr');
    addCandidates('h1, h2, h3, h4');

    const sorted = Array.from(candidates).sort((a, b) => a - b);

    let lastCut = 0;
    let firstPage = true;

    while (lastCut < canvas.height) {
      const maxLimit = lastCut + canvasPerPage;

      // Find best candidate within [lastCut + 40% page, maxLimit]
      let nextCut = Math.min(maxLimit, canvas.height);
      const minAdvance = lastCut + canvasPerPage * 0.4;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const c = sorted[i];
        if (c >= minAdvance && c <= maxLimit) { nextCut = c; break; }
      }

      if (nextCut <= lastCut) {
        nextCut = Math.min(lastCut + canvasPerPage, canvas.height);
      }

      const sliceHeight = nextCut - lastCut;

      // Render slice to its own canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, lastCut, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      }

      if (!firstPage) pdf.addPage();
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceHeight * ratio);

      lastCut = nextCut;
      firstPage = false;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('[exportNodeAsPDF] Error:', err);
    throw err;
  } finally {
    // ALWAYS restore wrapper styles, even on error — so button never gets stuck
    if (wrapper && originalWrapperStyle) {
      wrapper.style.visibility = originalWrapperStyle.visibility;
      wrapper.style.opacity = originalWrapperStyle.opacity;
      wrapper.style.left = originalWrapperStyle.left;
      wrapper.style.top = originalWrapperStyle.top;
      wrapper.style.zIndex = originalWrapperStyle.zIndex;
    }
  }
}
