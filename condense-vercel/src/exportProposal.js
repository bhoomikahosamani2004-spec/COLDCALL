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

// Coordinate helpers

// Page is 1080 x 1440 pts (pdfplumber "top" = distance from top edge)

// pdf-lib uses Y from BOTTOM, so: pdfY = PAGE_H - top - textHeight

// ---------------------------------------------------------------------------

const PAGE_H = 1440;

const pdfY = (top, height = 0) => PAGE_H - top - height;
 
// ---------------------------------------------------------------------------

// main export — called by App.js as:

//   exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories,

//                       findIndustryUseCases, onStart, onDone, onError })

// ---------------------------------------------------------------------------
 
export async function exportProposalPDF({

  sel,

  selResearch,

  selMessages,

  selMatchedStories,

  findIndustryUseCases,

  onStart,

  onDone,

  onError,

}) {

  try {

    onStart?.();
 
    // ── Pull fields from sel (matches App.js prospect shape) ────────────────

    // sel.name     = prospect's full name (shown as contact on page 1)

    // sel.jobTitle = prospect's job title (shown as role on page 1)

    // sel.company  = company name (shown as "for [Company]" on page 1)

    // sel.industry = industry string (shown in heading on page 2)

    const company  = sel?.company  || "Your Company";

    const industry = sel?.industry || "Your Industry";

    const contact  = sel?.name     || "";   // ← was sel?.contact, now correctly sel?.name

    const role     = sel?.jobTitle || "";   // ← was sel?.role, now correctly sel?.jobTitle
 
    const researchData = selResearch || {};

    const data = findIndustryUseCases(company, industry, researchData);
 
    // ── Load the template from /public/Template.pdf ─────────────────────────

    const templateRes = await fetch("/Template.pdf");

    if (!templateRes.ok)

      throw new Error(

        "Could not fetch /Template.pdf — make sure it is in your /public folder"

      );

    const templateBytes = await templateRes.arrayBuffer();
 
    const pdfDoc  = await PDFDocument.load(templateBytes);

    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
 
    const BLACK = rgb(0,     0,     0);

    const WHITE = rgb(1,     1,     1);

    const BLUE  = rgb(0.118, 0.451, 0.745);
 
    const L     = 80;

    const MAX_W = 1080 - L - 80; // 920 pts
 
    // ════════════════════════════════════════════════════════════════════════

    // PAGE 1 — Customize "for [Company]" + contact name + role

    // Measured positions (pdfplumber):

    //   "for 3iInfotech"   top≈196, bottom≈220

    //   contact name       top≈168, bottom≈184

    //   role               top≈204, bottom≈220

    // ════════════════════════════════════════════════════════════════════════

    const page1 = pdfDoc.getPages()[0];
 
    // White-out "for 3iInfotech" area

    page1.drawRectangle({

      x: L,

      y: pdfY(226),

      width: 400,

      height: 40,

      color: WHITE,

      borderWidth: 0,

    });
 
    // Redraw "for [Company]"

    const FOR_SIZE   = 24;

    const forPrefix  = "for ";

    const forPrefixW = regular.widthOfTextAtSize(forPrefix, FOR_SIZE);

    page1.drawText(forPrefix, {

      x: L,

      y: pdfY(220, FOR_SIZE),

      size: FOR_SIZE, font: regular, color: BLACK,

    });

    page1.drawText(company, {

      x: L + forPrefixW,

      y: pdfY(220, FOR_SIZE),

      size: FOR_SIZE, font: bold, color: BLUE,

    });
 
    // White-out contact name + role area (right side of header)

    if (contact || role) {

      page1.drawRectangle({

        x: 760,

        y: pdfY(226),

        width: 260,

        height: 68,

        color: WHITE,

        borderWidth: 0,

      });
 
      if (contact) {

        page1.drawText(contact, {

          x: 765,

          y: pdfY(184, 16),

          size: 16, font: regular, color: BLACK,

        });

      }

      if (role) {

        page1.drawText(role, {

          x: 765,

          y: pdfY(220, 16),

          size: 16, font: regular, color: BLACK,

        });

      }

    }
 
    // ════════════════════════════════════════════════════════════════════════

    // PAGE 2 — Replace heading + placeholder lorem ipsum ONLY

    // Erase region: pdfplumber top=140 → top=460

    // Everything below (Success Stories, cards, CTA banner) stays untouched.

    // ════════════════════════════════════════════════════════════════════════

    const page2 = pdfDoc.getPages()[1];
 
    page2.drawRectangle({

      x: L - 4,

      y: pdfY(460),                  // bottom of erased area = 980

      width: MAX_W + 8,

      height: pdfY(140) - pdfY(460), // 1300 - 980 = 320

      color: WHITE,

      borderWidth: 0,

    });
 
    // ── Heading: "How Condense Helps [Industry]" ──────────────────────────

    const H_SIZE  = 40;

    const H_Y     = pdfY(180, H_SIZE);

    const prefix  = "How Condense Helps ";

    const prefixW = bold.widthOfTextAtSize(prefix, H_SIZE);

    page2.drawText(prefix, {

      x: L, y: H_Y, size: H_SIZE, font: bold, color: BLACK,

    });

    page2.drawText(industry, {

      x: L + prefixW, y: H_Y, size: H_SIZE, font: bold, color: BLUE,

    });
 
    // ── Intro paragraph ────────────────────────────────────────────────────

    const BODY = 20, LEAD = 30;

    let curY = H_Y - 52;
 
    if (data?.intro) {

      const introText = data.intro.replace(/\[COMPANY\]/g, company);

      curY = drawWrapped(page2, introText, {

        x: L, y: curY, font: regular, size: BODY,

        color: BLACK, maxWidth: MAX_W, leading: LEAD,

      });

      curY -= 28;

    }
 
    // ── Use-case cards (2 × 2 grid, max 4) ────────────────────────────────

    const useCases = (data?.use_cases || []).slice(0, 4);

    if (useCases.length > 0) {

      const GAP    = 20;

      const CW     = (MAX_W - GAP) / 2;

      const CH     = 160;

      const PX     = 20;

      const PY_PAD = 18;

      const TS     = 18, BS = 16, BL = 22;
 
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

          y: cy + CH - PY_PAD - TS,

          size: TS, font: bold, color: BLUE,

        });
 
        if (useCases[i].desc) {

          drawWrapped(page2, useCases[i].desc, {

            x: cx + PX,

            y: cy + CH - PY_PAD - TS - BL - 2,

            font: regular, size: BS, color: BLACK,

            maxWidth: CW - PX * 2, leading: BL,

          });

        }

      }
 
      curY -= Math.ceil(useCases.length / 2) * (CH + GAP) + 20;

    }
 
    // ── Closing paragraph (only if it fits above Success Stories) ─────────

    if (data?.closing && curY > pdfY(455)) {

      const closingText = data.closing.replace(/\[COMPANY\]/g, company);

      drawWrapped(page2, closingText, {

        x: L, y: curY, font: regular, size: BODY,

        color: BLACK, maxWidth: MAX_W, leading: LEAD,

      });

    }
 
    // Page 3 is completely untouched.
 
    // ── Save & trigger download ────────────────────────────────────────────

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
 
