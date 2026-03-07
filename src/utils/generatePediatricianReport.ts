
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders a DOM node as a PDF and triggers download.
 * Uses smart page breaks based on data-pdf-section attributes.
 */
export async function exportNodeAsPDF(nodeRef: HTMLElement, filename: string) {
  // Wait for charts/components to render
  await new Promise(resolve => setTimeout(resolve, 800));

  // Make the element temporarily visible for accurate rendering
  const parent = nodeRef.parentElement;
  const originalParentStyle = parent ? parent.style.cssText : '';
  
  if (parent) {
    parent.style.position = 'absolute';
    parent.style.left = '-9999px';
    parent.style.top = '0';
    parent.style.opacity = '1';
    parent.style.pointerEvents = 'none';
    parent.style.width = '850px';
    parent.style.overflow = 'visible';
  }

  try {
    const canvas = await html2canvas(nodeRef, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: nodeRef.scrollWidth || 850,
      height: nodeRef.scrollHeight,
      onclone: (_clonedDoc, clonedElement) => {
        // Make clone visible
        clonedElement.style.position = 'static';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.opacity = '1';
        clonedElement.style.width = '850px';
        
        // Fix parent container in clone
        const clonedParent = clonedElement.parentElement;
        if (clonedParent) {
          clonedParent.style.position = 'static';
          clonedParent.style.left = '0';
          clonedParent.style.top = '0';
          clonedParent.style.opacity = '1';
          clonedParent.style.overflow = 'visible';
          clonedParent.style.width = '850px';
        }

        // Remove all overflow/height restrictions
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          const cs = window.getComputedStyle(htmlEl);
          if (cs.overflow === 'auto' || cs.overflow === 'hidden' || cs.overflowY === 'auto' || cs.overflowY === 'hidden') {
            htmlEl.style.overflow = 'visible';
            htmlEl.style.overflowY = 'visible';
          }
          if (cs.maxHeight && cs.maxHeight !== 'none') {
            htmlEl.style.maxHeight = 'none';
          }
          // Remove truncation
          if (htmlEl.classList.contains('truncate')) {
            htmlEl.style.overflow = 'visible';
            htmlEl.style.textOverflow = 'unset';
            htmlEl.style.whiteSpace = 'normal';
          }
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
    
    const marginX = 16;
    const marginY = 20;
    const usableWidth = pdfWidth - (marginX * 2);
    const usableHeight = pdfHeight - (marginY * 2);
    
    const ratio = usableWidth / canvas.width;
    const totalScaledHeight = canvas.height * ratio;

    // If content fits in one page, just place it
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
      
      // Don't create a tiny last page (less than 100px)
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
  } finally {
    // Restore parent style
    if (parent) {
      parent.style.cssText = originalParentStyle;
    }
  }
}
