import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
 
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
// fitLines() — greedy word-wrap, no truncation unless truly overflows
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
// buildWhyText()
// ---------------------------------------------------------------------------
function buildWhyText(research) {
  const raw = safe(
    research.why_condense_fits ||
    research.whyFit ||
    research.why_fit ||
    ""
  );
  if (!raw) return "";
 
  const trimmed = raw.trim();
  const sentences = trimmed
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
 
    const company  = safe(sel.company  || "Your Company");
    const contact  = safe(sel.name     || "");
    const role     = safe(sel.jobTitle || "");
    const research = selResearch || {};
 
    const industry = resolveIndustry(sel, research);
    const whyText  = buildWhyText(research);
 
    const industryUC = findIndustryUseCases
      ? findIndustryUseCases(sel.company, sel.industry || "", research)
      : null;
    const useCaseTitles = (industryUC?.use_cases || []).map(uc => safe(uc.title));
 
    // ── Load template ────────────────────────────────────────────────────────
    const templateUrl = process.env.PUBLIC_URL
      ? `${process.env.PUBLIC_URL}/Template.pdf`
      : "/Template.pdf";
    const templateBytes = await fetch(templateUrl).then((r) => {
      if (!r.ok) throw new Error(`Failed to load template: ${r.status} ${r.statusText}`);
      return r.arrayBuffer();
    });
 
    const pdfDoc  = await PDFDocument.load(templateBytes);
    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
 
    const WHITE     = rgb(1,     1,     1);
    const BLUE      = rgb(0.118, 0.451, 0.745);
    const GREY_TEXT = rgb(0.30,  0.38,  0.47);
    const DARK      = rgb(0.04,  0.09,  0.16);
 
    // pdf-lib: origin bottom-left, y increases upward. Page = 1080 × 1440 pt.
    const H     = 1440;
    const L     = 80;
    const MAX_W = 920;
 
    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1
    // ══════════════════════════════════════════════════════════════════════════
    const page1 = pdfDoc.getPages()[0];
 
    // ── "for [Company]"
    const FOR_SIZE = 24;
    const FOR_STR  = "for ";
    const forW     = regular.widthOfTextAtSize(FOR_STR, FOR_SIZE);
    const compW    = bold.widthOfTextAtSize(company, FOR_SIZE);
    page1.drawRectangle({
      x: L - 2, y: H - 220,
      width: Math.max(forW + compW + 40, 700), height: 24,
      color: WHITE,
    });
    page1.drawText(FOR_STR, { x: L,        y: H - 220, size: FOR_SIZE, font: regular, color: DARK });
    page1.drawText(company,  { x: L + forW, y: H - 220, size: FOR_SIZE, font: bold,    color: BLUE });
 
    // ── Contact name + Job title
    page1.drawRectangle({ x: 758, y: H - 250, width: 325, height: 100, color: WHITE });
    if (contact) {
      page1.drawText(contact, { x: 765, y: H - 184, size: 16, font: regular, color: DARK });
    }
    if (role) {
      const ROLE_SIZE  = 16;
      const ROLE_MAX_W = 270;
      const roleLines  = fitLines(role, { font: regular, size: ROLE_SIZE, maxWidth: ROLE_MAX_W, maxLines: 3 });
      const ROLE_Y     = [H - 220, H - 238, H - 256];
      roleLines.forEach((line, i) => {
        if (line) page1.drawText(line, { x: 765, y: ROLE_Y[i], size: ROLE_SIZE, font: regular, color: GREY_TEXT });
      });
    }
 
    // ── "Why is Condense the Best Fit" body text
    page1.drawRectangle({ x: L - 4, y: 50, width: MAX_W + 30, height: 140, color: WHITE });
    const WHY_SIZE = 18;
    const WHY_Y    = [160, 132, 104, 76];
    const whyLines = fitLines(whyText, { font: regular, size: WHY_SIZE, maxWidth: MAX_W, maxLines: 4 });
    whyLines.forEach((line, i) => {
      if (line) page1.drawText(line, { x: L, y: WHY_Y[i], size: WHY_SIZE, font: regular, color: GREY_TEXT });
    });
 
    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2
    // ══════════════════════════════════════════════════════════════════════════
    const page2 = pdfDoc.getPages()[1];
 
    // ── Industry name: replace "(Industry Name)" only — do NOT touch the rest.
    //
    // Exact positions measured from Template.pdf with pdfplumber (y = top-from-top):
    //   "Help"      x0=371.29  x1=456.75  top=140  bottom=180
    //   "(Industry" x0=464.75  x1=638.03  top=140  bottom=180
    //   "Name)"     x0=646.03  x1=770.19  top=140  bottom=180
    //
    // pdf-lib y-from-bottom conversions (page height = 1440):
    //   baseline  = 1440 - 180 = 1260
    //   glyph top = 1440 - 140 = 1300
    //
    // Strategy: white-rectangle over x=464 to x=800, y=1256 to y=1304 (48pt tall),
    // then draw industry name in bold blue starting at x=464.
 
    const INDUSTRY_X    = 464;    // x0 of "(Industry" — pdfplumber exact
    const INDUSTRY_Y    = 1260;   // baseline in pdf-lib coords (H - 180)
    const INDUSTRY_SIZE = 40;     // same as template heading
 
    // Erase the placeholder — 4px padding above/below glyph bounds
    page2.drawRectangle({
      x:      INDUSTRY_X,
      y:      1238,
      width:  800 - INDUSTRY_X,
      height: 66,
      // extended down to y=1238 to cover descender artifacts
      color:  WHITE,
    });
 
    // Shrink font if industry name is too wide for remaining space
    const INDUSTRY_AVAIL_W = 800 - INDUSTRY_X - 4;
    let industrySize = INDUSTRY_SIZE;
    while (industrySize > 20 && bold.widthOfTextAtSize(industry, industrySize) > INDUSTRY_AVAIL_W) {
      industrySize -= 1;
    }
    // Keep vertically aligned with the 40pt baseline when shrunk
    const industryYAdj = (INDUSTRY_SIZE - industrySize) / 2;
    page2.drawText(industry, {
      x:    INDUSTRY_X,
      y:    INDUSTRY_Y + industryYAdj,
      size: industrySize,
      font: bold,
      color: BLUE,
    });
 
    // ── Use case body: erase Lorem ipsum placeholders and write use case titles.
    // pdfplumber page 2: placeholder paragraphs span top≈200 to bottom≈460
    // pdf-lib: y = H - 460 = 980  to  y = H - 200 = 1240  → height = 260
    page2.drawRectangle({ x: L - 4, y: 980, width: MAX_W + 30, height: 260, color: WHITE });
 
    if (useCaseTitles.length > 0) {
      const UC_SIZE     = 17;
      const UC_LEADING  = 40;       // 6 × 40 = 240px < 260px zone — fits cleanly
      const HYPHEN_X    = L;
      const TEXT_X      = L + 22;
      const MAX_TITLE_W = MAX_W - 26;
 
      useCaseTitles.slice(0, 6).forEach((title, i) => {
        const y = 1218 - i * UC_LEADING;
 
        page2.drawText("-", {
          x: HYPHEN_X, y,
          size: UC_SIZE, font: regular, color: GREY_TEXT,
        });
 
        let label = title;
        while (label.length > 5 && regular.widthOfTextAtSize(label, UC_SIZE) > MAX_TITLE_W) {
          label = label.slice(0, -4) + "...";
        }
        page2.drawText(label, {
          x: TEXT_X, y,
          size: UC_SIZE, font: regular, color: GREY_TEXT,
        });
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
