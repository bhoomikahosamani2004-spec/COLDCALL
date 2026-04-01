import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
 
// ---------------------------------------------------------------------------

// helpers

// ---------------------------------------------------------------------------
 
function wrapText(text, font, fontSize, maxWidth) {

  const words = String(text || "").split(" ");

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

// main export — called by App.js as:

//   exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories,

//                       findIndustryUseCases, onStart, onDone, onError })

// ---------------------------------------------------------------------------
 
export async function exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories, findIndustryUseCases, onStart, onDone, onError }) {

  try {

    onStart?.();
 
    const company = sel.company;

    const industry = sel.industry || "";

    const researchData = selResearch || {};
 
    // Get industry use-case content

    const data = findIndustryUseCases(company, industry, researchData);
 
    // ── Load the 3-page template from /public/Template.pdf ──────────────────

    const templateRes = await fetch("/Template.pdf");

    if (!templateRes.ok) throw new Error("Could not fetch /Template.pdf — make sure it is in your /public folder");

    const templateBytes = await templateRes.arrayBuffer();
 
    const pdfDoc  = await PDFDocument.load(templateBytes);

    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
 
    // ── Constants ────────────────────────────────────────────────────────────

    const PAGE_H   = 1440;

    const L        = 80;

    const R_MARGIN = 80;

    const MAX_W    = 1080 - L - R_MARGIN; // 920 pts
 
    const BLACK = rgb(0,     0,     0);

    const WHITE = rgb(1,     1,     1);

    const BLUE  = rgb(0.118, 0.451, 0.745);
 
    // ── Page 2 — erase placeholder, write AI content ─────────────────────────

    const page2 = pdfDoc.getPages()[1];
 
    // White-out the placeholder region

    const ERASE_BOTTOM = PAGE_H - 460;

    const ERASE_TOP    = PAGE_H - 120;

    page2.drawRectangle({

      x: L - 4,

      y: ERASE_BOTTOM,

      width: MAX_W + 8,

      height: ERASE_TOP - ERASE_BOTTOM,

      color: WHITE,

      borderWidth: 0,

    });
 
    // Heading: "How Condense Helps [industry]"

    const H_SIZE  = 40;

    const H_Y     = PAGE_H - 180;

    const prefix  = "How Condense Helps ";

    const prefixW = bold.widthOfTextAtSize(prefix, H_SIZE);

    page2.drawText(prefix,   { x: L,           y: H_Y, size: H_SIZE, font: bold, color: BLACK });

    page2.drawText(industry, { x: L + prefixW, y: H_Y, size: H_SIZE, font: bold, color: BLUE  });
 
    // Intro paragraph

    let curY = H_Y - 48;

    const BODY = 20, LEAD = 28;

    if (data.intro) {

      curY = drawWrapped(page2, data.intro, {

        x: L, y: curY, font: regular, size: BODY,

        color: BLACK, maxWidth: MAX_W, leading: LEAD,

      });

      curY -= 24;

    }
 
    // Use-case cards (2 × 2 grid, max 4)

    const useCases = (data.use_cases || []).slice(0, 4);

    if (useCases.length > 0) {

      const GAP = 20;

      const CW  = (MAX_W - GAP) / 2;

      const CH  = 160;

      const PX  = 20, PY = 18;

      const TS  = 18, BS = 16, BL = 22;
 
      for (let i = 0; i < useCases.length; i++) {

        const col = i % 2;

        const row = Math.floor(i / 2);

        const cx  = L + col * (CW + GAP);

        const cy  = curY - row * (CH + GAP) - CH;
 
        page2.drawRectangle({

          x: cx, y: cy, width: CW, height: CH,

          color: rgb(0.97, 0.97, 0.97),

          borderColor: rgb(0.85, 0.85, 0.85),

          borderWidth: 1,

        });
 
        page2.drawText(useCases[i].title || "", {

          x: cx + PX,

          y: cy + CH - PY - TS,

          size: TS, font: bold, color: BLUE,

        });
 
        if (useCases[i].desc) {

          drawWrapped(page2, useCases[i].desc, {

            x: cx + PX,

            y: cy + CH - PY - TS - BL - 2,

            font: regular, size: BS, color: BLACK,

            maxWidth: CW - PX * 2, leading: BL,

          });

        }

      }
 
      curY -= Math.ceil(useCases.length / 2) * (CH + GAP) + 20;

    }
 
    // Closing paragraph

    if (data.closing) {

      drawWrapped(page2, data.closing, {

        x: L, y: curY, font: regular, size: BODY,

        color: BLACK, maxWidth: MAX_W, leading: LEAD,

      });

    }
 
    // Pages 1 and 3 are left exactly as they are in the template.
 
    // ── Save & trigger download ───────────────────────────────────────────────

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const url  = URL.createObjectURL(blob);

    const a    = document.createElement("a");

    a.href     = url;

    a.download = `${company}_Condense_Proposal.pdf`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
 
    onDone?.();
 
  } catch (err) {

    console.error("exportProposalPDF error:", err);

    onError?.(err);

  }

}
 
