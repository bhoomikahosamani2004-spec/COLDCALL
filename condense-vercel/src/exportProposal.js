/**
 * exportProposal.js — Zeliot / Condense Brand-Compliant PDF Export
 * ─────────────────────────────────────────────────────────────────
 * Page:        1080 × 1440 px, 80 px margins all sides
 * Font:        Manrope (Google Fonts)
 * Icons:       Phosphor Icons (inline SVG)
 * Colors:      Zeliot brand palette
 * Multi-page:  Page 1 (Overview + Pain + Solution) | Page 2 (Insights + Stories + Pricing + CTA)
 *
 * USAGE in App.jsx (unchanged):
 *   import { exportProposalPDF } from "./exportProposal";
 *   exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories,
 *     findIndustryUseCases, onStart, onDone, onError })
 */

// ─── CDN LOADER ───────────────────────────────────────────────────────────────
function loadScript(src, check) {
  return new Promise((res, rej) => {
    if (window[check]) return res();
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
async function loadDeps() {
  await Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf"),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas"),
  ]);
}

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const B = {
  blue:         "#257DF0",
  blueOverlay:  "#E9F2FD",
  black:        "#1C1D21",
  white1:       "#FFFFFF",
  grey:         "#767678",
  lightGrey:    "#E6E6E6",
  white2:       "#F9F9F9",
  red:          "#F33A3A",
  redOverlay:   "#FEEBEB",
  green:        "#0CC264",
  greenOverlay: "#E7F9EF",
};

// ─── TYPOGRAPHY HELPERS ───────────────────────────────────────────────────────
// H1: Manrope Medium 40/50 letter-spacing:0 Title Case Left
const T = {
  h1: `font-family:'Manrope',sans-serif;font-size:40px;font-weight:500;line-height:50px;letter-spacing:0;color:${B.black};`,
  h2: `font-family:'Manrope',sans-serif;font-size:24px;font-weight:500;line-height:32px;letter-spacing:0.36px;`,
  body: `font-family:'Manrope',sans-serif;font-size:20px;font-weight:400;line-height:28px;letter-spacing:0.36px;color:${B.black};`,
  small: `font-family:'Manrope',sans-serif;font-size:18px;font-weight:700;line-height:24px;letter-spacing:0;color:${B.black};text-transform:uppercase;`,
};

// ─── PHOSPHOR ICONS (inline SVG, 24px, blue fill) ────────────────────────────
const IC = {
  warning: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19 23.51 23.51 0 0 0 .02-23.72ZM120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z" fill="${color}"/></svg>`,
  bulb: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M176 232a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8Zm40-128a88 88 0 0 1-33.64 69.21A16.24 16.24 0 0 0 176 186v6a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16v-6a16 16 0 0 0-6.23-12.66A88 88 0 1 1 216 104Z" fill="${color}"/></svg>`,
  check: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0ZM232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104Z" fill="${color}"/></svg>`,
  database: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128 24C74.17 24 32 48.6 32 80v96c0 31.4 42.17 56 96 56s96-24.6 96-56V80c0-31.4-42.17-56-96-56Zm80 104c0 9.61-7.9 19.4-21.65 26.28C170.78 161.4 150.06 164 128 164s-42.78-2.6-58.35-9.72C55.9 147.4 48 137.61 48 128v-18.36c17.06 13.28 43.34 20.36 80 20.36s62.94-7.08 80-20.36Z" fill="${color}"/></svg>`,
  shield: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M208 40H48a16 16 0 0 0-16 16v59.59c0 91.07 104 139.38 108.19 141.32a8 8 0 0 0 7.62 0C152 254.97 256 206.66 256 115.59V56a16 16 0 0 0-48-16Z" fill="${color}"/></svg>`,
  chart: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v94.37l50.9-57.68a8 8 0 0 1 11.58-.5l39.12 39.12 55.51-62.93a8 8 0 1 1 11.94 10.54l-61.44 69.64a8 8 0 0 1-11.54.43L97 109l-57 64.6V200h184a8 8 0 0 1 8 8Z" fill="${color}"/></svg>`,
  rocket: (color = B.blue) =>
    `<svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M255.07 8a8 8 0 0 0-7.07-7.07C227.72-.11 173 1.67 133.29 41.38L125 49.72 95.55 46.55a16 16 0 0 0-14.18 5.88L39.05 101.8a8 8 0 0 0 4.07 12.9l31.4 9L60 138a8 8 0 0 0 0 11.31l46.71 46.71A8 8 0 0 0 118 194.1l14.6-14.6 9 31.4a8 8 0 0 0 7.72 5.93 8.07 8.07 0 0 0 5.18-1.86l49.37-42.32a16 16 0 0 0 5.87-14.18l-3.16-29.46 8.34-8.34C253.55 83 255.18 28.28 255.07 8Z" fill="${color}"/></svg>`,
  star: (color = B.blue, size = 20) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M234.5 114.38l-45.1 39.36 13.51 58.6a16 16 0 0 1-23.84 17.34l-51.11-31-51 31a16 16 0 0 1-23.84-17.34l13.49-58.61-45.11-39.35a16 16 0 0 1 9.11-28.06l59.46-5.15 23.21-55.36a15.95 15.95 0 0 1 29.44 0L166 81.17l59.44 5.15a16 16 0 0 1 9.11 28.06Z" fill="${color}"/></svg>`,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Wrap "Condense" in blue span — used in headlines
function hilite(text) {
  if (!text) return "";
  return esc(text).replace(/condense/gi,
    `<span style="color:${B.blue};">Condense</span>`);
}

// Bullet row: icon container + body text
function bullet(iconFn, text, bgColor = B.blueOverlay, iconColor = B.blue) {
  return `
  <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:15px;">
    <div style="
      width:40px;height:40px;border-radius:6px;flex-shrink:0;
      background:${bgColor};
      display:flex;align-items:center;justify-content:center;
    ">${iconFn(iconColor)}</div>
    <div style="${T.body}padding-top:6px;flex:1;">${text}</div>
  </div>`;
}

// Card: blue overlay + border + card icon (white bg, blue border)
function card(iconFn, title, bodyHtml) {
  return `
  <div style="
    background:${B.blueOverlay};border:1.5px solid ${B.blue};border-radius:10px;
    padding:28px 24px 24px;
  ">
    <div style="
      width:40px;height:40px;border-radius:6px;
      background:${B.white1};border:1.5px solid ${B.blue};
      display:flex;align-items:center;justify-content:center;
      margin-bottom:16px;
    ">${iconFn(B.blue).replace(/width="24" height="24"/g,'width="20" height="20"')}</div>
    <div style="${T.small}margin-bottom:10px;">${esc(title)}</div>
    <div style="${T.body}">${bodyHtml}</div>
  </div>`;
}

// Story card
function storyCard(metric, label, company, detail) {
  return `
  <div style="
    background:${B.blueOverlay};border:1.5px solid ${B.blue};border-radius:10px;padding:28px;
  ">
    <div style="${T.h1}color:${B.blue};">${esc(metric)}</div>
    <div style="${T.small}color:${B.grey};margin-top:4px;margin-bottom:16px;">${esc(label)}</div>
    <div style="${T.body}font-weight:600;margin-bottom:8px;">${esc(company)}</div>
    <div style="${T.body}">${esc(detail)}</div>
  </div>`;
}

// Divider
const DIV = `<div style="height:1px;background:${B.lightGrey};margin:32px 0;"></div>`;

// Small section label
function sectionLabel(text) {
  return `<div style="${T.small}margin-bottom:20px;">${hilite(text)}</div>`;
}

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────
function shell(content, pageNum, total) {
  return `
  <div style="
    width:1080px;height:1440px;background:${B.white1};
    padding:80px;display:flex;flex-direction:column;
    font-family:'Manrope',sans-serif;overflow:hidden;
  ">
    <!-- HEADER: logo left | page number right -->
    <div style="
      display:flex;justify-content:space-between;align-items:center;
      margin-bottom:35px;flex-shrink:0;
    ">
      <!-- Logo text fallback (replace with img tag if you have a base64 logo) -->
      <div style="
        font-family:'Manrope',sans-serif;font-size:22px;font-weight:800;
        color:${B.blue};letter-spacing:-0.5px;
      ">ZELIOT</div>
      <div style="${T.small}color:${B.grey};font-size:18px;">Page ${pageNum}/${total}</div>
    </div>

    <!-- CONTENT -->
    <div style="flex:1;overflow:hidden;">${content}</div>
  </div>`;
}

// ─── PAGE 1 CONTENT ───────────────────────────────────────────────────────────
function page1Content({ sel, selResearch, industryUC }) {
  const painPoints = (selResearch?.pain_points || [
    "High operational overhead managing streaming infrastructure",
    "Poor observability causing slow incident response",
    "Scaling bottlenecks during peak data volumes",
    "Fragmented pipelines increasing time-to-insight",
  ]).slice(0, 4);

  const useCases = (industryUC?.use_cases || []).slice(0, 3);

  return `
    <!-- H1 headline — "Condense" always highlighted blue -->
    <div style="${T.h1}margin-bottom:34px;">
      Real-Time Data Intelligence for ${esc(sel.company)} — Powered by
      <span style="color:${B.blue};">Condense</span>
    </div>

    <!-- Subheadline — grey -->
    <div style="${T.h2}color:${B.grey};margin-bottom:24px;">
      A tailored proposal for ${esc(sel.company)}
      ${sel.name ? ` · ${esc(sel.name)}` : ""}
      ${sel.jobTitle ? ` · ${esc(sel.jobTitle)}` : ""}
    </div>

    <!-- Body intro -->
    <div style="${T.body}margin-bottom:40px;">
      <span style="font-weight:700;">Condense</span> is a Kafka-based real-time data
      streaming platform by Zeliot, backed by <span style="font-weight:700;">Bosch</span>.
      It gives engineering teams managed Kafka, 50+ connectors, built-in transforms,
      schema registry, and full pipeline observability — all with
      <span style="font-weight:700;">BYOC flexibility</span> across AWS, Azure, and GCP.
    </div>

    ${DIV}

    <!-- CHALLENGES section label -->
    ${sectionLabel(`Challenges We Identified at ${sel.company}`)}

    <!-- Pain point bullets with warning icon -->
    ${painPoints.map(p => bullet(IC.warning, esc(p))).join("")}

    ${DIV}

    <!-- HOW CONDENSE HELPS label — "Condense" highlighted -->
    <div style="${T.small}margin-bottom:20px;">
      How <span style="color:${B.blue};">Condense</span> Helps
    </div>

    <!-- Use case cards grid -->
    <div style="display:grid;grid-template-columns:repeat(${Math.min(useCases.length || 3, 3)},1fr);gap:20px;">
      ${useCases.length > 0
        ? useCases.map((uc, i) => {
            const icons = [IC.check, IC.database, IC.rocket];
            return card(icons[i % 3], uc.title,
              esc(uc.desc.slice(0, 110)) + (uc.desc.length > 110 ? "…" : ""));
          }).join("")
        : [
            { icon: IC.check,    title: "Managed Kafka",      desc: "Fully managed Kafka cluster — no infra overhead, auto-scaling built-in." },
            { icon: IC.database, title: "50+ Connectors",     desc: "Pre-built connectors to databases, cloud services, and IoT gateways." },
            { icon: IC.rocket,   title: "BYOC Deployment",    desc: "Run inside your own cloud (AWS/Azure/GCP) for full data sovereignty." },
          ].map(uc => card(uc.icon, uc.title, esc(uc.desc))).join("")
      }
    </div>
  `;
}

// ─── PAGE 2 CONTENT ───────────────────────────────────────────────────────────
function page2Content({ sel, selResearch, selMatchedStories, industryUC }) {
  // Why Condense fits
  const whyPoints = (selResearch?.why_condense_fits || "")
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 3);

  // Success stories
  const fallback = [
    { metric: "40%",    label: "TCO Reduction",  company: "Montra Electric",    detail: "Replaced Confluent, scaled from 20K to 62K+ connected EVs in production." },
    { metric: "99.95%", label: "Uptime SLA",     company: "VECV (Volvo Eicher)",detail: "200K+ connected vehicles, 35% less dev & ops spend, 6-month GTM acceleration." },
    { metric: "120 Days",label:"Rapid GTM",      company: "CEAT Tyres",         detail: "Full fleet management system live under 120 days via BYOC deployment." },
  ];
  const rawStories = (selMatchedStories || []).slice(0, 3);
  const stories = rawStories.length > 0
    ? rawStories.map(s => {
        const m = s.outcome.match(/(\d+[\d,.]*[%×xK+]+)/);
        const metric = m ? m[1] : "✓";
        const label  = s.outcome.split("·")[0].replace(metric,"").replace(/[·\-]/g,"").trim().slice(0,24);
        return { metric, label, company: s.company, detail: s.summary.slice(0,110) + "…" };
      })
    : fallback;

  // Fit score
  const fit    = selResearch?.condense_fit?.score || "high";
  const fitClr = fit === "high" ? B.green : fit === "medium" ? "#D97706" : B.red;
  const fitBg  = fit === "high" ? B.greenOverlay : fit === "medium" ? "#FFFBEB" : B.redOverlay;
  const fitReason = (selResearch?.condense_fit?.reason || "Strong alignment based on company scale, tech signals, and industry.").slice(0, 140);
  const techTags  = (selResearch?.tech_stack_signals || ["Real-time data", "Cloud infra", "Streaming"]).slice(0, 3);

  return `
    <!-- H1 -->
    <div style="${T.h1}margin-bottom:34px;">
      Why <span style="color:${B.blue};">Condense</span> Is the Right Fit for ${esc(sel.company)}
    </div>

    ${whyPoints.length > 0 ? `
      <!-- Subheadline — green (solution context) -->
      <div style="${T.h2}color:${B.green};margin-bottom:24px;">
        Research-backed insights tailored to ${esc(sel.company)}'s tech landscape
      </div>

      <!-- Why bullets: bulb icon, green overlay -->
      ${whyPoints.map(p =>
        bullet(IC.bulb,
          `<span style="font-weight:700;">${esc(p)}.</span>`,
          B.greenOverlay, B.green)
      ).join("")}

      ${DIV}
    ` : ""}

    <!-- SUCCESS STORIES label -->
    ${sectionLabel("Success Stories")}

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px;">
      ${stories.map(s => storyCard(s.metric, s.label, s.company, s.detail)).join("")}
    </div>

    ${DIV}

    <!-- INVESTMENT + FIT row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">

      <!-- Investment card (blue overlay) -->
      <div style="
        background:${B.blueOverlay};border:1.5px solid ${B.blue};border-radius:10px;padding:28px;
      ">
        <div style="${T.small}margin-bottom:18px;">Investment Overview</div>
        ${[
          { iconFn: IC.database, label: "Platform",    value: "Condense by Zeliot",   sub: "Managed Kafka + 50+ Connectors" },
          { iconFn: IC.shield,   label: "Deployment",  value: "BYOC",                 sub: "AWS · Azure · GCP · On-prem"    },
          { iconFn: IC.chart,    label: "TCO Saving",  value: "40%+",                 sub: "vs self-managed Kafka stacks"   },
        ].map(row => `
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
            <div style="
              width:40px;height:40px;border-radius:6px;flex-shrink:0;
              background:${B.white1};border:1.5px solid ${B.blue};
              display:flex;align-items:center;justify-content:center;
            ">${row.iconFn(B.blue).replace(/width="24" height="24"/g,'width="20" height="20"')}</div>
            <div>
              <div style="font-family:'Manrope',sans-serif;font-size:12px;font-weight:700;
                color:${B.grey};text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px;">${row.label}</div>
              <div style="font-family:'Manrope',sans-serif;font-size:22px;font-weight:700;
                color:${B.blue};line-height:1.2;">${row.value}</div>
              <div style="font-family:'Manrope',sans-serif;font-size:14px;color:${B.grey};
                margin-top:2px;">${row.sub}</div>
            </div>
          </div>`).join("")}
      </div>

      <!-- Condense Fit Score card -->
      <div style="
        background:${fitBg};border:1.5px solid ${fitClr};border-radius:10px;
        padding:28px;display:flex;flex-direction:column;justify-content:space-between;
      ">
        <div>
          <div style="${T.small}color:${B.black};margin-bottom:14px;">Condense Fit Score</div>
          <div style="${T.h1}color:${fitClr};">${fit.toUpperCase()} FIT</div>
          <div style="${T.body}margin-top:12px;">${esc(fitReason)}${fitReason.length >= 140 ? "…" : ""}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
          ${techTags.map(t =>
            `<span style="
              background:${B.white1};border:1px solid ${fitClr};border-radius:6px;
              padding:4px 12px;font-family:'Manrope',sans-serif;font-size:14px;
              font-weight:600;color:${fitClr};
            ">${esc(t)}</span>`
          ).join("")}
        </div>
      </div>
    </div>

    <!-- Social proof bar -->
    <div style="
      background:${B.black};border-radius:10px;padding:20px 28px;margin-bottom:28px;
      font-family:'Manrope',sans-serif;font-size:18px;font-weight:400;
      line-height:26px;color:${B.white1};letter-spacing:0.36px;
    ">
      <span style="color:${B.blue};font-weight:700;">Trusted in production by: </span>
      TVS Motor · Tata Motors · Royal Enfield · Eicher Motors · Ashok Leyland ·
      Adani Ports · CEAT · Montra Electric · SML Isuzu
    </div>

    <!-- CTA -->
    <div style="
      background:${B.blue};border-radius:10px;
      padding:28px 36px;display:flex;align-items:center;justify-content:space-between;
    ">
      <div>
        <div style="${T.h2}color:${B.white1};margin-bottom:6px;">
          Ready to get started with <span style="font-weight:700;">Condense</span>?
        </div>
        <div style="${T.body}color:rgba(255,255,255,0.75);">
          Next step: 30-min discovery call · Veera Raghavan · veera@zeliot.in · +91 935-309-4136
        </div>
      </div>
      <div style="
        background:${B.white1};border-radius:8px;padding:12px 28px;flex-shrink:0;margin-left:24px;
        font-family:'Manrope',sans-serif;font-size:18px;font-weight:700;color:${B.blue};
        white-space:nowrap;
      ">Book a Call →</div>
    </div>
  `;
}

// ─── RENDER ONE PAGE ──────────────────────────────────────────────────────────
async function renderPage(htmlContent) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:1080px;height:1440px;border:none;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{width:1080px;height:1440px;background:#FFFFFF;overflow:hidden;}
</style>
</head>
<body>${htmlContent}</body>
</html>`);
  doc.close();

  // Wait for Manrope to load
  await new Promise(r => setTimeout(r, 1800));

  const canvas = await window.html2canvas(doc.body, {
    scale: 1,
    useCORS: true,
    logging: false,
    width: 1080,
    height: 1440,
    windowWidth: 1080,
    windowHeight: 1440,
    backgroundColor: "#FFFFFF",
  });

  document.body.removeChild(iframe);
  return canvas;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
/**
 * Generates a 2-page brand-compliant PDF proposal.
 *
 * @param {object} params
 * @param {object}   params.sel                   selected prospect (App.jsx state)
 * @param {object}   params.selResearch            research[selected]
 * @param {object}   params.selMessages            messages[selected]
 * @param {array}    params.selMatchedStories       matched success stories array
 * @param {function} params.findIndustryUseCases   the fn already defined in App.jsx
 * @param {function} [params.onStart]              called when export begins
 * @param {function} [params.onDone]               called on success
 * @param {function} [params.onError]              called with error on failure
 */
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
  if (!sel) return;
  onStart?.();

  try {
    await loadDeps();

    const industryUC = findIndustryUseCases(
      sel.company,
      sel.industry || "",
      selResearch || {}
    );

    const TOTAL = 2;

    const p1 = shell(page1Content({ sel, selResearch, industryUC }), 1, TOTAL);
    const p2 = shell(page2Content({ sel, selResearch, selMatchedStories, industryUC }), 2, TOTAL);

    // Render pages sequentially to avoid font race conditions
    const c1 = await renderPage(p1);
    const c2 = await renderPage(p2);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [1080, 1440],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(c1.toDataURL("image/png", 1.0), "PNG", 0, 0, 1080, 1440);
    pdf.addPage([1080, 1440], "portrait");
    pdf.addImage(c2.toDataURL("image/png", 1.0), "PNG", 0, 0, 1080, 1440);

    const slug = (sel.company || "prospect")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    pdf.save(`condense-proposal-${slug}.pdf`);
    onDone?.();
  } catch (err) {
    console.error("[exportProposalPDF]", err);
    onError?.(err);
  }
}
