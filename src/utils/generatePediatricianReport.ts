import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Wait for charts (SVG/recharts) and images to finish rendering inside a node.
 */
async function waitForContentReady(node: HTMLElement, maxWaitMs = 4000) {
  const start = Date.now();

  // 1. Wait for all images to load
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(() => resolve(), 2000);
      });
    })
  );

  // 2. Wait for recharts / SVG charts to render (they render after a tick)
  // Loop until either charts are present with children, or timeout
  while (Date.now() - start < maxWaitMs) {
    const svgs = node.querySelectorAll('svg');
    const rechartsContainers = node.querySelectorAll('.recharts-wrapper, .recharts-surface');

    // If we have charts and they all have rendered content, we're good
    if (rechartsContainers.length === 0) {
      // No charts at all, just wait one frame to be safe
      await new Promise(r => requestAnimationFrame(() => r(null)));
      break;
    }

    let allReady = true;
    rechartsContainers.forEach(el => {
      if (el.children.length === 0) allReady = false;
    });

    if (allReady && svgs.length > 0) {
      // Double-buffer: one more animation frame for safety
      await new Promise(r => requestAnimationFrame(() => r(null)));
      await new Promise(r => requestAnimationFrame(() => r(null)));
      break;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  // 3. Final safety delay to allow any pending state updates / data fetches to settle
  await new Promise(r => setTimeout(r, 800));
}

/**
 * Renders a DOM node as a PDF and triggers download.
 * Temporarily makes the hidden export container visible off-screen so html2canvas
 * can capture fully-rendered charts and loaded data.
 * @param nodeRef - ref to the DOM node to render as PDF
 * @param filename - name of the resulting PDF
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  // === Step 1: Make the node visible for capture (without showing it to the user) ===
  // Save original styles to restore later
  const originalStyles = {
    opacity: nodeRef.style.opacity,
    pointerEvents: nodeRef.style.pointerEvents,
    visibility: nodeRef.style.visibility,
  };

  // Also walk up to the hidden wrapper (which has position:fixed; left:-9999px)
  // and temporarily bring it on-screen but off the viewport to keep it invisible
  const hiddenWrapper = nodeRef.parentElement;
  const originalWrapperStyles = hiddenWrapper ? {
    opacity: hiddenWrapper.style.opacity,
    pointerEvents: hiddenWrapper.style.pointerEvents,
    visibility: hiddenWrapper.style.visibility,
  } : null;

  // Force the node (and its wrapper) to render fully
  nodeRef.style.opacity = '1';
  nodeRef.style.visibility = 'visible';
  nodeRef.style.pointerEvents = 'none';
  if (hiddenWrapper) {
    hiddenWrapper.style.opacity = '1';
    hiddenWrapper.style.visibility = 'visible';
    hiddenWrapper.style.pointerEvents = 'none';
  }

  try {
    // === Step 2: Wait for data + charts to be fully ready ===
    await waitForContentReady(nodeRef);

    // === Step 3: Capture the node as a canvas ===
    const canvas = await html2canvas(nodeRef, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: nodeRef.scrollWidth,
      windowHeight: nodeRef.scrollHeight,
      width: nodeRef.scrollWidth,
      height: nodeRef.scrollHeight,
      foreignObjectRendering: false,
      onclone: (clonedDoc, clonedNode) => {
        // Force the cloned node visible & positioned normally so it renders
        const el = clonedNode as HTMLElement;
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.position = 'static';
        el.style.left = 'auto';
        el.style.top = 'auto';
        el.style.transform = 'none';
        // Also bring cloned wrapper out of fixed off-screen position
        if (el.parentElement) {
          el.parentElement.style.position = 'static';
          el.parentElement.style.left = 'auto';
          el.parentElement.style.top = 'auto';
          el.parentElement.style.opacity = '1';
          el.parentElement.style.visibility = 'visible';
        }

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
          [data-pdf-section] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    // === Step 4: Build the PDF, slicing the canvas into real page-sized chunks ===
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 20;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    const ratio = contentWidth / canvas.width;
    const canvasPerPage = Math.floor(contentHeight / ratio);

    const fitMode = nodeRef.getAttribute('data-pdf-fit');

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

    // Collect smart cut candidates (in canvas pixel coords)
    const candidates = new Set<number>([0, canvas.height]);
    const scaleFactor = canvas.height / nodeRef.scrollHeight;

    const addCandidates = (selector: string) => {
      const els = nodeRef.querySelectorAll(selector);
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        const nodeRect = nodeRef.getBoundingClientRect();
        const relBottom = rect.bottom - nodeRect.top;
        const y = Math.round(relBottom * scaleFactor);
        if (y > 0 && y < canvas.height) candidates.add(y);
      });
    };

    addCandidates('[data-pdf-section]');
    addCandidates('table tbody tr');
    addCandidates('.card, [class*="card"]');
    addCandidates('h1, h2, h3, h4');

    const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);

    // Slice canvas into real page-sized chunks and paste each as its own image
    let lastCut = 0;
    let isFirstPage = true;

    while (lastCut < canvas.height) {
      const maxLimit = lastCut + canvasPerPage;

      // Find the best candidate within the page
      let nextCut = Math.min(maxLimit, canvas.height);
      for (let i = sortedCandidates.length - 1; i >= 0; i--) {
        const c = sortedCandidates[i];
        if (c > lastCut + canvasPerPage * 0.4 && c <= maxLimit) {
          nextCut = c;
          break;
        }
      }

      // Never advance less than 40% of a page (avoid tiny pages)
      if (nextCut - lastCut < canvasPerPage * 0.4 && maxLimit < canvas.height) {
        nextCut = maxLimit;
      }

      if (nextCut <= lastCut) {
        nextCut = Math.min(lastCut + canvasPerPage, canvas.height);
      }

      const sliceHeight = nextCut - lastCut;

      // Create a fresh canvas for this page's slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0, lastCut, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );
      }

      const sliceImgData = pageCanvas.toDataURL("image/png");

      if (!isFirstPage) pdf.addPage();

      const sliceImgHeight = sliceHeight * ratio;
      pdf.addImage(sliceImgData, "PNG", margin, margin, contentWidth, sliceImgHeight);

      lastCut = nextCut;
      isFirstPage = false;
    }

    pdf.save(filename);
  } finally {
    // === Step 5: Restore original styles so the hidden container goes back to hidden ===
    nodeRef.style.opacity = originalStyles.opacity;
    nodeRef.style.pointerEvents = originalStyles.pointerEvents;
    nodeRef.style.visibility = originalStyles.visibility;
    if (hiddenWrapper && originalWrapperStyles) {
      hiddenWrapper.style.opacity = originalWrapperStyles.opacity;
      hiddenWrapper.style.pointerEvents = originalWrapperStyles.pointerEvents;
      hiddenWrapper.style.visibility = originalWrapperStyles.visibility;
    }
  }
}
