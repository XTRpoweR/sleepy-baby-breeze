
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders a DOM node as a PDF and triggers download.
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  // Wait for charts/components to fully render
  await new Promise(resolve => setTimeout(resolve, 1000));

  const canvas = await html2canvas(nodeRef, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: true,
    width: 850,
    height: nodeRef.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (clonedDoc, clonedElement) => {
      // Make the cloned element fully visible and properly positioned
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.opacity = '1';
      clonedElement.style.pointerEvents = 'auto';
      clonedElement.style.width = '850px';
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';

      // Fix the parent wrapper too
      let parent = clonedElement.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.position = 'static';
        parent.style.left = '0';
        parent.style.top = '0';
        parent.style.opacity = '1';
        parent.style.overflow = 'visible';
        parent.style.width = 'auto';
        parent.style.display = 'block';
        parent.style.visibility = 'visible';
        parent.style.pointerEvents = 'auto';
        parent = parent.parentElement;
      }

      // Remove all overflow/height restrictions from children
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const computed = window.getComputedStyle(htmlEl);
        if (computed.overflow !== 'visible') {
          htmlEl.style.overflow = 'visible';
        }
        if (computed.overflowY !== 'visible') {
          htmlEl.style.overflowY = 'visible';
        }
        if (computed.maxHeight && computed.maxHeight !== 'none') {
          htmlEl.style.maxHeight = 'none';
        }
        if (htmlEl.classList.contains('truncate')) {
          htmlEl.style.overflow = 'visible';
          htmlEl.style.textOverflow = 'unset';
          htmlEl.style.whiteSpace = 'normal';
        }
      });
    }
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('html2canvas returned empty canvas');
  }

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const marginX = 16;
  const marginY = 20;
  const usableWidth = pdfWidth - (marginX * 2);
  const usableHeight = pdfHeight - (marginY * 2);

  const ratio = usableWidth / canvas.width;
  const totalScaledHeight = canvas.height * ratio;

  // Single page
  if (totalScaledHeight <= usableHeight) {
    pdf.addImage(imgData, "PNG", marginX, marginY, usableWidth, totalScaledHeight);
    pdf.save(filename);
    return;
  }

  // Multi-page: slice canvas per page
  const canvasPerPage = usableHeight / ratio;
  let lastCut = 0;
  let pageNum = 0;

  while (lastCut < canvas.height - 5) {
    let nextCut = Math.min(lastCut + canvasPerPage, canvas.height);

    // Don't create a tiny last page
    if (canvas.height - nextCut < 100 && nextCut < canvas.height) {
      nextCut = canvas.height;
    }

    if (pageNum > 0) {
      pdf.addPage();
    }

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
        0, Math.floor(lastCut), canvas.width, Math.ceil(sliceHeight),
        0, 0, canvas.width, Math.ceil(sliceHeight)
      );
    }

    const sliceData = sliceCanvas.toDataURL("image/png");
    const imgHeight = sliceHeight * ratio;

    pdf.addImage(sliceData, "PNG", marginX, marginY, usableWidth, imgHeight);

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
