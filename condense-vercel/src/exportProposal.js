/**
 * exportProposal.js — Zeliot / Condense PDF Export
 * Exact replica of the 3-page Template.pdf design.
 * Only "How Condense Helps" section is dynamically populated from app research data.
 * Everything else matches the template pixel-for-pixel.
 *
 * USAGE (same as before — no changes needed in App.jsx):
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

// ─── BRAND COLORS (from template) ─────────────────────────────────────────────
const C = {
  blue:      "#257DF0",
  black:     "#1C1D21",
  grey:      "#767678",
  lightGrey: "#E6E6E6",
  bgGrey:    "#F9F9F9",
  white:     "#FFFFFF",
  tagBg:     "#F0F4FF",
  cardBorder:"#E8EEF8",
};

// ─── FONT (Geist matches the template's clean sans look; fallback system-ui) ──
const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// ─── ESCAPE HTML ──────────────────────────────────────────────────────────────
function e(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Highlight a keyword in blue (used for numbers/key terms in headlines)
function blue(text) {
  return `<span style="color:${C.blue};">${e(text)}</span>`;
}

// ─── SHARED PAGE SHELL ────────────────────────────────────────────────────────
// Page: A4 portrait at 96dpi equivalent → 794 × 1123px
// Margins: 56px sides, 48px top/bottom (matches template visual weight)
const PW = 794, PH = 1123;
const ML = 56, MR = 56, MT = 40, MB = 40;
const IW = PW - ML - MR; // inner width = 682

function shell(inner, pageNum, total) {
  return `
  <div style="
    width:${PW}px;height:${PH}px;background:${C.white};
    padding:${MT}px ${MR}px ${MB}px ${ML}px;
    font-family:${FONT};color:${C.black};
    display:flex;flex-direction:column;
    overflow:hidden;position:relative;box-sizing:border-box;
  ">
    <!-- HEADER: ZELIOT logo left | Page X/Y right -->
    <div style="
      display:flex;justify-content:space-between;align-items:center;
      margin-bottom:20px;flex-shrink:0;
    ">
      <div style="font-size:20px;font-weight:900;color:${C.black};letter-spacing:-1px;font-family:${FONT};">
        ZEL<span style="color:${C.blue};">I</span>OT
      </div>
      <div style="font-size:12px;color:${C.grey};font-weight:400;">Page ${pageNum}/${total}</div>
    </div>

    <!-- PAGE BODY -->
    <div style="flex:1;overflow:hidden;">${inner}</div>
  </div>`;
}

// ─── INLINE SVG ICONS (Phosphor-style, blue) ─────────────────────────────────
const ICON = {
  // cloud/deployment icon for value bullets
  cloud: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M160 40a88.09 88.09 0 0 0-80.92 53.37A64 64 0 1 0 72 224h88a88 88 0 0 0 0-176Z" fill="${C.blue}" opacity="0.15"/><path d="M160 40a88.09 88.09 0 0 0-80.92 53.37A64 64 0 1 0 72 224h88a88 88 0 0 0 0-176Zm0 160H72a48 48 0 0 1-1.4-95.88 88.25 88.25 0 0 0-.6 7.88 8 8 0 0 0 16 0 72 72 0 1 1 72 72Z" fill="${C.blue}"/></svg>`,
  gear: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32Zm88-49.6v-0.8a88.14 88.14 0 0 0-7.4-21.6l0.4-0.6 12.8-14.4a8 8 0 0 0-0.8-11.2l-22.4-22.4a8 8 0 0 0-11.2-0.8L173 51.8a88.14 88.14 0 0 0-21.6-7.4h-0.8A88 88 0 0 0 128 24a88 88 0 0 0-22.6 20.4h-0.8a88.14 88.14 0 0 0-21.6 7.4L69.6 39.2a8 8 0 0 0-11.2 0.8L36 62.4a8 8 0 0 0-0.8 11.2l12.8 14.4 0.4 0.6A88.14 88.14 0 0 0 41 110.4v0.8A88 88 0 0 0 40 128a88 88 0 0 0 1 17.6v0.8a88.14 88.14 0 0 0 7.4 21.6l-0.4 0.6-12.8 14.4a8 8 0 0 0 0.8 11.2l22.4 22.4a8 8 0 0 0 11.2 0.8L83 204.2a88.14 88.14 0 0 0 21.6 7.4h0.8A88 88 0 0 0 128 232a88 88 0 0 0 22.6-20.4h0.8a88.14 88.14 0 0 0 21.6-7.4l14.4 12.8a8 8 0 0 0 11.2-0.8l22.4-22.4a8 8 0 0 0 0.8-11.2l-12.8-14.4-0.4-0.6a88.14 88.14 0 0 0 7.4-21.6v-0.8A88 88 0 0 0 216 128a88 88 0 0 0-1-17.6Z" fill="${C.blue}" opacity="0.15"/><circle cx="128" cy="128" r="24" fill="${C.blue}"/></svg>`,
  db: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="128" cy="80" rx="88" ry="40" fill="${C.blue}" opacity="0.15"/><path d="M128 40C74.17 40 40 62 40 80v96c0 18 34.17 40 88 40s88-22 88-40V80c0-18-34.17-40-88-40Zm72 104c0 6.4-22.4 24-72 24S56 150.4 56 144v-17.6C72 137.2 98.4 144 128 144s56-6.8 72-17.6Zm0-48c0 6.4-22.4 24-72 24S56 102.4 56 96V80c0-6.4 22.4-24 72-24s72 17.6 72 24Z" fill="${C.blue}"/></svg>`,
  data: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M224 48H32a8 8 0 0 0-8 8v136a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a8 8 0 0 0-8-8ZM40 112h48v32H40Zm64 0h112v32H104Zm-64 64h48v16H40Zm64 0h112v16H104ZM40 64h176v32H40Z" fill="${C.blue}"/></svg>`,
  arrow: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" fill="${C.blue}"/></svg>`,
  rocket: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M255.07 8a8 8 0 0 0-7.07-7.07C227.72-.11 173 1.67 133.29 41.38L125 49.72 95.55 46.55a16 16 0 0 0-14.18 5.88L39.05 101.8a8 8 0 0 0 4.07 12.9l31.4 9L60 138a8 8 0 0 0 0 11.31l46.71 46.71A8 8 0 0 0 118 194.1l14.6-14.6 9 31.4a8 8 0 0 0 7.72 5.93 8.07 8.07 0 0 0 5.18-1.86l49.37-42.32a16 16 0 0 0 5.87-14.18l-3.16-29.46 8.34-8.34C253.55 83 255.18 28.28 255.07 8Z" fill="${C.blue}"/></svg>`,
  migrate: `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M236 128a108 108 0 0 1-108 108A108 108 0 0 1 20 128 108 108 0 0 1 128 20a108 108 0 0 1 108 108Z" fill="${C.blue}" opacity="0.1"/><path d="M181.66 122.34l-48-48a8 8 0 0 0-11.32 11.32L156.69 120H80a8 8 0 0 0 0 16h76.69l-34.35 34.34a8 8 0 0 0 11.32 11.32l48-48a8 8 0 0 0 0-11.32Z" fill="${C.blue}"/></svg>`,
};

// ─── ARCHITECTURE DIAGRAM (Page 1, matches template exactly) ─────────────────
function architectureDiagram() {
  return `
  <div style="
    border:1.5px dashed #B0C8F0;border-radius:12px;
    padding:18px 20px;margin:18px 0;
    background:${C.white};position:relative;
  ">
    <!-- BYOC pill top-right -->
    <div style="
      position:absolute;top:-1px;right:60px;
      background:${C.blue};color:${C.white};
      font-size:10px;font-weight:600;padding:4px 12px;border-radius:0 0 8px 8px;
    ">Cloud Marketplace Deployment on Customer's Cloud - BYOC</div>

    <!-- SOURCE | TRANSFORMATION | SINK row -->
    <div style="display:grid;grid-template-columns:1fr 24px 1.4fr 24px 1fr;gap:0;align-items:start;margin-top:14px;">

      <!-- SOURCE -->
      <div>
        <div style="font-size:10px;font-weight:700;color:${C.blue};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">SOURCE</div>
        <div style="border:1px solid ${C.cardBorder};border-radius:8px;padding:10px;background:${C.bgGrey};">
          <div style="font-size:11px;color:${C.grey};margin-bottom:8px;">Universal</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;">
            ${["⊙","⊗","⊕","▣","⊞","⊟","♡","◎"].map(i =>
              `<div style="width:24px;height:24px;border:1px solid ${C.cardBorder};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:${C.grey};">${i}</div>`
            ).join("")}
          </div>
        </div>
      </div>

      <!-- Arrow 1 -->
      <div style="display:flex;align-items:center;justify-content:center;padding-top:40px;">
        <div style="font-size:18px;color:${C.grey};">→</div>
      </div>

      <!-- TRANSFORMATION -->
      <div>
        <div style="font-size:10px;font-weight:700;color:${C.blue};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">TRANSFORMATION</div>
        <div style="border:1px solid ${C.cardBorder};border-radius:8px;padding:10px;background:${C.bgGrey};">
          <div style="font-size:11px;font-weight:600;color:${C.black};margin-bottom:4px;">No Code / Low Code Utilities</div>
          <div style="font-size:10px;color:${C.grey};margin-bottom:8px;">∇ Split &nbsp; ∇ Filter &nbsp; □ Alert &nbsp; ∨ Merge</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;">
            ${["⊞","⊟","♡","◎"].map(i =>
              `<div style="width:24px;height:24px;border:1px solid ${C.cardBorder};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:${C.grey};">${i}</div>`
            ).join("")}
          </div>
        </div>
        <!-- Custom Transform -->
        <div style="border:1px solid ${C.cardBorder};border-radius:8px;padding:8px 10px;background:${C.bgGrey};margin-top:6px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:10px;font-weight:600;color:${C.black};">⊕ Custom Transform Framework ✦</span>
          <div style="display:flex;align-items:center;gap:4px;margin-left:auto;">
            ${["GIT","CODE","TEST","BUILD","LAUNCH"].map((s,i) => `
              ${i>0?`<span style="font-size:9px;color:${C.grey};">›</span>`:""}
              <span style="font-size:9px;color:${C.grey};">${s}</span>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Arrow 2 -->
      <div style="display:flex;align-items:center;justify-content:center;padding-top:40px;">
        <div style="font-size:18px;color:${C.grey};">→</div>
      </div>

      <!-- SINK -->
      <div>
        <div style="font-size:10px;font-weight:700;color:${C.blue};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">SINK</div>
        <div style="border:1px solid ${C.cardBorder};border-radius:8px;padding:10px;background:${C.bgGrey};">
          <div style="font-size:11px;font-weight:600;color:${C.black};margin-bottom:2px;">DBs &amp; Warehouses</div>
          <div style="font-size:10px;color:${C.grey};margin-bottom:8px;">Postgres, Mongo</div>
          <div style="height:1px;background:${C.lightGrey};margin-bottom:8px;"></div>
          <div style="font-size:11px;font-weight:600;color:${C.black};margin-bottom:2px;">API / Webhook</div>
          <div style="font-size:10px;color:${C.grey};">REST, gRPC</div>
        </div>
      </div>
    </div>

    <!-- Agentic Intelligence Layer -->
    <div style="
      border:1px solid ${C.cardBorder};border-radius:8px;
      padding:8px 14px;background:${C.bgGrey};
      margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
    ">
      <span style="font-size:10px;font-weight:600;color:${C.blue};white-space:nowrap;">Agentic Intelligence Layer</span>
      ${["Dev Agent","QA Agent","K8s Agent","Monitoring & Ops Agents","Kafka Agent","Git Agent"].map(a=>
        `<span style="font-size:10px;color:${C.grey};padding:2px 8px;border:1px solid ${C.cardBorder};border-radius:4px;background:${C.white};">${a}</span>`
      ).join("")}
    </div>

    <!-- High Throughput Streaming Foundation -->
    <div style="
      border:1px solid ${C.cardBorder};border-radius:8px;
      padding:8px 14px;background:${C.bgGrey};
      margin-top:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
    ">
      <span style="font-size:10px;font-weight:600;color:${C.black};">High Throughput Streaming Foundation</span>
      <span style="font-size:10px;color:${C.grey};">|</span>
      <span style="font-size:10px;color:${C.blue};">Powered by Fully Managed Kafka</span>
      <span style="font-size:10px;color:${C.grey};margin-left:8px;">Networking</span>
      <span style="font-size:10px;color:${C.grey};">Caching</span>
    </div>
  </div>

  <!-- Bottom capability pills -->
  <div style="display:flex;align-items:center;gap:8px;margin-top:10px;justify-content:center;">
    <div style="height:1px;flex:1;background:linear-gradient(to right,transparent,${C.lightGrey});"></div>
    ${["⊞ Managed Infrastructure","⊟ Scalability","🔍 Observability","✓ Security Compliant"].map(p=>
      `<div style="
        border:1px solid ${C.cardBorder};border-radius:20px;
        padding:5px 14px;font-size:10px;color:${C.black};
        background:${C.white};white-space:nowrap;
      ">${p}</div>`
    ).join("")}
    <div style="height:1px;flex:1;background:linear-gradient(to left,transparent,${C.lightGrey});"></div>
  </div>`;
}

// ─── PAGE 1 ───────────────────────────────────────────────────────────────────
// Matches template exactly:
// "BUSINESS PROPOSAL" label | Headline + person info right | divider |
// "What is Condense?" | Architecture diagram | "Why is Condense..." + dynamic text
function buildPage1({ sel, selResearch }) {
  const whyText = selResearch?.why_condense_fits
    || selResearch?.company_overview
    || "Condense provides a real-time streaming backbone that plugs directly into your existing infrastructure, enabling faster data pipelines, lower operational overhead, and full cloud data ownership through BYOC deployment.";

  return `
    <!-- BUSINESS PROPOSAL label -->
    <div style="font-size:10px;font-weight:600;color:${C.grey};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Business Proposal</div>

    <!-- Headline row: title left | person info right -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;">
      <div>
        <div style="font-size:28px;font-weight:400;color:${C.black};line-height:1.2;">Real Time Data Intelligence</div>
        <div style="font-size:28px;font-weight:400;line-height:1.2;">
          for <span style="color:${C.blue};font-weight:600;">${e(sel.company)}</span>
        </div>
      </div>
      <div style="text-align:right;padding-top:4px;">
        <div style="font-size:13px;color:${C.black};display:flex;align-items:center;gap:6px;justify-content:flex-end;margin-bottom:4px;">
          <span style="color:${C.grey};">👤</span> ${e(sel.name || "")}
        </div>
        <div style="font-size:13px;color:${C.black};display:flex;align-items:center;gap:6px;justify-content:flex-end;">
          <span style="color:${C.grey};">🗂</span> ${e(sel.jobTitle || "")}
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:${C.lightGrey};margin-bottom:20px;"></div>

    <!-- WHAT IS CONDENSE heading -->
    <div style="font-size:26px;font-weight:400;color:${C.black};margin-bottom:10px;">
      What is <span style="color:${C.blue};">Condense?</span>
    </div>

    <!-- What is Condense body -->
    <div style="font-size:13px;line-height:1.7;color:${C.black};margin-bottom:4px;">
      Condense is an AI-first streaming platform that unifies how real-time data pipelines are built and managed.
    </div>
    <div style="font-size:13px;line-height:1.7;color:${C.black};margin-bottom:2px;">
      Running as a BYOC (Bring Your Own Cloud) deployment, Condense continuously manages and scales deployments while optimizing costs, creating a closed intelligent loop where pipelines are built faster, run autonomously, and continuously adapt to live data.
    </div>

    <!-- Architecture diagram -->
    ${architectureDiagram()}

    <!-- WHY IS CONDENSE THE BEST FIT -->
    <div style="font-size:22px;font-weight:400;color:${C.black};margin-top:16px;margin-bottom:8px;">
      Why is <span style="color:${C.blue};">Condense</span> the Best Fit for Your Company
    </div>
    <div style="font-size:13px;line-height:1.7;color:${C.black};">${e(whyText)}</div>
  `;
}

// ─── SUCCESS STORY CARD (Page 2) ─────────────────────────────────────────────
function storyCard({ logo, tag, tagColor, title, bullets, chips }) {
  const tagColors = {
    "OEM": { bg: C.blue, text: C.white },
    "EV OEM": { bg: "#E8F4FF", text: C.blue },
  };
  const tc = tagColors[tag] || { bg: C.blue, text: C.white };

  return `
  <div style="
    border:1.5px solid ${C.cardBorder};border-radius:10px;
    padding:18px;background:${C.white};
    display:flex;flex-direction:column;gap:0;
  ">
    <!-- Logo row + tag -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:13px;font-weight:700;color:${C.black};letter-spacing:-0.3px;">${logo}</div>
      <div style="
        background:${tc.bg};color:${tc.text};
        font-size:9px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:0.5px;
      ">${tag}</div>
    </div>

    <!-- Title -->
    <div style="font-size:13px;font-weight:600;color:${C.black};margin-bottom:8px;">${e(title)}</div>

    <!-- Bullets -->
    <div style="flex:1;">
      ${bullets.map(b => `
        <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:4px;">
          <span style="color:${C.blue};font-size:11px;margin-top:1px;flex-shrink:0;">›</span>
          <span style="font-size:11px;color:${C.black};line-height:1.5;">${e(b)}</span>
        </div>`).join("")}
    </div>

    <!-- Chips -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid ${C.lightGrey};">
      ${chips.map(c => `
        <span style="
          font-size:10px;color:${C.black};
          background:${C.tagBg};border-radius:4px;
          padding:3px 8px;
        ">${e(c)}</span>`).join("")}
    </div>
  </div>`;
}

// ─── PAGE 2 ───────────────────────────────────────────────────────────────────
// "How Condense Help (Industry)" — DYNAMIC from app data
// Success Stories 2×2 grid — FIXED (template content)
// POC trial banner — FIXED
function buildPage2({ sel, selResearch, industryUC }) {
  // ── DYNAMIC: How Condense helps this industry ────────────────────────────
  const industry = industryUC?.id?.replace(/_/g," ") || sel.industry || "Your Industry";
  const industryTitle = industry.charAt(0).toUpperCase() + industry.slice(1);

  // Body: intro + use cases rendered as paragraphs
  const intro = (industryUC?.intro || "")
    .replace(/\[COMPANY\]/g, sel.company);

  const useCasesText = (industryUC?.use_cases || []).slice(0, 4)
    .map(uc => `<span style="font-weight:700;">${e(uc.title)}:</span> ${e(uc.desc)}`)
    .join("<br/><br/>");

  const industryBody = intro
    ? `${e(intro)}<br/><br/>${useCasesText}`
    : useCasesText || "Condense enables real-time data pipelines tailored to your industry's specific needs, reducing operational complexity and accelerating time-to-insight.";

  // ── FIXED: Success story cards (exact template content) ──────────────────
  const stories = [
    {
      logo: `<span style="font-family:serif;font-weight:900;font-size:11px;letter-spacing:1px;">VOLVO</span> <span style="color:${C.grey};font-size:10px;">×</span> <span style="color:#E53935;font-weight:800;font-size:12px;">EICHER</span>`,
      tag: "OEM", tagColor: "blue",
      title: "MyEicher & Uptime Center",
      bullets: [
        "Replaced legacy IBM Event Streams for superior throughput",
        "Direct hardware integration bypassing expensive gateways",
        "Mission-critical backend for fleet monitoring",
      ],
      chips: ["Legacy Replacement","Cost Optimization"],
    },
    {
      logo: `<span style="color:#8B1A1A;font-weight:900;font-size:13px;letter-spacing:0.5px;">ROYAL ENFIELD</span>`,
      tag: "OEM", tagColor: "blue",
      title: "Connected Bike Platform",
      bullets: [
        "Handling high-volume telemetry ingestion",
        "Optimized for Google Cloud (GCP) deployment",
        "Core streaming engine for next-gen connected bikes",
      ],
      chips: ["BYOC Kafka","GCP"],
    },
    {
      logo: `<span style="color:${C.black};font-weight:700;font-size:12px;">✦ montra</span>`,
      tag: "EV OEM", tagColor: "lightBlue",
      title: "Electric Mobility Platform",
      bullets: [
        "Handling 65 MBps average data ingress load",
        "Replaced Confluent + Sibros for unified platform",
        "Data backbone for diverse EV variants (Trucks, 3Ws)",
      ],
      chips: ["40% reduction in TCO","Scale from 20k to 62K+"],
    },
    {
      logo: `<span style="color:${C.black};font-weight:900;font-size:13px;letter-spacing:0.5px;">TATA MOTORS</span>`,
      tag: "OEM", tagColor: "blue",
      title: "Aftermarket Connectivity & Control",
      bullets: [
        "Full-stack Telemetry, CAN, Events, and DTC integration",
        "Advanced system integration for legacy and new fleet variants",
        "Implemented end-to-end real-time streaming for aftermarket devices",
      ],
      chips: ["15,000 Vehicles","10s Packet Frequency","Mission-Critical Control"],
    },
  ];

  return `
    <!-- HOW CONDENSE HELPS — DYNAMIC INDUSTRY SECTION -->
    <div style="font-size:24px;font-weight:400;color:${C.black};margin-bottom:14px;">
      How <span style="color:${C.blue};">Condense</span> Help (${e(industryTitle)})
    </div>
    <div style="font-size:13px;line-height:1.75;color:${C.black};margin-bottom:20px;">${industryBody}</div>

    <!-- Divider -->
    <div style="height:1px;background:${C.lightGrey};margin-bottom:18px;"></div>

    <!-- SUCCESS STORIES heading -->
    <div style="font-size:24px;font-weight:400;color:${C.black};margin-bottom:14px;">Success Stories</div>

    <!-- 2×2 story grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;">
      ${stories.map(s => storyCard(s)).join("")}
    </div>

    <!-- POC Trial Banner -->
    <div style="
      border:1.5px solid ${C.cardBorder};border-radius:10px;
      padding:20px 24px;
      display:flex;align-items:center;justify-content:space-between;
      background:${C.white};
    ">
      <div>
        <div style="font-size:18px;font-weight:500;color:${C.black};line-height:1.3;margin-bottom:2px;">
          Experience <span style="color:${C.blue};font-weight:600;">Condense</span> Hands-On
        </div>
        <div style="font-size:18px;font-weight:500;color:${C.black};line-height:1.3;">
          &amp; Run a Real POC with Upto <span style="color:${C.blue};font-weight:600;">10 MBps</span>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px;">
          <div style="font-size:12px;color:${C.grey};">› 30 Days Free Trial</div>
          <div style="font-size:12px;color:${C.grey};">› No Credit Card Reqd</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
        <div style="
          background:${C.blue};color:${C.white};
          font-size:13px;font-weight:700;
          padding:10px 24px;border-radius:6px;
          letter-spacing:0.5px;
        ">TRY FOR FREE</div>
      </div>
    </div>
  `;
}

// ─── VALUE BULLET (Page 3) ────────────────────────────────────────────────────
function valueBullet(iconSvg, text) {
  return `
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
    <div style="
      width:32px;height:32px;border-radius:6px;flex-shrink:0;
      background:${C.tagBg};
      display:flex;align-items:center;justify-content:center;
    ">${iconSvg}</div>
    <div style="font-size:13px;line-height:1.5;color:${C.black};">${text}</div>
  </div>`;
}

// ─── VALUE UNLOCK CARD (Page 3 2×2 grid) ─────────────────────────────────────
function unlockCard(iconSvg, title, body) {
  return `
  <div style="padding:4px 0;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      ${iconSvg}
      <div style="font-size:13px;font-weight:600;color:${C.blue};">${title}</div>
    </div>
    <div style="font-size:12px;line-height:1.65;color:${C.black};">${body}</div>
  </div>`;
}

// ─── PAGE 3 ───────────────────────────────────────────────────────────────────
// Full case study + value unlocks + closing + footer — ALL FIXED (template content)
function buildPage3() {
  return `
    <!-- BIG HEADLINE with blue highlights on key metrics -->
    <div style="font-size:30px;font-weight:400;color:${C.black};line-height:1.25;margin-bottom:16px;">
      <span style="color:${C.blue};font-weight:600;">Condense</span> Powering
      <span style="color:${C.blue};font-weight:600;"> 1 GBps</span> Peak Load<br/>
      with <span style="color:${C.blue};font-weight:600;">350 MBps</span> Continuous Throughput
    </div>

    <!-- Case study intro -->
    <div style="font-size:13px;line-height:1.75;color:${C.black};margin-bottom:16px;">
      One of India's leading commercial vehicle OEMs migrated from
      <span style="font-weight:700;">IBM Event Streams to Condense</span> to handle
      1GBps peak throughput with 350MBps continuous Throughput, unifying
      <span style="font-weight:700;">6 data sources with 2-way synchronization.</span>
      All of this runs seamlessly with <span style="font-weight:700;">99.95% uptime.</span>
    </div>

    <!-- Value Delivered label -->
    <div style="font-size:13px;font-weight:700;color:${C.black};margin-bottom:12px;">Value Delivered :</div>

    <!-- Value bullets + illustration side by side -->
    <div style="display:flex;gap:24px;margin-bottom:24px;align-items:flex-start;">
      <div style="flex:1;">
        ${valueBullet(ICON.cloud,  "20% reduction in cloud spend")}
        ${valueBullet(ICON.gear,   "35% reduction in development &amp; operations effort")}
        ${valueBullet(ICON.db,     "100% data localization within their cloud boundary")}
        ${valueBullet(ICON.rocket, "6× faster GTM for new data products &amp; features")}
        ${valueBullet(ICON.migrate,"Complete migration support")}
      </div>
      <!-- Illustration placeholder (matches template's isometric box illustration) -->
      <div style="
        width:180px;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
        padding:10px;
      ">
        <div style="
          width:160px;height:140px;
          border:2px solid ${C.lightGrey};border-radius:12px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          background:${C.bgGrey};
        ">
          <!-- Simplified isometric-style cube representation -->
          <div style="font-size:36px;margin-bottom:4px;">⬡</div>
          <div style="font-size:11px;color:${C.blue};font-weight:600;letter-spacing:0.5px;">Condense</div>
          <div style="font-size:10px;color:${C.grey};margin-top:2px;">1 GBps Peak</div>
        </div>
      </div>
    </div>

    <!-- DIVIDER -->
    <div style="height:1px;background:${C.lightGrey};margin-bottom:20px;"></div>

    <!-- HOW CONDENSE UNLOCKS VALUE heading -->
    <div style="font-size:22px;font-weight:400;color:${C.black};margin-bottom:16px;">
      How <span style="color:${C.blue};">Condense</span> Unlocks Value for Customers
    </div>

    <!-- 2×2 grid of value unlock cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      ${unlockCard(
        `<span style="font-size:14px;color:${C.blue};">▷▷</span>`,
        "Accelerating Go-to-Market Velocity",
        "A Tyre OEM launched a TMS in four months, while 2W/3W brands ship features 10× faster by using prebuilt modules to cut dev cycles"
      )}
      ${unlockCard(
        `<span style="font-size:14px;color:${C.blue};">⊙</span>`,
        "Focus on Innovation with Data Control",
        "By offloading Kafka via BYOC, mining solution engineers focus on innovation while keeping 100% data ownership in their own cloud."
      )}
      ${unlockCard(
        `<span style="font-size:14px;color:${C.blue};">⌀</span>`,
        "Unlocking Operational ROI",
        "Mining teams added +2 trips per shift by focused innovation while cutting cloud costs by 20%, turning tech into bottom-line gains"
      )}
      ${unlockCard(
        `<span style="font-size:14px;color:${C.blue};">✦</span>`,
        "Unifying Fragmented Ecosystems",
        "Condense merges scattered streams from fleet info to logistics into one reliable view, turning silos into a single source of truth."
      )}
    </div>

    <!-- Closing paragraph -->
    <div style="font-size:12.5px;line-height:1.75;color:${C.black};margin-bottom:24px;">
      Condense brings together managed Kafka, transformations, connectors, orchestration &amp; observability into one unified platform that runs inside your cloud. It removes the complexity of stitching multiple tools, gives teams a single place to build &amp; operate real-time pipelines &amp; provides the control, security &amp; performance needed for production streaming workloads across industries.
    </div>

    <!-- FOOTER BAR -->
    <div style="
      border:1.5px solid ${C.cardBorder};border-radius:8px;
      padding:12px 24px;
      display:flex;justify-content:space-between;align-items:center;
      margin-top:auto;flex-shrink:0;
    ">
      <div style="font-size:11px;font-weight:700;color:${C.blue};text-transform:uppercase;letter-spacing:0.5px;">WWW.ZELIOT.IN</div>
      <div style="font-size:11px;font-weight:700;color:${C.blue};text-transform:uppercase;letter-spacing:0.5px;">VEERA RAGHAVAN : +91 935 309 4136</div>
      <div style="font-size:11px;font-weight:700;color:${C.blue};text-transform:uppercase;letter-spacing:0.5px;">SALES@ZELIOT.IN</div>
    </div>
  `;
}

// ─── RENDER ONE PAGE TO CANVAS ────────────────────────────────────────────────
async function renderPage(htmlContent) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    `position:fixed;left:-9999px;top:-9999px;width:${PW}px;height:${PH}px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{width:${PW}px;height:${PH}px;background:#FFFFFF;overflow:hidden;}
</style>
</head>
<body>${htmlContent}</body>
</html>`);
  doc.close();

  // Wait for font load
  await new Promise(r => setTimeout(r, 1600));

  const canvas = await window.html2canvas(doc.body, {
    scale: 2,
    useCORS: true,
    logging: false,
    width: PW,
    height: PH,
    windowWidth: PW,
    windowHeight: PH,
    backgroundColor: "#FFFFFF",
  });

  document.body.removeChild(iframe);
  return canvas;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
/**
 * Generates a 3-page PDF matching the Zeliot Template.pdf exactly.
 * Only Page 2's "How Condense Helps (Industry)" section is dynamically
 * populated from the app's research and industry data.
 *
 * @param {object} params
 * @param {object}   params.sel                   Selected prospect from App state
 * @param {object}   params.selResearch            research[selected]
 * @param {object}   params.selMessages            messages[selected]
 * @param {array}    params.selMatchedStories       matched success stories
 * @param {function} params.findIndustryUseCases   fn already in App.jsx
 * @param {function} [params.onStart]              called when export begins
 * @param {function} [params.onDone]               called on success
 * @param {function} [params.onError]              called on failure
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

    const TOTAL = 3;

    // Build all 3 page HTML strings
    const p1html = shell(buildPage1({ sel, selResearch }), 1, TOTAL);
    const p2html = shell(buildPage2({ sel, selResearch, industryUC }), 2, TOTAL);
    const p3html = shell(buildPage3(), 3, TOTAL);

    // Render sequentially (prevents font race conditions)
    const c1 = await renderPage(p1html);
    const c2 = await renderPage(p2html);
    const c3 = await renderPage(p3html);

    // Build PDF at A4 px dimensions
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [PW, PH],
      hotfixes: ["px_scaling"],
    });

    // Scale back from scale:2 canvas to page size
    pdf.addImage(c1.toDataURL("image/png", 1.0), "PNG", 0, 0, PW, PH);
    pdf.addPage([PW, PH], "portrait");
    pdf.addImage(c2.toDataURL("image/png", 1.0), "PNG", 0, 0, PW, PH);
    pdf.addPage([PW, PH], "portrait");
    pdf.addImage(c3.toDataURL("image/png", 1.0), "PNG", 0, 0, PW, PH);

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
