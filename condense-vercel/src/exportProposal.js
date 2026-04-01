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

// Sanitize any non-WinAnsi characters to safe ASCII equivalents
function safe(str) {
  return String(str || "")
    .replace(/\u2193/g, "-")   // down arrow
    .replace(/\u2191/g, "-")   // up arrow
    .replace(/\u2192/g, "->")  // right arrow
    .replace(/\u00d7/g, "x")   // multiplication sign
    .replace(/\u203a/g, ">")   // single right angle quote
    .replace(/\u2039/g, "<")   // single left angle quote
    .replace(/\u2022/g, "-")   // bullet
    .replace(/\u2018|\u2019/g, "'")  // smart single quotes
    .replace(/\u201c|\u201d/g, '"')  // smart double quotes
    .replace(/\u2013/g, "-")   // en dash
    .replace(/\u2014/g, "--")  // em dash
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u00a0/g, " ")   // non-breaking space
    .replace(/\u2713|\u2714/g, "+")  // check marks
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, "");   // strip anything else outside latin-1
}

// Page constants
const W     = 1080;
const H     = 1440;
const L     = 80;
const R     = 1000;
const MAX_W = R - L;

// Colours
const _BLACK      = rgb(0.04,  0.09,  0.16);
const WHITE       = rgb(1,     1,     1);
const BLUE        = rgb(0.118, 0.451, 0.745);
const BLUE_LIGHT  = rgb(0.88,  0.93,  0.98);
const GREY_BG     = rgb(0.97,  0.97,  0.97);
const GREY_MID    = rgb(0.85,  0.85,  0.85);
const GREY_TEXT   = rgb(0.30,  0.38,  0.47);
const DARK_NAVY   = rgb(0.04,  0.145, 0.25);

// ---------------------------------------------------------------------------
// Shared header
// ---------------------------------------------------------------------------
function drawHeader(page, bold, regular, pageNum) {
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: BLUE });
  page.drawText("ZELIOT", { x: L, y: H - 52, size: 22, font: bold, color: DARK_NAVY });
  page.drawCircle({ x: L + 113, y: H - 44, size: 4, color: BLUE });
  page.drawText(`Page ${pageNum}/3`, { x: R - 60, y: H - 48, size: 11, font: regular, color: GREY_TEXT });
  page.drawLine({ start: { x: L, y: H - 64 }, end: { x: R, y: H - 64 }, thickness: 0.75, color: GREY_MID });
}

// ---------------------------------------------------------------------------
// Shared footer
// ---------------------------------------------------------------------------
function drawFooter(page, regular) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 50, color: BLUE_LIGHT });
  page.drawLine({ start: { x: 0, y: 50 }, end: { x: W, y: 50 }, thickness: 1, color: BLUE });
  page.drawText("www.zeliot.in",                    { x: L,           y: 18, size: 11, font: regular, color: BLUE });
  page.drawText("Veera Raghavan: +91 935 309 4136", { x: W / 2 - 120, y: 18, size: 11, font: regular, color: BLUE });
  page.drawText("sales@zeliot.in",                  { x: R - 120,     y: 18, size: 11, font: regular, color: BLUE });
}

// ---------------------------------------------------------------------------
// PAGE 1
// ---------------------------------------------------------------------------
function buildPage1(pdfDoc, bold, regular, company, contact, role) {
  const page = pdfDoc.addPage([W, H]);
  drawHeader(page, bold, regular, 1);

  page.drawText("BUSINESS PROPOSAL", { x: L, y: H - 96, size: 9, font: bold, color: BLUE });

  page.drawText("Real Time Data Intelligence", { x: L, y: H - 130, size: 26, font: bold, color: DARK_NAVY });
  page.drawText("for ", { x: L, y: H - 164, size: 26, font: regular, color: DARK_NAVY });
  const forW = regular.widthOfTextAtSize("for ", 26);
  page.drawText(safe(company), { x: L + forW, y: H - 164, size: 26, font: bold, color: BLUE });

  if (contact) {
    page.drawCircle({ x: R - 222, y: H - 122, size: 6, color: GREY_TEXT });
    page.drawText(safe(contact), { x: R - 210, y: H - 128, size: 13, font: regular, color: DARK_NAVY });
  }
  if (role) {
    page.drawRectangle({ x: R - 222, y: H - 156, width: 11, height: 9, color: GREY_TEXT, borderWidth: 0 });
    page.drawText(safe(role), { x: R - 208, y: H - 160, size: 13, font: regular, color: DARK_NAVY });
  }

  page.drawLine({ start: { x: L, y: H - 192 }, end: { x: R, y: H - 192 }, thickness: 0.5, color: GREY_MID });

  // What is Condense?
  page.drawText("What is ", { x: L, y: H - 248, size: 36, font: bold, color: DARK_NAVY });
  const w1 = bold.widthOfTextAtSize("What is ", 36);
  page.drawText("Condense?", { x: L + w1, y: H - 248, size: 36, font: bold, color: BLUE });

  const desc1 = "Condense is an AI-first streaming platform that unifies how real-time data pipelines are built and managed.";
  const desc2 = "Running as a BYOC (Bring Your Own Cloud) deployment, Condense continuously manages and scales deployments while optimizing costs, creating a closed intelligent loop where pipelines are built faster, run autonomously, and continuously adapt to live data.";
  let y = H - 290;
  y = drawWrapped(page, desc1, { x: L, y, font: bold,    size: 16, color: DARK_NAVY, maxWidth: MAX_W, leading: 26 });
  y -= 10;
  y = drawWrapped(page, desc2, { x: L, y, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24 });
  y -= 28;

  // Architecture diagram
  const diagH = 310;
  page.drawRectangle({ x: L, y: y - diagH, width: MAX_W, height: diagH, color: rgb(0.97, 0.98, 1), borderColor: BLUE, borderWidth: 1.5 });

  // BYOC label bar
  page.drawRectangle({ x: W / 2 - 200, y: y - 14, width: 400, height: 26, color: BLUE, borderWidth: 0 });
  page.drawText("Cloud Marketplace Deployment on Customer's Cloud - BYOC", { x: W / 2 - 190, y: y - 7, size: 10, font: bold, color: WHITE });

  // Three columns
  const colW = 278, colH = 168, colTop = y - 48;
  const cols = [[L + 14, "SOURCE"], [L + 14 + colW + 14, "TRANSFORMATION"], [L + 14 + (colW + 14) * 2, "SINK"]];
  cols.forEach(([cx, label]) => {
    page.drawRectangle({ x: cx, y: colTop - colH, width: colW, height: colH, color: WHITE, borderColor: rgb(0.8, 0.88, 0.96), borderWidth: 1 });
    page.drawText(label, { x: cx + 8, y: colTop - 20, size: 11, font: bold, color: BLUE });
  });

  // SOURCE
  page.drawText("Universal", { x: cols[0][0] + 10, y: colTop - 44, size: 11, font: regular, color: GREY_TEXT });
  ["Databases", "APIs", "IoT Devices", "File Streams"].forEach((item, i) => {
    page.drawText("- " + item, { x: cols[0][0] + 10, y: colTop - 66 - i * 20, size: 10, font: regular, color: GREY_TEXT });
  });

  // TRANSFORMATION
  page.drawText("No Code / Low Code Utilities", { x: cols[1][0] + 8, y: colTop - 44, size: 10, font: bold, color: DARK_NAVY });
  ["Split", "Filter", "Alert", "Merge", "Transform"].forEach((item, i) => {
    const bx = cols[1][0] + 8 + (i % 3) * 88;
    const by = colTop - 74 - Math.floor(i / 3) * 28;
    page.drawRectangle({ x: bx, y: by, width: 78, height: 22, color: BLUE_LIGHT, borderWidth: 0 });
    page.drawText(item, { x: bx + 20, y: by + 7, size: 10, font: regular, color: BLUE });
  });

  // SINK
  page.drawText("DBs & Warehouses",  { x: cols[2][0] + 8, y: colTop - 44, size: 10, font: bold, color: DARK_NAVY });
  page.drawText("Postgres, Mongo, Snowflake", { x: cols[2][0] + 8, y: colTop - 62, size: 9, font: regular, color: GREY_TEXT });
  page.drawText("API / Webhook",     { x: cols[2][0] + 8, y: colTop - 88, size: 10, font: bold, color: DARK_NAVY });
  page.drawText("REST, gRPC",        { x: cols[2][0] + 8, y: colTop - 106, size: 9, font: regular, color: GREY_TEXT });

  // Arrows
  [[cols[0][0] + colW, cols[1][0]], [cols[1][0] + colW, cols[2][0]]].forEach(([fx, tx]) => {
    const ay = colTop - colH / 2;
    page.drawLine({ start: { x: fx + 4, y: ay }, end: { x: tx - 4, y: ay }, thickness: 2, color: BLUE });
  });

  // Agentic Intelligence bar
  const layerY = colTop - colH - 16;
  page.drawRectangle({ x: L + 14, y: layerY - 26, width: MAX_W - 28, height: 26, color: rgb(0.9, 0.95, 1), borderColor: BLUE, borderWidth: 1 });
  page.drawText("Agentic Intelligence Layer   Dev Agent   QA Agent   K8s Agent   Monitoring Agent   Kafka Agent   Git Agent", { x: L + 22, y: layerY - 17, size: 9, font: regular, color: BLUE });

  // Kafka bar
  page.drawRectangle({ x: L + 14, y: layerY - 58, width: MAX_W - 28, height: 24, color: GREY_BG, borderColor: GREY_MID, borderWidth: 1 });
  page.drawText("High Throughput Streaming Foundation  |  Powered by Fully Managed Kafka  |  Networking  |  Caching", { x: L + 22, y: layerY - 49, size: 9, font: regular, color: GREY_TEXT });

  // Bottom tags
  const tags = ["Managed Infrastructure", "Scalability", "Observability", "Security Compliant"];
  const tagW = 200, tagH2 = 28;
  const tagGap = (MAX_W - tags.length * tagW) / (tags.length + 1);
  tags.forEach((tag, i) => {
    const tx = L + tagGap + i * (tagW + tagGap);
    const ty = y - diagH + 8;
    page.drawRectangle({ x: tx, y: ty, width: tagW, height: tagH2, color: WHITE, borderColor: BLUE, borderWidth: 1.2 });
    const tw = regular.widthOfTextAtSize(tag, 11);
    page.drawText(tag, { x: tx + (tagW - tw) / 2, y: ty + 9, size: 11, font: regular, color: BLUE });
  });

  // Why Condense heading
  const fitY = y - diagH - 48;
  page.drawText("Why is ", { x: L, y: fitY, size: 28, font: bold, color: DARK_NAVY });
  const w2 = bold.widthOfTextAtSize("Why is ", 28);
  page.drawText("Condense", { x: L + w2, y: fitY, size: 28, font: bold, color: BLUE });
  const w3 = bold.widthOfTextAtSize("Condense", 28);
  page.drawText(" the Best Fit for Your Company", { x: L + w2 + w3, y: fitY, size: 28, font: bold, color: DARK_NAVY });

  const placeholderY = fitY - 34;
  drawWrapped(page, safe(`Condense is purpose-built for companies like ${company} that need real-time data pipelines to power analytics, automation, and AI initiatives at scale - without the complexity of managing distributed streaming infrastructure.`), {
    x: L, y: placeholderY, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24,
  });

  drawFooter(page, regular);
}

// ---------------------------------------------------------------------------
// PAGE 2
// ---------------------------------------------------------------------------
function buildPage2(pdfDoc, bold, regular, company, industry, data) {
  const page = pdfDoc.addPage([W, H]);
  drawHeader(page, bold, regular, 2);

  // Heading
  const headY = H - 110;
  page.drawText("How Condense Helps ", { x: L, y: headY, size: 34, font: bold, color: DARK_NAVY });
  const hw = bold.widthOfTextAtSize("How Condense Helps ", 34);
  page.drawText(safe(industry), { x: L + hw, y: headY, size: 34, font: bold, color: BLUE });

  // Intro
  let curY = headY - 44;
  if (data?.intro) {
    const introText = safe(data.intro.replace(/\[COMPANY\]/g, company));
    curY = drawWrapped(page, introText, { x: L, y: curY, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24 });
  }
  curY -= 24;

  // Use-case cards 2x2
  const useCases = (data?.use_cases || []).slice(0, 4);
  if (useCases.length > 0) {
    const GAP = 20, CW = (MAX_W - GAP) / 2, CH = 148;
    const PX = 16, PY_PAD = 16, TS = 14, BS = 12, BL = 19;
    for (let i = 0; i < useCases.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = L + col * (CW + GAP);
      const cy = curY - row * (CH + GAP) - CH;
      page.drawRectangle({ x: cx, y: cy, width: CW, height: CH, color: GREY_BG, borderColor: GREY_MID, borderWidth: 1 });
      page.drawRectangle({ x: cx, y: cy + CH - 4, width: CW, height: 4, color: BLUE, borderWidth: 0 });
      page.drawText(safe(useCases[i].title || ""), { x: cx + PX, y: cy + CH - PY_PAD - TS, size: TS, font: bold, color: BLUE });
      if (useCases[i].desc) {
        drawWrapped(page, safe(useCases[i].desc), {
          x: cx + PX, y: cy + CH - PY_PAD - TS - BL - 2,
          font: regular, size: BS, color: GREY_TEXT, maxWidth: CW - PX * 2, leading: BL,
        });
      }
    }
    curY -= Math.ceil(useCases.length / 2) * (CH + GAP) + 16;
  }

  // Closing
  if (data?.closing && curY > 460) {
    curY = drawWrapped(page, safe(data.closing.replace(/\[COMPANY\]/g, company)), {
      x: L, y: curY, font: regular, size: 14, color: GREY_TEXT, maxWidth: MAX_W, leading: 22,
    });
    curY -= 20;
  }

  // Success Stories heading
  page.drawText("Success Stories", { x: L, y: curY, size: 28, font: bold, color: DARK_NAVY });
  curY -= 36;

  // 4 story cards
  const stories = [
    {
      logo: "VOLVO x EICHER", tag: "OEM",
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
      badges: ["40% reduction in TCO", "Scale 20k to 62K+"],
    },
    {
      logo: "TATA MOTORS", tag: "OEM",
      title: "Aftermarket Connectivity & Control",
      points: ["Full-stack Telemetry, CAN, Events, and DTC integration", "Advanced system integration for legacy and new fleet variants", "End-to-end real-time streaming for aftermarket devices"],
      badges: ["15,000 Vehicles", "10s Packet Frequency"],
    },
  ];

  const sGAP = 20, sCW = (MAX_W - sGAP) / 2, sCH = 168;
  stories.forEach((story, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = L + col * (sCW + sGAP);
    const cy = curY - row * (sCH + sGAP) - sCH;
    page.drawRectangle({ x: cx, y: cy, width: sCW, height: sCH, color: WHITE, borderColor: GREY_MID, borderWidth: 1 });
    page.drawText(safe(story.logo), { x: cx + 12, y: cy + sCH - 24, size: 11, font: bold, color: DARK_NAVY });
    page.drawRectangle({ x: cx + sCW - 54, y: cy + sCH - 30, width: 46, height: 20, color: BLUE, borderWidth: 0 });
    page.drawText(story.tag, { x: cx + sCW - 48, y: cy + sCH - 20, size: 9, font: bold, color: WHITE });
    page.drawText(safe(story.title), { x: cx + 12, y: cy + sCH - 50, size: 12, font: bold, color: DARK_NAVY });
    story.points.forEach((pt, j) => {
      page.drawText(">", { x: cx + 12, y: cy + sCH - 72 - j * 18, size: 10, font: bold, color: BLUE });
      const truncated = safe(pt.length > 60 ? pt.slice(0, 57) + "..." : pt);
      page.drawText(truncated, { x: cx + 24, y: cy + sCH - 72 - j * 18, size: 10, font: regular, color: GREY_TEXT });
    });
    let bx = cx + 12;
    story.badges.forEach(badge => {
      const bw = regular.widthOfTextAtSize(safe(badge), 9) + 16;
      page.drawRectangle({ x: bx, y: cy + 10, width: bw, height: 18, color: BLUE_LIGHT, borderColor: BLUE, borderWidth: 0.5 });
      page.drawText(safe(badge), { x: bx + 8, y: cy + 16, size: 9, font: regular, color: BLUE });
      bx += bw + 6;
    });
  });

  curY -= Math.ceil(stories.length / 2) * (sCH + sGAP) + 20;

  // CTA banner
  const ctaH = 96;
  const ctaY = Math.min(curY - 10, 158);
  page.drawRectangle({ x: L, y: ctaY, width: MAX_W, height: ctaH, color: DARK_NAVY, borderWidth: 0 });
  page.drawText("Experience Condense Hands-On", { x: L + 20, y: ctaY + ctaH - 28, size: 17, font: bold, color: WHITE });
  page.drawText("& Run a Real POC with Upto ", { x: L + 20, y: ctaY + ctaH - 54, size: 17, font: regular, color: WHITE });
  const pocW = regular.widthOfTextAtSize("& Run a Real POC with Upto ", 17);
  page.drawText("10 MBps", { x: L + 20 + pocW, y: ctaY + ctaH - 54, size: 17, font: bold, color: BLUE });
  page.drawRectangle({ x: L + 20, y: ctaY + 10, width: 128, height: 32, color: BLUE, borderWidth: 0 });
  page.drawText("TRY FOR FREE", { x: L + 30, y: ctaY + 22, size: 11, font: bold, color: WHITE });
  page.drawText("> 30 Days Free Trial",   { x: L + 166, y: ctaY + 36, size: 10, font: regular, color: rgb(0.7, 0.85, 1) });
  page.drawText("> No Credit Card Reqd",  { x: L + 166, y: ctaY + 18, size: 10, font: regular, color: rgb(0.7, 0.85, 1) });

  drawFooter(page, regular);
}

// ---------------------------------------------------------------------------
// PAGE 3
// ---------------------------------------------------------------------------
function buildPage3(pdfDoc, bold, regular) {
  const page = pdfDoc.addPage([W, H]);
  drawHeader(page, bold, regular, 3);

  let y = H - 110;

  // Heading
  page.drawText("Condense Powering ", { x: L, y, size: 30, font: bold, color: DARK_NAVY });
  const h1w = bold.widthOfTextAtSize("Condense Powering ", 30);
  page.drawText("1 GBps", { x: L + h1w, y, size: 30, font: bold, color: BLUE });
  const h2w = bold.widthOfTextAtSize("1 GBps", 30);
  page.drawText(" Peak Load", { x: L + h1w + h2w, y, size: 30, font: bold, color: DARK_NAVY });
  y -= 40;
  page.drawText("with ", { x: L, y, size: 30, font: bold, color: DARK_NAVY });
  const h3w = bold.widthOfTextAtSize("with ", 30);
  page.drawText("350 MBps", { x: L + h3w, y, size: 30, font: bold, color: BLUE });
  const h4w = bold.widthOfTextAtSize("350 MBps", 30);
  page.drawText(" Continuous Throughput", { x: L + h3w + h4w, y, size: 30, font: bold, color: DARK_NAVY });

  y -= 36;
  const caseBody = "One of India's leading commercial vehicle OEMs migrated from IBM Event Streams to Condense to handle 1 GBps peak throughput with 350 MBps continuous Throughput, unifying 6 data sources with 2-way synchronization. All of this runs seamlessly with 99.95% uptime.";
  y = drawWrapped(page, safe(caseBody), { x: L, y, font: regular, size: 15, color: GREY_TEXT, maxWidth: MAX_W, leading: 24 });

  y -= 28;
  page.drawText("Value Delivered :", { x: L, y, size: 15, font: bold, color: DARK_NAVY });
  y -= 24;

  // Metrics — all plain ASCII icons
  const metrics = [
    { icon: "-", text: "20% reduction in cloud spend" },
    { icon: "-", text: "35% reduction in development & operations effort" },
    { icon: "+", text: "100% data localization within their cloud boundary" },
    { icon: "+", text: "6x faster GTM for new data products & features" },
    { icon: ">", text: "Complete migration support" },
  ];
  metrics.forEach(({ icon, text }) => {
    page.drawRectangle({ x: L, y: y - 4, width: 26, height: 26, color: BLUE_LIGHT, borderWidth: 0 });
    page.drawText(icon, { x: L + 8, y: y + 4, size: 12, font: bold, color: BLUE });
    page.drawText(safe(text), { x: L + 40, y: y + 4, size: 14, font: regular, color: DARK_NAVY });
    y -= 36;
  });

  y -= 16;
  page.drawText("How Condense Unlocks Value for Customers", { x: L, y, size: 26, font: bold, color: DARK_NAVY });
  y -= 36;

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
      body: "Teams added +2 trips per shift by focused innovation while cutting cloud costs by 20%, turning tech into bottom-line gains.",
    },
    {
      title: "Unifying Fragmented Ecosystems",
      body: "Condense merges scattered streams from fleet info to logistics into one reliable view, turning silos into a single source of truth.",
    },
  ];

  const vGAP = 20, vCW = (MAX_W - vGAP) / 2, vCH = 118;
  valueProps.forEach((vp, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = L + col * (vCW + vGAP);
    const cy = y - row * (vCH + vGAP) - vCH;
    page.drawRectangle({ x: cx, y: cy, width: vCW, height: vCH, color: WHITE, borderColor: GREY_MID, borderWidth: 1 });
    page.drawRectangle({ x: cx, y: cy + vCH - 4, width: 60, height: 4, color: BLUE, borderWidth: 0 });
    page.drawText(safe(vp.title), { x: cx + 12, y: cy + vCH - 22, size: 12, font: bold, color: BLUE });
    drawWrapped(page, safe(vp.body), {
      x: cx + 12, y: cy + vCH - 44,
      font: regular, size: 12, color: GREY_TEXT, maxWidth: vCW - 24, leading: 19,
    });
  });

  y -= Math.ceil(valueProps.length / 2) * (vCH + vGAP) + 20;

  const summaryY = Math.min(y - 10, 140);
  const summary = "Condense brings together managed Kafka, transformations, connectors, orchestration & observability into one unified platform that runs inside your cloud. It removes the complexity of stitching multiple tools, gives teams a single place to build & operate real-time pipelines & provides the control, security & performance needed for production streaming workloads across industries.";
  drawWrapped(page, safe(summary), { x: L, y: summaryY, font: regular, size: 13, color: GREY_TEXT, maxWidth: MAX_W, leading: 21 });

  drawFooter(page, regular);
}

// ---------------------------------------------------------------------------
// Main export — no Template.pdf needed
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

    const company  = safe(sel.company  || "Your Company");
    const industry = safe(sel.industry || "Your Industry");
    const contact  = safe(sel.name     || "");
    const role     = safe(sel.jobTitle || "");

    const researchData = selResearch || {};
    const data = findIndustryUseCases(company, industry, researchData);

    const pdfDoc = await PDFDocument.create();
    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    buildPage1(pdfDoc, bold, regular, company, contact, role);
    buildPage2(pdfDoc, bold, regular, company, industry, data);
    buildPage3(pdfDoc, bold, regular);

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
