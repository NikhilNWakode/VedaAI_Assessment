/**
 * client/src/lib/pdfExport.ts
 *
 * Renders each question block independently so no question is ever
 * sliced across a page boundary.
 *
 * Required: add  data-pdf-block  to every element you want treated as
 * an atomic unit (question rows, section headers, the paper header).
 * Anything NOT marked data-pdf-block is ignored.
 */
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const PAGE_W_MM  = 210;
const PAGE_H_MM  = 297;
const MARGIN_MM  = 12;
const CONTENT_W  = PAGE_W_MM - MARGIN_MM * 2;   // 186 mm
const CONTENT_H  = PAGE_H_MM - MARGIN_MM * 2;   // 273 mm

// A4 at 96 DPI = 794 px. Passed to html2canvas-pro so it never reads
// window.innerWidth (which is ~375 px on mobile).
const A4_WIDTH_PX = 794;

const SCALE = 2; // retina

/** px → mm conversion based on content column width */
function pxToMm(px: number, canvasWidth: number): number {
  // canvasWidth is at `scale` resolution; real px = canvasWidth / SCALE
  return (px / SCALE / (canvasWidth / SCALE)) * CONTENT_W;
}

async function blockToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: -window.scrollY,
    // ▼ KEY FIX: always use A4 width, never the device viewport
    windowWidth: A4_WIDTH_PX,
    windowHeight: document.documentElement.scrollHeight,
  });
}

export interface PdfExportOptions {
  filename?: string;
}

/**
 * Export to PDF block-by-block so nothing is ever sliced mid-question.
 *
 * Elements marked  data-pdf-block  are each rendered to their own canvas
 * and placed on the current page; if a block won't fit, a new page starts.
 *
 * @param root     The container element (e.g. #exam-paper-root)
 * @param options  { filename }
 */
export async function exportToPdf(
  root: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const { filename = "assessment.pdf" } = options;

  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>("[data-pdf-block]")
  );

  if (blocks.length === 0) {
    throw new Error(
      'No elements with [data-pdf-block] found inside the root. ' +
      'Add data-pdf-block to each question row and section header.'
    );
  }

  // ── Force root to A4 width before capturing any block ─────────────────
  // html2canvas-pro reads the element's rendered width when deciding how
  // to lay out its children.  On mobile, the root may be ~375 px wide;
  // pinning it to 794 px makes every block render at A4 proportions.
  const prevWidth    = root.style.width;
  const prevMaxWidth = root.style.maxWidth;
  const prevOverflow = root.style.overflow;

  root.style.width    = `${A4_WIDTH_PX}px`;
  root.style.maxWidth = `${A4_WIDTH_PX}px`;
  root.style.overflow = "visible";

  try {
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    let cursorY = MARGIN_MM; // current Y position on the active page

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const canvas = await blockToCanvas(block);

      const blockH_mm = pxToMm(canvas.height, canvas.width);
      const imgData   = canvas.toDataURL("image/jpeg", 0.95);

      // If this block won't fit on the current page, start a new one
      if (i > 0 && cursorY + blockH_mm > PAGE_H_MM - MARGIN_MM) {
        pdf.addPage();
        cursorY = MARGIN_MM;
      }

      // If a single block is taller than a full page, scale it to fit
      const drawH = Math.min(blockH_mm, CONTENT_H);
      const drawW = blockH_mm > CONTENT_H
        ? CONTENT_W * (CONTENT_H / blockH_mm)
        : CONTENT_W;

      pdf.addImage(imgData, "JPEG", MARGIN_MM, cursorY, drawW, drawH, undefined, "FAST");
      cursorY += drawH + 2; // 2 mm gap between blocks
    }

    pdf.save(filename);
  } finally {
    // ── Always restore original styles so the UI is unaffected ──────────
    root.style.width    = prevWidth;
    root.style.maxWidth = prevMaxWidth;
    root.style.overflow = prevOverflow;
  }
}

export async function downloadAssessmentPdf(
  elementId: string,
  title?: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const filename = title
    ? `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
    : "assessment.pdf";

  await exportToPdf(element, { filename });
}