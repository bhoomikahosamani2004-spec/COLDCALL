import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrapped(page, text, { x, y, font, size, color, maxWidth, leading }) {
  let curY = y;
  for (const line of wrapText(text, font, size, maxWidth)) {
    page.drawText(line, { x, y: curY, size, font, color });
    curY -= leading;
  }
  return curY;
}

// ---------------------------------------------------------------------------
// main export function
// ---------------------------------------------------------------------------

export async function exportProposal(company, industry, researchData, findIndustryUseCases) {
  // 1. Get AI-generated content
  const data = findIndustryUseCases(company, industry, researchData);

  // 2. Load the original 3-page template exactly as-is
  const templateBytes = await fetch("/Template.pdf").then((r) => {
    if (!r.ok) throw new Error("Could not fetch /Template.pdf");
    return r.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(templateBytes);

  // 3. Embed fonts
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ---------------------------------------------------------------------------
  // Page 2 (index 1) — erase placeholder block, write AI content
  // ---------------------------------------------------------------------------
  // Template is 1080 × 1440 PDF points.
  // pdfplumber measures top-down from top-left.
  // pdf-lib measures bottom-up from bottom-left.
  // Conversion: pdf_y = pageHeight - pdfplumber_top
  //
  // Placeholder region (measured from pdfplumber output):
  //   heading  top=140, bottom=180   → pdf_y top = 1440-140 = 1300
  //   lorem #2 top=424, bottom=444   → pdf_y bottom = 1440-444 = 996
  //   "Success Stories" starts at pdfplumber top=480 → leave that untouched
  // We white-out from pdf_y=996 up to pdf_y=1310 (a little above the heading)
  // ---------------------------------------------------------------------------

  const PAGE_W  = 1080;
  const PAGE_H  = 1440;
  const L       = 80;           // left margin (matches template)
  const R_MARGIN = 80;
  const MAX_W   = PAGE_W - L - R_MARGIN;  // 920 pts usable width

  const BLACK = rgb(0, 0, 0);
  const WHITE = rgb(1, 1, 1);
  const BLUE  = rgb(0.118, 0.451, 0.745); // #1E73BE

  const page2 = pdfDoc.getPages()[1];

  // --- erase placeholder ---
  const ERASE_BOTTOM = PAGE_H - 460; // pdf_y = 1440 - 460 = 980  (just above "Success Stories")
  const ERASE_TOP    = PAGE_H - 120; // pdf_y = 1440 - 120 = 1320 (above heading)
  page2.drawRectangle({
    x: L - 4,
    y: ERASE_BOTTOM,
    width: MAX_W + 8,
    height: ERASE_TOP - ERASE_BOTTOM,
    color: WHITE,
    borderWidth: 0,
  });

  // --- heading: "How Condense Helps [industry]" ---
  const H_SIZE   = 40;
  const H_Y      = PAGE_H - 180;   // pdf_y ≈ 1260  (matches original heading baseline)
  const prefix   = "How Condense Helps ";
  const prefixW  = bold.widthOfTextAtSize(prefix, H_SIZE);

  page2.drawText(prefix, { x: L, y: H_Y, size: H_SIZE, font: bold, color: BLACK });
  page2.drawText(industry, { x: L + prefixW, y: H_Y, size: H_SIZE, font: bold, color: BLUE });

  // --- intro paragraph ---
  let curY = H_Y - 48;
  const BODY_SIZE = 20;
  const LEADING   = 28;

  if (data.intro) {
    curY = drawWrapped(page2, data.intro, {
      x: L, y: curY, font: regular, size: BODY_SIZE,
      color: BLACK, maxWidth: MAX_W, leading: LEADING,
    });
    curY -= 24;
  }

  // --- use-case cards (2 × 2 grid, max 4) ---
  const useCases = (data.use_cases || []).slice(0, 4);
  if (useCases.length > 0) {
    const GAP       = 20;
    const CARD_W    = (MAX_W - GAP) / 2;
    const CARD_H    = 160;
    const PAD_X     = 20;
    const PAD_Y     = 18;
    const T_SIZE    = 18;
    const B_SIZE    = 16;
    const B_LEADING = 22;

    for (let i = 0; i < useCases.length; i++) {
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const cardX = L + col * (CARD_W + GAP);
      const cardY = curY - row * (CARD_H + GAP) - CARD_H;

      // card background + border
      page2.drawRectangle({
        x: cardX, y: cardY, width: CARD_W, height: CARD_H,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1,
      });

      // card title (blue bold)
      page2.drawText(useCases[i].title || "", {
        x: cardX + PAD_X,
        y: cardY + CARD_H - PAD_Y - T_SIZE,
        size: T_SIZE, font: bold, color: BLUE,
      });

      // card body (wrapped)
      if (useCases[i].desc) {
        drawWrapped(page2, useCases[i].desc, {
          x: cardX + PAD_X,
          y: cardY + CARD_H - PAD_Y - T_SIZE - B_LEADING - 2,
          font: regular, size: B_SIZE, color: BLACK,
          maxWidth: CARD_W - PAD_X * 2,
          leading: B_LEADING,
        });
      }
    }

    const rows = Math.ceil(useCases.length / 2);
    curY -= rows * (CARD_H + GAP) + 20;
  }

  // --- closing paragraph ---
  if (data.closing) {
    drawWrapped(page2, data.closing, {
      x: L, y: curY, font: regular, size: BODY_SIZE,
      color: BLACK, maxWidth: MAX_W, leading: LEADING,
    });
  }

  // ---------------------------------------------------------------------------
  // Pages 1 and 3 are untouched — the template is already loaded with all 3.
  // pdfDoc already contains all 3 pages exactly as in the original file.
  // ---------------------------------------------------------------------------

  // 4. Save and trigger download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href     = url;
  a.download = `${company}_Condense_Proposal.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
