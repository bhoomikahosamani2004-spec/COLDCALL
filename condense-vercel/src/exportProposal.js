/**
 * exportProposal.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this file into your /src folder alongside App.jsx.
 *
 * USAGE in App.jsx:
 *   import { exportProposalPDF } from "./exportProposal";
 *
 *   // In the prospect header action buttons, add:
 *   <button onClick={() => exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories, findIndustryUseCases })}>
 *     📄 Export PDF
 *   </button>
 *
 * The function takes the exact live state variables already present in App.jsx.
 * No extra props, no refactoring needed.
 */

// ─── CDN script loader (runs once) ───────────────────────────────────────────
function loadScript(src, globalCheck) {
  return new Promise((res, rej) => {
    if (window[globalCheck]) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function loadDeps() {
  await Promise.all([
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      "jspdf"
    ),
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      "html2canvas"
    ),
  ]);
}

// ─── HTML template ────────────────────────────────────────────────────────────
function buildHTML({ sel, selResearch, selMessages, selMatchedStories, industryUC }) {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Pain points — prefer research, fall back to industry generic
  const painPoints = (selResearch?.pain_points || [
    "High operational overhead managing streaming infrastructure",
    "Poor observability across data pipelines",
    "Scaling bottlenecks with growing data volumes",
    "Long time-to-insight for analytics teams",
  ]).slice(0, 4);

  // Use cases from matched industry
  const useCases = (industryUC?.use_cases || []).slice(0, 4);

  // Success stories — top 3
  const stories = (selMatchedStories || []).slice(0, 3);

  // Pricing: extract from email_body or show placeholder
  const emailBody = selMessages?.email_body || "";

  // Why Condense helps — split into bullet points
  const whyPoints = (selResearch?.why_condense_fits || "")
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 3);

  // Social proof from industry
  const socialProof = industryUC?.social_proof || 
    "Condense is trusted by TVS Motor, Tata Motors, Royal Enfield, Eicher Motors, Ashok Leyland, Adani Ports & Logistics, CEAT, Montra Electric, and SML Isuzu — powering real-time data at scale across industries.";

  // Condense fit badge
  const fitScore = selResearch?.condense_fit?.score || "high";
  const fitColor = fitScore === "high" ? "#0D9E6E" : fitScore === "medium" ? "#D97706" : "#E53E3E";
  const fitBg = fitScore === "high" ? "#F0FBF5" : fitScore === "medium" ? "#FFFBEB" : "#FFF5F5";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html,body{
  width:794px; height:1123px;
  background:#FAFAF8;
  font-family:'DM Sans',sans-serif;
  color:#0A2540;
  overflow:hidden;
}

.page{
  width:794px; height:1123px;
  display:grid;
  grid-template-rows:72px 1fr 52px;
  background:#FAFAF8;
}

/* ── HEADER ── */
.hdr{
  background:#0A2540;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 36px;
}
.hdr-brand{display:flex;align-items:center;gap:12px;}
.logo{
  width:34px;height:34px;border-radius:8px;
  background:linear-gradient(135deg,#1B6EF3,#3D8BFF);
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Serif Display',serif;font-size:18px;color:#fff;font-weight:700;
}
.brand-name{font-size:16px;font-weight:600;color:#fff;letter-spacing:-0.2px;}
.brand-sub{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1.5px;text-transform:uppercase;margin-top:1px;}
.hdr-meta{text-align:right;}
.hdr-meta .for{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.4);}
.hdr-meta .co{font-size:14px;font-weight:600;color:#fff;margin-top:2px;}
.hdr-meta .date{font-size:9px;color:rgba(255,255,255,0.35);margin-top:1px;}

/* ── BODY LAYOUT ── */
.body{display:grid;grid-template-columns:236px 1fr;overflow:hidden;}

/* ── SIDEBAR ── */
.sidebar{
  background:#F0F2F8;
  border-right:1px solid #E0E4EE;
  padding:20px 18px;
  display:flex;flex-direction:column;gap:18px;
  overflow:hidden;
}
.s-label{
  font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;
  color:#1B6EF3;margin-bottom:8px;font-family:'JetBrains Mono',monospace;
}
.divider{height:1px;background:#D8DCE8;}

/* What is Condense */
.what-text{font-size:11px;line-height:1.65;color:#3A4A60;}
.what-text strong{color:#0A2540;font-weight:600;}

/* Pain list */
.pain-list{list-style:none;display:flex;flex-direction:column;gap:6px;}
.pain-list li{
  font-size:10px;line-height:1.5;color:#3A4A60;
  display:flex;gap:7px;align-items:flex-start;
}
.pain-list li::before{
  content:'✕';color:#E05252;font-size:8px;font-weight:700;
  flex-shrink:0;margin-top:1px;
}

/* How it helps */
.help-list{list-style:none;display:flex;flex-direction:column;gap:6px;}
.help-list li{
  font-size:10px;line-height:1.5;color:#3A4A60;
  display:flex;gap:7px;align-items:flex-start;
}
.help-list li::before{
  content:'→';color:#1B6EF3;font-size:10px;
  flex-shrink:0;line-height:1.5;
}

/* Fit badge */
.fit-badge{
  border-radius:8px;padding:10px 12px;
}
.fit-score{font-size:13px;font-weight:700;margin-bottom:3px;}
.fit-reason{font-size:9px;line-height:1.5;color:#3A4A60;}

/* ── MAIN ── */
.main{padding:20px 24px;display:flex;flex-direction:column;gap:16px;overflow:hidden;}

/* Hero */
.hero-title{
  font-family:'DM Serif Display',serif;
  font-size:22px;line-height:1.15;color:#0A2540;letter-spacing:-0.3px;
}
.hero-title em{color:#1B6EF3;}
.hero-sub{font-size:11px;color:#6A7A8A;margin-top:5px;line-height:1.6;}

/* Pricing card */
.pricing-card{
  background:#0A2540;border-radius:10px;
  padding:14px 18px;
  display:grid;grid-template-columns:repeat(3,1fr);gap:10px;
}
.metric-label{font-size:8px;text-transform:uppercase;letter-spacing:1.5px;color:#8899AA;margin-bottom:3px;font-family:'JetBrains Mono',monospace;}
.metric-value{font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#FFFFFF;}
.metric-value.orange{color:#FF6B35;}
.metric-value.green{color:#1DB87A;}
.metric-sub{font-size:9px;color:#6677AA;margin-top:2px;}
.pdivider{border:none;border-left:1px solid rgba(255,255,255,0.08);}

/* Stories */
.stories-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.story-card{
  background:#FFFFFF;border:1px solid #E4ECF4;
  border-radius:8px;padding:12px;
}
.story-metric{font-size:24px;font-weight:800;color:#1B6EF3;line-height:1;font-family:'DM Serif Display',serif;}
.story-label{font-size:9px;color:#8A9BB0;margin-top:1px;font-family:'JetBrains Mono',monospace;}
.story-company{font-size:10px;font-weight:600;color:#0A2540;margin-top:7px;}
.story-detail{font-size:9px;color:#8A9BB0;margin-top:2px;line-height:1.4;}

/* Why section */
.why-row{
  display:flex;gap:8px;align-items:flex-start;
  padding:8px 10px;background:#FFFFFF;border:1px solid #E4ECF4;
  border-left:3px solid #1B6EF3;border-radius:6px;
}
.why-arrow{color:#1B6EF3;font-weight:700;font-size:11px;flex-shrink:0;margin-top:1px;}
.why-text{font-size:11px;color:#0A2540;line-height:1.6;}

/* CTA */
.cta{
  background:linear-gradient(135deg,#1B6EF3,#7C3AED);
  border-radius:8px;padding:12px 16px;
  display:flex;align-items:center;justify-content:space-between;color:#fff;
}
.cta-main{font-size:11px;font-weight:600;}
.cta-sub{font-size:9px;opacity:0.7;margin-top:2px;}
.cta-btn{
  background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);
  border-radius:5px;padding:5px 12px;font-size:10px;font-weight:600;white-space:nowrap;
}

/* ── FOOTER ── */
.footer{
  border-top:1px solid #E0E4EE;
  padding:0 36px;
  display:flex;align-items:center;justify-content:space-between;
  background:#FAFAF8;
}
.footer-left{font-size:9px;color:#8A9BB0;}
.footer-left strong{color:#0A2540;}
.confidential{
  display:inline-flex;align-items:center;gap:4px;
  background:#FFF0EA;color:#D97706;
  border:1px solid #FFD4A0;border-radius:3px;
  padding:2px 7px;font-size:8px;font-weight:700;
  text-transform:uppercase;letter-spacing:1px;
  font-family:'JetBrains Mono',monospace;
}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <header class="hdr">
    <div class="hdr-brand">
      <div class="logo">Z</div>
      <div>
        <div class="brand-name">Condense</div>
        <div class="brand-sub">by Zeliot · Bosch-Backed</div>
      </div>
    </div>
    <div class="hdr-meta">
      <div class="for">Business Proposal for</div>
      <div class="co">${esc(sel.company)}</div>
      <div class="date">${esc(sel.name)}${sel.jobTitle ? ` · ${esc(sel.jobTitle)}` : ""} · ${today}</div>
    </div>
  </header>

  <!-- BODY -->
  <div class="body">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <div>
        <div class="s-label">What is Condense?</div>
        <p class="what-text">
          <strong>Condense</strong> is a <strong>Kafka-based real-time data streaming platform</strong>
          by Zeliot, backed by Bosch. It gives engineering teams managed Kafka,
          50+ connectors, built-in transforms, schema registry, and full observability —
          all in one place with <strong>BYOC flexibility</strong>.
        </p>
      </div>

      <div class="divider"></div>

      <div>
        <div class="s-label">Pain Points We Solve</div>
        <ul class="pain-list">
          ${painPoints.map(p => `<li>${esc(p)}</li>`).join("")}
        </ul>
      </div>

      <div class="divider"></div>

      <div>
        <div class="s-label">How Condense Helps</div>
        <ul class="help-list">
          ${useCases.map(uc => `<li><strong>${esc(uc.title)}</strong> — ${esc(uc.desc.slice(0, 70))}${uc.desc.length > 70 ? "…" : ""}</li>`).join("")}
        </ul>
      </div>

      ${selResearch?.condense_fit ? `
      <div class="divider"></div>
      <div>
        <div class="s-label">Condense Fit Score</div>
        <div class="fit-badge" style="background:${fitBg};border:1px solid ${fitColor}44;">
          <div class="fit-score" style="color:${fitColor};">${fitScore.toUpperCase()} FIT ${fitScore === "high" ? "🟢" : fitScore === "medium" ? "🟡" : "🔴"}</div>
          <div class="fit-reason">${esc((selResearch.condense_fit.reason || "").slice(0, 120))}${(selResearch.condense_fit.reason || "").length > 120 ? "…" : ""}</div>
        </div>
      </div>` : ""}

    </aside>

    <!-- MAIN -->
    <main class="main">

      <!-- Hero -->
      <div>
        <div class="hero-title">
          Real-Time Data Intelligence<br/>
          for <em>${esc(sel.company)}</em>
        </div>
        <div class="hero-sub">
          Personalised proposal · ${esc(industryUC?.id?.replace(/_/g, " ") || "Enterprise")} · Industry-matched use cases &amp; success stories
        </div>
      </div>

      <!-- Why Condense for this company -->
      ${whyPoints.length > 0 ? `
      <div>
        <div style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#8A9BB0;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">Why Condense for ${esc(sel.company)}</div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          ${whyPoints.map(p => `
          <div class="why-row">
            <span class="why-arrow">→</span>
            <span class="why-text">${esc(p)}.</span>
          </div>`).join("")}
        </div>
      </div>` : ""}

      <!-- Pricing -->
      <div>
        <div style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#8A9BB0;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">Calculated Investment</div>
        <div class="pricing-card">
          <div>
            <div class="metric-label">Platform</div>
            <div class="metric-value" style="font-size:16px;">Condense</div>
            <div class="metric-sub">Managed Kafka + 50+ Connectors</div>
          </div>
          <div class="pdivider"></div>
          <div>
            <div class="metric-label">Deployment</div>
            <div class="metric-value orange" style="font-size:16px;">BYOC</div>
            <div class="metric-sub">AWS · Azure · GCP · On-prem</div>
          </div>
          <div class="pdivider"></div>
          <div>
            <div class="metric-label">TCO Saving</div>
            <div class="metric-value green" style="font-size:20px;">40%+</div>
            <div class="metric-sub">vs self-managed Kafka</div>
          </div>
        </div>
      </div>

      <!-- Success Stories -->
      <div>
        <div style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#8A9BB0;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">
          ${stories.length > 0 ? "Matched Success Stories" : "Success Stories"}
        </div>
        <div class="stories-grid">
          ${stories.length > 0
            ? stories.map(s => {
                // Extract a headline metric from outcome string (e.g. "40%" or "99.95%")
                const metricMatch = s.outcome.match(/(\d+[\d,.]*[%×xK+]+)/);
                const metric = metricMatch ? metricMatch[1] : "✓";
                const labelMatch = s.outcome.split("·")[0].replace(metric, "").replace(/[·\-]/g, "").trim();
                return `
                <div class="story-card">
                  <div class="story-metric">${esc(metric)}</div>
                  <div class="story-label">${esc(labelMatch.slice(0, 30))}</div>
                  <div class="story-company">${esc(s.company)}</div>
                  <div class="story-detail">${esc(s.summary.slice(0, 90))}…</div>
                </div>`;
              }).join("")
            : [
                { metric: "40%", label: "TCO reduction", company: "Montra Electric", detail: "Replaced Confluent, scaled from 20K to 62K+ connected vehicles." },
                { metric: "99.95%", label: "uptime SLA", company: "VECV (Volvo Eicher)", detail: "200K+ connected vehicles, 35% less dev & ops spend." },
                { metric: "120d", label: "rapid GTM", company: "CEAT Tyres", detail: "Full fleet management system live in under 120 days." },
              ].map(s => `
                <div class="story-card">
                  <div class="story-metric">${esc(s.metric)}</div>
                  <div class="story-label">${esc(s.label)}</div>
                  <div class="story-company">${esc(s.company)}</div>
                  <div class="story-detail">${esc(s.detail)}</div>
                </div>`).join("")
          }
        </div>
      </div>

      <!-- CTA -->
      <div class="cta">
        <div>
          <div class="cta-main">Ready to accelerate ${esc(sel.company)}'s real-time data journey?</div>
          <div class="cta-sub">Next step: 30-minute discovery call with Veera Raghavan · +91 935-309-4136</div>
        </div>
        <div class="cta-btn">Book a Call →</div>
      </div>

    </main>
  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-left">
      Prepared by <strong>Veera Raghavan</strong> · Zeliot–Condense ·
      <strong>veera@zeliot.in</strong> · zeliot.in
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="confidential">⚠ Confidential</span>
      <span style="font-size:9px;color:#8A9BB0;">Valid 30 days · ${today}</span>
    </div>
  </footer>

</div>
</body>
</html>`;
}

// ─── HTML escape helper ───────────────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Main export function ─────────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {object} params.sel            - selected prospect from App state
 * @param {object} params.selResearch    - research[selected] from App state
 * @param {object} params.selMessages    - messages[selected] from App state
 * @param {array}  params.selMatchedStories - matched success stories from App state
 * @param {function} params.findIndustryUseCases - the function already in App.jsx
 * @param {function} [params.onStart]    - called when export begins (for loading state)
 * @param {function} [params.onDone]     - called when export finishes
 * @param {function} [params.onError]    - called on failure
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

    const html = buildHTML({ sel, selResearch, selMessages, selMatchedStories, industryUC });

    // Mount hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:none;visibility:hidden;";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    // Wait for fonts + render
    await new Promise(r => setTimeout(r, 1400));

    const canvas = await window.html2canvas(iframe.contentDocument.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });

    document.body.removeChild(iframe);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [794, 1123],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, 794, 1123);

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
