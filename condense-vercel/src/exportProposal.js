import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
 
// ---------------------------------------------------------------------------
// safe() — strip non-latin1 glyphs so pdf-lib never crashes
// ---------------------------------------------------------------------------
function safe(str) {
  return String(str || "")
    .replace(/\u2193/g, "-").replace(/\u2191/g, "-").replace(/\u2192/g, "->")
    .replace(/\u00d7/g, "x").replace(/\u203a/g, ">").replace(/\u2039/g, "<")
    .replace(/\u2022/g, "-").replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"').replace(/\u2013/g, "-").replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...").replace(/\u00a0/g, " ").replace(/\u2713|\u2714/g, "+")
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, "");
}
 
// ---------------------------------------------------------------------------
// fitLines() — greedy word-wrap
// ---------------------------------------------------------------------------
function fitLines(text, { font, size, maxWidth, maxLines }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  let truncated = false;
 
  for (const word of words) {
    const cand = cur ? `${cur} ${word}` : word;
    if (font.widthOfTextAtSize(cand, size) > maxWidth && cur) {
      lines.push(cur);
      cur = word;
      if (lines.length === maxLines) { truncated = true; cur = ""; break; }
    } else {
      cur = cand;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
 
  if (truncated) {
    let last = lines[maxLines - 1];
    while (last.includes(" ") && font.widthOfTextAtSize(last + "...", size) > maxWidth) {
      last = last.substring(0, last.lastIndexOf(" "));
    }
    lines[maxLines - 1] = last + "...";
  }
 
  while (lines.length < maxLines) lines.push("");
  return lines;
}
 
// ---------------------------------------------------------------------------
// resolveIndustry()
// ---------------------------------------------------------------------------
function resolveIndustry(sel, research) {
  const raw = sel.industry || research.industry || research.sector || research.industryName || "";
  if (raw) return safe(raw);
  const overview = research.company_overview || "";
  const patterns = [
    [/\b(electric.?vehicle|EV charging|e-mobility)\b/i,  "Electric Vehicles"],
    [/\b(automotive|automobile)\b/i,                      "Automotive"],
    [/\b(telematics|fleet management|connected car)\b/i,  "Telematics & Fleet"],
    [/\b(e-?commerce|marketplace|D2C)\b/i,                "E-Commerce"],
    [/\b(retail|FMCG|consumer goods)\b/i,                 "Retail"],
    [/\b(fintech|neobank|payments|lending)\b/i,           "Fintech"],
    [/\b(banking|insurance|financial services)\b/i,       "Financial Services"],
    [/\b(healthcare|hospital|clinical|healthtech)\b/i,    "Healthcare"],
    [/\b(pharma|pharmaceutical|life sciences)\b/i,        "Pharma"],
    [/\b(logistics|supply chain|warehousing|freight)\b/i, "Logistics"],
    [/\b(gaming|fantasy sports|esports)\b/i,              "Gaming"],
    [/\b(SaaS|software|technology|IT services)\b/i,       "Technology"],
    [/\b(manufacturing|industrial|factory)\b/i,           "Manufacturing"],
    [/\b(telecom|telecommunications|ISP)\b/i,             "Telecom"],
    [/\b(edtech|education technology|e-learning)\b/i,     "EdTech"],
    [/\b(real estate|proptech|realty)\b/i,                "Real Estate"],
    [/\b(agri|agriculture|agtech|farming)\b/i,            "Agriculture"],
    [/\b(media|entertainment|streaming|OTT)\b/i,          "Media & Entertainment"],
  ];
  for (const [re, label] of patterns) { if (re.test(overview)) return label; }
  return "Technology";
}
 
// ---------------------------------------------------------------------------
// LOW_FIT_TEXT — standard sentence shown when condense_fit.score === "low"
// ---------------------------------------------------------------------------
const LOW_FIT_TEXT =
  "Go from Idea to production grade data pipeline in Minutes and build " +
  "vertical data pipelines through an AI-driven IDE while agents on " +
  "Condense handle Kafka, scale your logic and ensure uptime all inside " +
  "your cloud.";
 
// ---------------------------------------------------------------------------
// buildWhyText()
//   low fit  → always use LOW_FIT_TEXT
//   medium / high (or unknown) → 2nd sentence from research.why_condense_fits
// ---------------------------------------------------------------------------
function buildWhyText(research) {
  const fitScore = (research?.condense_fit?.score || "").toLowerCase();
 
  if (fitScore === "low") {
    return safe(LOW_FIT_TEXT);
  }
 
  // medium, high, or score not yet determined — pull 2nd sentence from research
  const raw = safe(
    research.why_condense_fits ||
    research.whyFit ||
    research.why_fit ||
    ""
  );
  if (!raw) return "";
  const sentences = raw.trim()
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  return sentences.slice(1, 2).join(" ");
}
 
// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export async function exportProposalPDF({
  sel, selResearch, onStart, onDone, onError, findIndustryUseCases
}) {
  try {
    onStart?.();
    if (!sel) throw new Error("No prospect selected");
 
    // Normalize company name: collapse multiple spaces, trim spaces inside brackets
    const company  = safe(sel.company || "Your Company")
                       .replace(/\s+/g, " ")
                       .replace(/\(\s+/g, "(")
                       .replace(/\s+\)/g, ")")
                       .trim();
    const contact  = safe(sel.name     || "");
    const role     = safe(sel.jobTitle || "");
    const research = selResearch || {};
 
    const industry = resolveIndustry(sel, research);
    const whyText  = buildWhyText(research);
 
    const industryUC = findIndustryUseCases
      ? findIndustryUseCases(sel.company, sel.industry || "", research)
      : null;
    const useCaseTitles = (industryUC?.use_cases || []).map(uc => safe(uc.title));
 
    const BASE = process.env.PUBLIC_URL || "";
 
    // ── Load template + fonts in parallel ───────────────────────────────────
    const [templateBytes, regularBytes, mediumBytes] = await Promise.all([
      fetch(`${BASE}/Template.pdf`).then(r => {
        if (!r.ok) throw new Error(`Template load failed: ${r.status}`);
        return r.arrayBuffer();
      }),
      fetch(`${BASE}/Manrope-Regular.ttf`).then(r => r.arrayBuffer()),
      fetch(`${BASE}/Manrope-Medium.ttf`).then(r => r.arrayBuffer()),
    ]);
 
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
 
    const fontRegular = await pdfDoc.embedFont(regularBytes); // 400 — body text
    const fontMedium  = await pdfDoc.embedFont(mediumBytes);  // 500 — headings
 
    // ── Design system colours ────────────────────────────────────────────────
    const WHITE     = rgb(1,          1,          1         );
    const BLUE      = rgb(37 / 255,  125 / 255,  240 / 255 ); // #257DF0
    const GREY_TEXT = rgb(118 / 255, 118 / 255,  120 / 255 ); // #767678
    const DARK      = rgb(28 / 255,   29 / 255,   33 / 255 ); // #1C1D21
 
    // pdf-lib: origin bottom-left, y increases upward.
    // All coordinates below measured from Template.pdf via pdfplumber.
    // Page = 1080 × 1440 pt. pdf-lib y = 1440 - pdfplumber_bottom.
    const H     = 1440;
    const L     = 80;   // left margin (pdfplumber x0=80)
    const MAX_W = 900;  // text width (pdfplumber x1 up to ~981)
 
    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1
    // ══════════════════════════════════════════════════════════════════════════
    const page1 = pdfDoc.getPages()[0];
 
    // ── "for [Company]"
    // pdfplumber: "for" x0=80 x1=111.6, company x0=116.4, top=196 bottom=220
    // pdf-lib baseline y = H - bottom = 1440 - 220 = 1220
    const FOR_SIZE  = 24;
    const FOR_Y     = H - 220; // 1220
    const forW      = fontMedium.widthOfTextAtSize("for", FOR_SIZE);
    const spaceW    = fontMedium.widthOfTextAtSize(" ",   FOR_SIZE);
 
    // Erase the full line width so leftover template text never bleeds through
    // when the company name is shorter than the original placeholder text.
    page1.drawRectangle({
      x: L - 2, y: FOR_Y - 4,
      width: MAX_W + 30, height: 30,
      color: WHITE,
    });
    page1.drawText("for",   { x: L,                 y: FOR_Y, size: FOR_SIZE, font: fontMedium, color: DARK });
    page1.drawText(company, { x: L + forW + spaceW, y: FOR_Y, size: FOR_SIZE, font: fontMedium, color: BLUE });
 
    // ── Contact name + Job title
    // pdfplumber: contact top=168 bottom=184 → pdf-lib y = H-184 = 1256
    //             role   top=204 bottom=220 → pdf-lib y = H-220 = 1220
    page1.drawRectangle({ x: 758, y: H - 260, width: 325, height: 110, color: WHITE });
    if (contact) {
      page1.drawText(contact, { x: 765, y: H - 184, size: 16, font: fontRegular, color: DARK });
    }
    if (role) {
      const ROLE_SIZE  = 16;
      const ROLE_MAX_W = 270;
      const roleLines  = fitLines(role, { font: fontRegular, size: ROLE_SIZE, maxWidth: ROLE_MAX_W, maxLines: 3 });
      const ROLE_Y     = [H - 220, H - 238, H - 256];
      roleLines.forEach((line, i) => {
        if (line) page1.drawText(line, { x: 765, y: ROLE_Y[i], size: ROLE_SIZE, font: fontRegular, color: GREY_TEXT });
      });
    }
 
    // ── "Why is Condense the Best Fit" — body text
    // pdfplumber placeholder: first line top=1260 bottom=1280, last line bottom=1364
    // pdf-lib erase zone: y = H-1364-4 = 72, height = (H-1260+4) - 72 = 112
    // 4 lines at 28pt leading fit in 112pt: y = 164, 136, 108, 80
    const WHY_SIZE = 20;
    const WHY_LEAD = 28;
    const WHY_TOP  = 164; // top line baseline in pdf-lib coords
    page1.drawRectangle({ x: L - 4, y: 72, width: MAX_W + 30, height: 112, color: WHITE });
    const whyLines = fitLines(whyText, { font: fontRegular, size: WHY_SIZE, maxWidth: MAX_W, maxLines: 4 });
    whyLines.forEach((line, i) => {
      if (line) page1.drawText(line, {
        x: L, y: WHY_TOP - i * WHY_LEAD,
        size: WHY_SIZE, font: fontRegular, color: GREY_TEXT,
      });
    });
 
    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2
    // ══════════════════════════════════════════════════════════════════════════
    const page2 = pdfDoc.getPages()[1];
 
    // ── Industry name: replace "(Industry Name)" only
    // pdfplumber: "(Industry" x0=464.75, top=140, bottom=180
    // pdf-lib: baseline y = H-180 = 1260, glyph top = H-140 = 1300
    // Next block starts at top=200 → pdf-lib y = H-200 = 1240
    // Erase from x=464, y=1238 (just below next block), height=66 (covers full glyph+descenders)
    const INDUSTRY_X    = 464;
    const INDUSTRY_Y    = H - 180; // 1260
    const INDUSTRY_SIZE = 40;
 
    page2.drawRectangle({
      x: INDUSTRY_X, y: 1238,
      width: 1000 - INDUSTRY_X, height: 66,
      color: WHITE,
    });
 
    let industrySize = INDUSTRY_SIZE;
    const INDUSTRY_AVAIL_W = 1000 - INDUSTRY_X - 4;
    while (industrySize > 20 && fontMedium.widthOfTextAtSize(industry, industrySize) > INDUSTRY_AVAIL_W) {
      industrySize -= 1;
    }
    page2.drawText(industry, {
      x: INDUSTRY_X,
      y: INDUSTRY_Y + (INDUSTRY_SIZE - industrySize) / 2,
      size: industrySize, font: fontMedium, color: BLUE,
    });
 
    // ── Use case body: erase placeholder and write titles
    // pdfplumber: placeholder top=200, last bottom=444
    // pdf-lib erase: y = H-444-4 = 992, height = (H-200+4)-992 = 252
    // 6 items at 43pt leading: y = 1216, 1173, 1130, 1087, 1044, 1001 — all within zone ✓
    page2.drawRectangle({ x: L - 4, y: 992, width: MAX_W + 30, height: 252, color: WHITE });
 
    if (useCaseTitles.length > 0) {
      const UC_SIZE     = 20;
      const UC_LEADING  = 43;
      const HYPHEN_X    = L;
      const TEXT_X      = L + fontRegular.widthOfTextAtSize("- ", UC_SIZE);
      const MAX_TITLE_W = MAX_W - (TEXT_X - L);
 
      useCaseTitles.slice(0, 6).forEach((title, i) => {
        const y = 1216 - i * UC_LEADING;
        page2.drawText("-", { x: HYPHEN_X, y, size: UC_SIZE, font: fontRegular, color: GREY_TEXT });
        let label = title;
        while (label.length > 5 && fontRegular.widthOfTextAtSize(label, UC_SIZE) > MAX_TITLE_W) {
          label = label.slice(0, -4) + "...";
        }
        page2.drawText(label, { x: TEXT_X, y, size: UC_SIZE, font: fontRegular, color: GREY_TEXT });
      });
    }
 
    // PAGE 3 — untouched
 
    // ── Save & download ──────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const blob     = new Blob([pdfBytes], { type: "application/pdf" });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement("a");
    a.href         = url;
    a.download     = `${company.replace(/\s+/g, "_")}_Condense_Proposal.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
 
    onDone?.();
  } catch (err) {
    console.error("exportProposalPDF error:", err);
    alert("PDF Export Failed: " + err.message);
    onError?.(err);
  }
}
