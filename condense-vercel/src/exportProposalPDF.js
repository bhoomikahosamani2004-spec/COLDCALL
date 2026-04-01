import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ---------------------------------------------------------------------------
// Helpers
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

// Page constants — 1080 x 1440 pt (same as your original template)
const W = 1080;
const H = 1440;
const L = 80;   // left margin
const R = 1000; // right edge
const MAX_W = R - L;

// ---------------------------------------------------------------------------
// Colour palette (matches Zeliot brand)
// ---------------------------------------------------------------------------
const BLACK      = rgb(0.04,  0.09,  0.16);
const WHITE      = rgb(1,     1,     1);
const BLUE       = rgb(0.118, 0.451, 0.745);
const BLUE_LIGHT = rgb(0.88,  0.93,  0.98);
const GREY_BG    = rgb(0.97,  0.97,  0.97);
const GREY_MID   = rgb(0.85,  0.85,  0.85);
const GREY_TEXT  = rgb(0.30,  0.38,  0.47);
const DARK_NAVY  = rgb(0.04,  0.145, 0.25);
const GREEN      = rgb(0.05,  0.62,  0.43);
const GREEN_LIGHT= rgb(0.88,  0.97,  0.93);

// ---------------------------------------------------------------------------
// Draw shared header (logo + page number)
// ---------------------------------------------------------------------------
function drawHeader(page, bold, regular, pageNum) {
  // Top thin blue bar
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: BLUE });

  // ZELIOT logo text
  page.drawText("ZELIOT", {
    x: L, y: H - 52,
    size: 22, font: bold, color: DARK_NAVY,
  });
  // dot accent on ZELIOT
  page.drawCircle({ x: L + 113, y: H - 44, size: 4, color: BLUE });

  // Page number top right
  page.drawText(`Page ${pageNum}/3`, {
    x: R - 60, y: H - 48,
    size: 11, font: regular, color: GREY_TEXT,
  });

  // Horizontal rule under header
  page.drawLine({
    start: { x: L, y: H - 64 },
    end:   { x: R, y: H - 64 },
    thickness: 0.75,
    color: GREY_MID,
  });
}

// ---------------------------------------------------------------------------
// Draw shared footer
// ---------------------------------------------------------------------------
function drawFooter(page, regular) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 50, color: BLUE_LIGHT });
  page.drawLine({ start: { x: 0, y: 50 }, end: { x: W, y: 50 }, thickness: 1, color: BLUE });
  const footerItems = [
    { text: "www.zeliot.in",           x: L },
    { text: "Veera Raghavan: +91 935 309 4136", x: W / 2 - 120 },
    { text: "sales@zeliot.in",          x: R - 120 },
  ];
  footerItems.forEach(({ text, x }) => {
    page.drawText(text, { x, y: 18, size: 11, font: regular, color: BLUE });
  });
}

// ---------------------------------------------------------------------------
// PAGE 1 — Cover / What is Condense?
// ---------------------------------------------------------------------------
function buildPage1(pdfDoc, bold, regular, italic, company, contact, role) {
  const page = pdfDoc.addPage([W, H]);

  drawHeader(page, bold, regular, 1);

  // ── Sub-label ──
  page.drawText("BUSINESS PROPOSAL", {
    x: L, y: H - 96,
    size: 9, font: bold, color: BLUE,
    // letter spacing simulation via separate chars not needed — just draw
  });

  // ── Main title ──
  page.drawText("Real Time Data Intelligence", {
    x: L, y: H - 130,
    size: 26, font: bold, color: DARK_NAVY,
  });
  page.drawText("for ", {
    x: L, y: H - 164,
    size: 26, font: regular, color: DARK_NAVY,
  });
  const forW = regular.widthOfTextAtSize("for ", 26);
  page.drawText(company, {
    x: L + forW, y: H - 164,
    size: 26, font: bold, color: BLUE,
  });

  // ── Contact info (right side) ──
  if (contact) {
    // Person icon placeholder (circle)
    page.drawCircle({ x: R - 220, y: H - 122, size: 7, color: GREY_TEXT });
    page.drawText(contact, { x: R - 208, y: H - 128, size: 13, font: regular, color: DARK_NAVY });
  }
  if (role) {
    // Briefcase icon placeholder
    page.drawRectangle({ x: R - 221, y: H - 154, width: 12, height: 9, color: GREY_TEXT, borderWidth: 0 });
    page.drawText(role, { x: R - 208, y: H - 160, size: 13, font: regular, color: DARK_NAVY });
  }

  // ── Divider ──
  page.drawLine({ start: { x: L, y: H - 192 }, end: { x: R, y: H - 192 }, thickness: 0.5, color: GREY_MID });

  // ── What is Condense? heading ──
  page.drawText("What is ", { x: L, y: H - 248, size: 36, font: bold, color: DARK_NAVY });
  const w1 = bold.widthOfTextAtSize("What is ", 36);
  page.drawText("Condense?", { x: L + w1, y: H - 248, size: 36, font: bold, color: BLUE });

  // ── Condense description ──
  const desc1 = "Condense is an AI-first streaming platform that unifies how real-time data pipelines are built and managed.";
  const desc2 = "Running as a BYOC (Bring Your Own Cloud) deployment, Condense continuously manages and scales deployments while optimizing costs, creating a closed intelligent loop where pipelines are built faster, run autonomously, and continuously adapt to live data.";
  let y = H - 290;
  y = drawWrapped(page, desc1, { x: L, y, font: regular, size: 16, color: DARK_NAVY, maxWidth: MAX_W, leading: 24 });
  y -= 10;
  y = drawWrapped(page, desc2, { x: L, y, font: regular, size: 16, color: GREY_TEXT, maxWidth: MAX_W, leading: 24 });

  // ── Architecture diagram (simplified boxes) ──
  y -= 28;
  const diagY = y;
  const diagH = 320;

  // Outer dashed border (simulated with a thin rectangle)
  page.drawRectangle({ x: L, y: diagY - diagH, width: MAX_W, height: diagH, color: rgb(0.97, 0.98, 1), borderColor: BLUE, borderWidth: 1.5 });

  // Cloud Marketplace label
  page.drawRectangle({ x: W / 2 - 180, y: diagY - 14, width: 360, height: 28, color: BLUE, borderWidth: 0 });
  page.drawText("Cloud Marketplace Deployment on Customer's Cloud - BYOC", {
    x: W / 2 - 172, y: diagY - 8, size: 11, font: bold, color: WHITE,
  });

  // Three columns: SOURCE | TRANSFORMATION | SINK
  const colW = 280;
  const col1X = L + 16;
  const col2X = col1X + colW + 16;
  const col3X = col2X + colW + 16;
  const colTop = diagY - 50;
  const colH = 180;

  [[col1X, "SOURCE"], [col2X, "TRANSFORMATION"], [col3X, "SINK"]].forEach(([cx, label]) => {
    page.drawRectangle({ x: cx, y: colTop - colH, width: colW, height: colH, color: WHITE, borderColor: rgb(0.8, 0.88, 0.96), borderWidth: 1 });
    page.drawText(label, { x: cx + 8, y: colTop - 20, size: 11, font: bold, color: BLUE });
  });

  // SOURCE content
  page.drawText("Universal", { x: col1X + 10, y: colTop - 44, size: 11, font: regular, color: GREY_TEXT });
  ["Databases", "APIs", "IoT Devices", "Files & Streams"].forEach((item, i) => {
    page.drawText("• " + item, { x: col1X + 10, y: colTop - 68 - i * 20, size: 10, font: regular, color: GREY_TEXT });
  });

  // TRANSFORMATION content
  page.drawText("No Code / Low Code Utilities", { x: col2X + 8, y: colTop - 44, size: 10, font: bold, color: DARK_NAVY });
  ["Split", "Filter", "Alert", "Merge", "Transform"].forEach((item, i) => {
    page.drawRectangle({ x: col2X + 8 + (i % 3) * 86, y: colTop - 76 - Math.floor(i / 3) * 28, width: 76, height: 22, color: BLUE_LIGHT, borderWidth: 0 });
    page.drawText(item, { x: col2X + 20 + (i % 3) * 86, y: colTop - 68 - Math.floor(i / 3) * 28, size: 10, font: regular, color: BLUE });
  });

  // SINK content
  page.drawText("DBs & Warehouses", { x: col3X + 8, y: colTop - 44, size: 10, font: bold, color: DARK_NAVY });
  page.drawText("Postgres, Mongo, Snowflake", { x: col3X + 8, y: colTop - 62, size: 9, font: regular, color: GREY_TEXT });
  page.drawText("API / Webhook", { x: col3X + 8, y: colTop - 88, size: 10, font: bold, color: DARK_NAVY });
  page.drawText("REST, gRPC", { x: col3X + 8, y: colTop - 106, size: 9, font: regular, color: GREY_TEXT });

  // Arrows between columns
  [[col1X + colW, col2X], [col2X + colW, col3X]].forEach(([fromX, toX]) => {
    const arrowY = colTop - colH / 2;
    page.drawLine({ start: { x: fromX + 4, y: arrowY }, end: { x: toX - 4, y: arrowY }, thickness: 2, color: BLUE });
  });

  // Agentic Intelligence Layer bar
  const layerY = colTop - colH - 18;
  page.drawRectangle({ x: L + 16, y: layerY - 28, width: MAX_W - 32, height: 28, color: rgb(0.9, 0.95, 1), borderColor: BLUE, borderWidth: 1 });
  page.drawText("Agentic Intelligence Layer   Dev Agent   QA Agent   K8s Agent   Monitoring Agent   Kafka Agent   Git Agent", {
    x: L + 24, y: layerY - 18, size: 9, font: regular, color: BLUE,
  });

  // High Throughput bar
  page.drawRectangle({ x: L + 16, y: layerY - 62, width: MAX_W - 32, height: 24, color: GREY_BG, borderColor: GREY_MID, borderWidth: 1 });
  page.drawText("High Throughput Streaming Foundation  |  Powered by Fully Managed Kafka  |  Networking  |  Caching", {
    x: L + 24, y: layerY - 52, size: 9, font: regular, color: GREY_TEXT,
  });

  // Bottom pill tags
  const tags = ["Managed Infrastructure", "Scalability", "Observability", "Security Compliant"];
  const tagW = 200, tagH = 30, tagGap = (MAX_W - tags.length * tagW) / (tags.length + 1);
  tags.forEach((tag, i) => {
    const tx = L + tagGap + i * (tagW + tagGap);
    const ty = diagY - diagH + 10;
    page.drawRectangle({ x: tx, y: ty, width: tagW, height: tagH, color: WHITE, borderColor: BLUE, borderWidth: 1.2 });
    const tw = regular.widthOfTextAtSize(tag, 11);
    page.drawText(tag, { x: tx + (tagW - tw) / 2, y: ty + 10, size: 11, font: regular, color: BLUE });
  });

  // ── "Why is Condense the Best Fit" heading ──
  const fitY = diagY - diagH - 48;
  page.drawText("Why is ", { x: L, y: fitY, size: 30, font: bold, color: DARK_NAVY });
  const w2 = bold.widthOfTextAtSize("Why is ", 30);
  page.drawText("Condense", { x: L + w2, y: fitY, size: 30, font: bold, color: BLUE });
  const w3 = bold.widthOfTextAtSize("Condense", 30);
  page.drawText(" the Best Fit for Your Company", { x: L + w2 + w3, y: fitY, size: 30, font: bold, color: DARK_NAVY });

  // Placeholder text box (will be overwritten on page 2 for industry content)
  const placeholderY = fitY - 30;
  drawWrapped(page, `Condense is purpose-built for companies like ${company} that need real-time data pipelines to power analytics, automation, and AI initiatives at scale — without the complexity of managing distributed streaming infrastructure.`, {
    x: L, y: placeholderY, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24,
  });

  drawFooter(page, regular);
  return page;
}

// ---------------------------------------------------------------------------
// PAGE 2 — How Condense Helps [Industry] + Success Stories
// ---------------------------------------------------------------------------
function buildPage2(pdfDoc, bold, regular, company, industry, data) {
  const page = pdfDoc.addPage([W, H]);
  drawHeader(page, bold, regular, 2);

  // ── Heading ──
  const headY = H - 110;
  page.drawText("How Condense Helps ", { x: L, y: headY, size: 36, font: bold, color: DARK_NAVY });
  const hw = bold.widthOfTextAtSize("How Condense Helps ", 36);
  page.drawText(industry, { x: L + hw, y: headY, size: 36, font: bold, color: BLUE });

  // ── Intro paragraph ──
  let curY = headY - 44;
  if (data?.intro) {
    const introText = data.intro.replace(/\[COMPANY\]/g, company);
    curY = drawWrapped(page, introText, {
      x: L, y: curY, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24,
    });
  }
  curY -= 24;

  // ── Use-case cards (2×2 grid) ──
  const useCases = (data?.use_cases || []).slice(0, 4);
  if (useCases.length > 0) {
    const GAP = 20, CW = (MAX_W - GAP) / 2, CH = 150;
    const PX = 16, PY_PAD = 16, TS = 15, BS = 13, BL = 20;
    for (let i = 0; i < useCases.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = L + col * (CW + GAP);
      const cy = curY - row * (CH + GAP) - CH;
      page.drawRectangle({ x: cx, y: cy, width: CW, height: CH, color: GREY_BG, borderColor: GREY_MID, borderWidth: 1 });
      page.drawRectangle({ x: cx, y: cy + CH - 4, width: CW, height: 4, color: BLUE, borderWidth: 0 });
      page.drawText(useCases[i].title || "", {
        x: cx + PX, y: cy + CH - PY_PAD - TS, size: TS, font: bold, color: BLUE,
      });
      if (useCases[i].desc) {
        drawWrapped(page, useCases[i].desc, {
          x: cx + PX, y: cy + CH - PY_PAD - TS - BL - 2,
          font: regular, size: BS, color: GREY_TEXT, maxWidth: CW - PX * 2, leading: BL,
        });
      }
    }
    curY -= Math.ceil(useCases.length / 2) * (CH + GAP) + 16;
  }

  // ── Closing line ──
  if (data?.closing && curY > 460) {
    curY = drawWrapped(page, data.closing.replace(/\[COMPANY\]/g, company), {
      x: L, y: curY, font: regular, size: 14, color: GREY_TEXT, maxWidth: MAX_W, leading: 22,
    });
    curY -= 20;
  }

  // ── Success Stories heading ──
  page.drawText("Success Stories", { x: L, y: curY, size: 30, font: bold, color: DARK_NAVY });
  curY -= 36;

  // ── 4 story cards ──
  const stories = [
    {
      logo: "VOLVO × EICHER", tag: "OEM",
      title: "MyEicher & Uptime Center",
      points: ["Replaced legacy IBM Event Streams for superior throughput", "Direct hardware integration bypassing expensive gateways", "Mission-critical backend for fleet monitoring"],
      badges: ["Legacy Replacement", "Cost Optimization"],
    },
    {
      logo: "ROYAL ENFIELD", tag: "OEM",
      title: "Connected Bike Platform",
      points: ["Handling high-volume telemetry ingestion", "Optimized for Google Cloud (GCP) deployment", "Core streaming engine for next-gen connected bikes"],
      badges: ["BYOC Kafka", "GCP"],
    },
    {
      logo: "MONTRA", tag: "EV OEM",
      title: "Electric Mobility Platform",
      points: ["Handling 65 MBps average data ingress load", "Replaced Confluent + Sibros for unified platform", "Data backbone for diverse EV variants (Trucks, 3Ws)"],
      badges: ["40% reduction in TCO", "Scale from 20k to 62K+"],
    },
    {
      logo: "TATA MOTORS", tag: "OEM",
      title: "Aftermarket Connectivity & Control",
      points: ["Full-stack Telemetry, CAN, Events, and DTC integration", "Advanced system integration for legacy and new fleet variants", "End-to-end real-time streaming for aftermarket devices"],
      badges: ["15,000 Vehicles", "10s Packet Frequency", "Mission-Critical"],
    },
  ];

  const sGAP = 20, sCW = (MAX_W - sGAP) / 2, sCH = 170;
  stories.forEach((story, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = L + col * (sCW + sGAP);
    const cy = curY - row * (sCH + sGAP) - sCH;

    page.drawRectangle({ x: cx, y: cy, width: sCW, height: sCH, color: WHITE, borderColor: GREY_MID, borderWidth: 1 });

    // Logo text
    page.drawText(story.logo, { x: cx + 12, y: cy + sCH - 24, size: 11, font: bold, color: DARK_NAVY });

    // Tag pill
    page.drawRectangle({ x: cx + sCW - 56, y: cy + sCH - 30, width: 48, height: 20, color: BLUE, borderWidth: 0 });
    page.drawText(story.tag, { x: cx + sCW - 50, y: cy + sCH - 20, size: 9, font: bold, color: WHITE });

    // Title
    page.drawText(story.title, { x: cx + 12, y: cy + sCH - 50, size: 12, font: bold, color: DARK_NAVY });

    // Bullet points
    story.points.forEach((pt, j) => {
      page.drawText("›", { x: cx + 12, y: cy + sCH - 72 - j * 18, size: 11, font: bold, color: BLUE });
      const truncated = pt.length > 58 ? pt.slice(0, 55) + "..." : pt;
      page.drawText(truncated, { x: cx + 24, y: cy + sCH - 72 - j * 18, size: 10, font: regular, color: GREY_TEXT });
    });

    // Badges
    let bx = cx + 12;
    const by = cy + 12;
    story.badges.forEach(badge => {
      const bw = regular.widthOfTextAtSize(badge, 9) + 16;
      page.drawRectangle({ x: bx, y: by, width: bw, height: 18, color: BLUE_LIGHT, borderColor: BLUE, borderWidth: 0.5 });
      page.drawText(badge, { x: bx + 8, y: by + 5, size: 9, font: regular, color: BLUE });
      bx += bw + 6;
    });
  });

  curY -= Math.ceil(stories.length / 2) * (sCH + sGAP) + 20;

  // ── CTA banner ──
  const ctaH = 100;
  const ctaY = Math.min(curY - 10, 160);
  page.drawRectangle({ x: L, y: ctaY, width: MAX_W, height: ctaH, color: DARK_NAVY, borderWidth: 0 });
  page.drawText("Experience Condense Hands-On", { x: L + 20, y: ctaY + ctaH - 28, size: 18, font: bold, color: WHITE });
  const ecW = bold.widthOfTextAtSize("Experience Condense Hands-On", 18);
  page.drawText("& Run a Real POC with Upto ", { x: L + 20, y: ctaY + ctaH - 56, size: 18, font: regular, color: WHITE });
  const pocW = regular.widthOfTextAtSize("& Run a Real POC with Upto ", 18);
  page.drawText("10 MBps", { x: L + 20 + pocW, y: ctaY + ctaH - 56, size: 18, font: bold, color: BLUE });

  // TRY FOR FREE button
  page.drawRectangle({ x: L + 20, y: ctaY + 10, width: 130, height: 34, color: BLUE, borderWidth: 0 });
  page.drawText("TRY FOR FREE", { x: L + 32, y: ctaY + 23, size: 11, font: bold, color: WHITE });

  page.drawText("› 30 Days Free Trial", { x: L + 168, y: ctaY + 36, size: 10, font: regular, color: rgb(0.7, 0.85, 1) });
  page.drawText("› No Credit Card Reqd", { x: L + 168, y: ctaY + 18, size: 10, font: regular, color: rgb(0.7, 0.85, 1) });

  drawFooter(page, regular);
  return page;
}

// ---------------------------------------------------------------------------
// PAGE 3 — Case study + value props
// ---------------------------------------------------------------------------
function buildPage3(pdfDoc, bold, regular) {
  const page = pdfDoc.addPage([W, H]);
  drawHeader(page, bold, regular, 3);

  // ── Main case study heading ──
  let y = H - 110;
  page.drawText("Condense Powering ", { x: L, y, size: 32, font: bold, color: DARK_NAVY });
  const h1w = bold.widthOfTextAtSize("Condense Powering ", 32);
  page.drawText("1 GBps", { x: L + h1w, y, size: 32, font: bold, color: BLUE });
  const h2w = bold.widthOfTextAtSize("1 GBps", 32);
  page.drawText(" Peak Load", { x: L + h1w + h2w, y, size: 32, font: bold, color: DARK_NAVY });

  y -= 40;
  page.drawText("with ", { x: L, y, size: 32, font: bold, color: DARK_NAVY });
  const h3w = bold.widthOfTextAtSize("with ", 32);
  page.drawText("350 MBps", { x: L + h3w, y, size: 32, font: bold, color: BLUE });
  const h4w = bold.widthOfTextAtSize("350 MBps", 32);
  page.drawText(" Continuous Throughput", { x: L + h3w + h4w, y, size: 32, font: bold, color: DARK_NAVY });

  // Case study body
  y -= 36;
  const caseBody = "One of India's leading commercial vehicle OEMs migrated from IBM Event Streams to Condense to handle 1 GBps peak throughput with 350 MBps continuous Throughput, unifying 6 data sources with 2-way synchronization. All of this runs seamlessly with 99.95% uptime.";
  y = drawWrapped(page, caseBody, { x: L, y, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24 });

  // Value Delivered heading
  y -= 28;
  page.drawText("Value Delivered :", { x: L, y, size: 15, font: bold, color: DARK_NAVY });
  y -= 24;

  const metrics = [
    { icon: "↓", text: "20% reduction in cloud spend" },
    { icon: "↓", text: "35% reduction in development & operations effort" },
    { icon: "✓", text: "100% data localization within their cloud boundary" },
    { icon: "×", text: "6x faster GTM for new data products & features" },
    { icon: "→", text: "Complete migration support" },
  ];

  metrics.forEach(({ icon, text }) => {
    page.drawRectangle({ x: L, y: y - 4, width: 28, height: 28, color: BLUE_LIGHT, borderWidth: 0 });
    page.drawText(icon, { x: L + 8, y: y + 4, size: 13, font: bold, color: BLUE });
    page.drawText(text, { x: L + 40, y: y + 4, size: 14, font: regular, color: DARK_NAVY });
    y -= 36;
  });

  y -= 16;

  // ── How Condense Unlocks Value heading ──
  page.drawText("How Condense Unlocks Value for Customers", {
    x: L, y, size: 28, font: bold, color: DARK_NAVY,
  });
  y -= 36;

  // 4 value prop cards
  const valueProps = [
    {
      title: "Accelerating Go-to-Market Velocity",
      body: "A Tyre OEM launched a TMS in four months, while 2W/3W brands ship features 10x faster by using prebuilt modules to cut dev cycles.",
    },
    {
      title: "Focus on Innovation with Data Control",
      body: "By offloading Kafka via BYOC, engineering teams focus on innovation while keeping 100% data ownership in their own cloud.",
    },
    {
      title: "Unlocking Operational ROI",
      body: "Teams added +2 trips per shift by focused innovation while cutting cloud costs by 20%, turning tech into bottom line gains.",
    },
    {
      title: "Unifying Fragmented Ecosystems",
      body: "Condense merges scattered streams from fleet info to logistics into one reliable view, turning silos into a single source of truth.",
    },
  ];

  const vGAP = 20, vCW = (MAX_W - vGAP) / 2, vCH = 120;
  valueProps.forEach((vp, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = L + col * (vCW + vGAP);
    const cy = y - row * (vCH + vGAP) - vCH;
    page.drawRectangle({ x: cx, y: cy, width: vCW, height: vCH, color: WHITE, borderColor: GREY_MID, borderWidth: 1 });
    // Blue accent top-left corner icon placeholder
    page.drawRectangle({ x: cx, y: cy + vCH - 4, width: 60, height: 4, color: BLUE, borderWidth: 0 });
    page.drawText(vp.title, { x: cx + 12, y: cy + vCH - 24, size: 12, font: bold, color: BLUE });
    drawWrapped(page, vp.body, {
      x: cx + 12, y: cy + vCH - 46,
      font: regular, size: 12, color: GREY_TEXT, maxWidth: vCW - 24, leading: 19,
    });
  });

  y -= Math.ceil(valueProps.length / 2) * (vCH + vGAP) + 20;

  // ── Bottom summary paragraph ──
  const summaryY = Math.min(y - 10, 140);
  const summary = "Condense brings together managed Kafka, transformations, connectors, orchestration & observability into one unified platform that runs inside your cloud. It removes the complexity of stitching multiple tools, gives teams a single place to build & operate real time pipelines & provides the control, security & performance needed for production streaming workloads across industries.";
  drawWrapped(page, summary, {
    x: L, y: summaryY,
    font: regular, size: 13, color: GREY_TEXT, maxWidth: MAX_W, leading: 21,
  });

  drawFooter(page, regular);
  return page;
}

// ---------------------------------------------------------------------------
// Main export — no Template.pdf needed, builds everything from scratch
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

    if (!sel) throw new Error("No prospect selected");
    if (!findIndustryUseCases) throw new Error("findIndustryUseCases not provided");

    const company  = sel.company  || "Your Company";
    const industry = sel.industry || "Your Industry";
    const contact  = sel.name     || "";
    const role     = sel.jobTitle || "";

    const researchData = selResearch || {};
    const data = findIndustryUseCases(company, industry, researchData);

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    buildPage1(pdfDoc, bold, regular, italic, company, contact, role);
    buildPage2(pdfDoc, bold, regular, company, industry, data);
    buildPage3(pdfDoc, bold, regular);

    // Download
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
    alert("PDF Export Failed: " + err.message);
    onError?.(err);
  }
}
