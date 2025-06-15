
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
    backgroundColor: "#fff"
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  // Fit the image to the width of the page, preserve ratio
  const imgProps = {
    width: canvas.width,
    height: canvas.height
  };
  const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
  const imgWidth = imgProps.width * ratio;
  const imgHeight = imgProps.height * ratio;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  pdf.save(filename);
}
