import html2canvas from "html2canvas-pro";

export async function downloadPDF(elementId: string, filename: string) {
  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error("Element not found");
  }

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],

    filename: `${filename}.pdf`,

    image: {
      type: "jpeg" as const,
      quality: 0.98,
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait" as const,
    },
  };

  // Override internal html2canvas
  html2pdf().set({
    ...opt,
    html2canvas,
  });

  await html2pdf()
    .set({
      ...opt,
      html2canvas,
    })
    .from(element)
    .save();
}