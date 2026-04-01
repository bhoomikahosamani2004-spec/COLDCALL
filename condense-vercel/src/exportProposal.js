// exportProposal.js
// Named export: exportProposalPDF
// Usage in App.js:
//   import { exportProposalPDF } from "./exportProposal";
//   exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories,
//                       findIndustryUseCases, onStart, onDone, onError });

export async function exportProposalPDF({
  sel,
  selResearch,
  selMessages,
  selMatchedStories = [],
  findIndustryUseCases,
  onStart,
  onDone,
  onError,
}) {
  try {
    onStart?.();

    // ── Dynamic import jsPDF ─────────────────────────────────────────────────
    let jsPDF;
    try {
      ({ jsPDF } = await import("jspdf"));
    } catch {
      throw new Error("jsPDF not found. Run: npm install jspdf");
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // ── Palette ───────────────────────────────────────────────────────────────
    const NAVY   = [10,  37,  64];
    const BLUE   = [27, 110, 243];
    const LTBLUE = [238, 245, 255];
    const GREEN  = [13, 158, 110];
    const AMBER  = [217, 119,   6];
    const PURPLE = [124,  58, 237];
    const GREY   = [74,  96, 128];
    const FAINT  = [228, 236, 244];
    const WHITE  = [255, 255, 255];
    const BODY   = [248, 250, 252];

    const PW = 210;
    const ML = 18;
    const MR = 18;
    const CW = PW - ML - MR;

    let y = 0;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const setTxt  = ([r, g, b]) => doc.setTextColor(r, g, b);
    const setFill = ([r, g, b]) => doc.setFillColor(r, g, b);
    const setStr  = ([r, g, b]) => doc.setDrawColor(r, g, b);

    const newPage = () => {
      doc.addPage();
      y = 20;
      setFill(NAVY);
      doc.rect(0, 0, PW, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setTxt(WHITE);
      doc.text("ZELIOT · CONDENSE — CONFIDENTIAL", ML, 6.5);
      doc.text(sel.company || "", PW - MR, 6.5, { align: "right" });
      y = 18;
    };

    const checkY = (needed = 20) => {
      if (y + needed > 275) newPage();
    };

    const wrappedBlock = (text, x, startY, maxW, lineH = 5.2, fontSize = 10, color = GREY) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "normal");
      setTxt(color);
      const lines = doc.splitTextToSize(String(text || ""), maxW);
      lines.forEach((line) => {
        checkY(lineH + 2);
        doc.text(line, x, startY);
        startY += lineH;
      });
      return startY;
    };

    const sectionHeading = (label, icon = "") => {
      checkY(16);
      y += 4;
      setFill(LTBLUE);
      doc.rect(ML, y - 4, CW, 10, "F");
      setStr(BLUE);
      doc.setLineWidth(0.4);
      doc.line(ML, y - 4, ML, y + 6);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      setTxt(BLUE);
      doc.text(`${icon}  ${label.toUpperCase()}`, ML + 4, y + 1.5);
      y += 10;
    };

    const messageBlock = (title, day, body, accentColor = BLUE) => {
      if (!body) return;
      const lines = doc.splitTextToSize(String(body), CW - 10);
      const blockH = lines.length * 5 + 18;
      checkY(blockH + 6);

      setFill(BODY);
      setStr(FAINT);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, blockH, 2, 2, "FD");

      setFill(accentColor);
      doc.roundedRect(ML, y, 2.5, blockH, 1, 1, "F");

      setFill(accentColor);
      doc.roundedRect(ML + 6, y + 3, 20, 6, 1.5, 1.5, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      setTxt(WHITE);
      doc.text(day, ML + 16, y + 7.2, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      setTxt(NAVY);
      doc.text(title, ML + 30, y + 7.5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      setTxt(GREY);
      let ty = y + 14;
      lines.forEach((line) => { doc.text(line, ML + 5, ty); ty += 5; });

      y += blockH + 5;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 1 — COVER
    // ─────────────────────────────────────────────────────────────────────────
    setFill(NAVY);
    doc.rect(0, 0, PW, 52, "F");

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    setTxt(WHITE);
    doc.text("ZELIOT", ML, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setTxt([100, 160, 220]);
    doc.text("Condense · Real-Time Data Platform  ·  Backed by Bosch", ML, 27);

    setStr([27, 110, 243]);
    doc.setLineWidth(0.6);
    doc.line(ML, 35, PW - MR, 35);

    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    setTxt(WHITE);
    doc.text(sel.company || "Prospect", ML, 48);

    y = 64;

    // Prospect name & role
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setTxt(NAVY);
    doc.text(sel.name || "", ML, y);
    y += 7;

    if (sel.jobTitle) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      setTxt(GREY);
      doc.text(sel.jobTitle, ML, y);
      y += 6;
    }

    if (sel.email || sel.phone) {
      doc.setFontSize(9);
      setTxt(GREY);
      doc.text(
        [sel.email, sel.phone].filter(Boolean).join("   ·   "),
        ML, y
      );
      y += 6;
    }

    if (sel.linkedinUrl) {
      doc.setFontSize(8.5);
      setTxt([27, 110, 243]);
      doc.text(sel.linkedinUrl.replace(/^https?:\/\//, ""), ML, y);
      y += 6;
    }

    y += 4;

    // Email subject banner
    if (selMessages?.email_subject) {
      checkY(14);
      setFill(LTBLUE);
      setStr(BLUE);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, 10, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setTxt(BLUE);
      doc.text("EMAIL SUBJECT:", ML + 4, y + 4.5);
      doc.setFont("helvetica", "normal");
      setTxt(NAVY);
      const subj = doc.splitTextToSize(selMessages.email_subject, CW - 42);
      doc.text(subj[0] || "", ML + 42, y + 4.5);
      y += 14;
    }

    // ── Research Snapshot ────────────────────────────────────────────────────
    if (selResearch) {
      sectionHeading("Company Research Snapshot", "🔍");

      // Overview
      if (selResearch.company_overview) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        setTxt(NAVY);
        doc.text("Overview", ML, y);
        y += 5;
        y = wrappedBlock(selResearch.company_overview, ML, y, CW, 5, 9.5, GREY);
        y += 4;
      }

      // Condense fit
      if (selResearch.condense_fit) {
        checkY(14);
        const fitColor = selResearch.condense_fit.score === "high" ? GREEN
          : selResearch.condense_fit.score === "medium" ? AMBER : [229, 62, 62];
        setFill([...fitColor.map(v => Math.min(255, v + 200))]);
        setStr(fitColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(ML, y, CW, 10, 2, 2, "FD");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        setTxt(fitColor);
        const fitLabel = (selResearch.condense_fit.score || "").toUpperCase();
        doc.text(`${fitLabel} FIT — ${selResearch.condense_fit.reason || ""}`.slice(0, 100), ML + 4, y + 6);
        y += 14;
      }

      // Pain points
      if (selResearch.pain_points?.length) {
        checkY(20);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        setTxt(AMBER);
        doc.text("Key Pain Points", ML, y);
        y += 5;
        selResearch.pain_points.forEach((pt) => {
          checkY(8);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          setTxt(GREY);
          const lines = doc.splitTextToSize(`— ${pt}`, CW - 4);
          lines.forEach((l) => { doc.text(l, ML + 2, y); y += 4.8; });
        });
        y += 4;
      }

      // Tech signals
      if (selResearch.tech_stack_signals?.length) {
        checkY(14);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        setTxt(BLUE);
        doc.text("Tech Stack Signals", ML, y);
        y += 5;
        selResearch.tech_stack_signals.forEach((s) => {
          checkY(6);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          setTxt(GREY);
          doc.text(`· ${s}`, ML + 2, y);
          y += 5;
        });
        y += 4;
      }

      // Why Condense fits
      if (selResearch.why_condense_fits) {
        checkY(20);
        setFill([240, 251, 245]);
        setStr(GREEN);
        doc.setLineWidth(0.3);
        const whyLines = doc.splitTextToSize(selResearch.why_condense_fits, CW - 10);
        const whyH = whyLines.length * 5 + 14;
        doc.roundedRect(ML, y, CW, whyH, 2, 2, "FD");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        setTxt(GREEN);
        doc.text("⚡ Why Condense Fits", ML + 4, y + 6);
        doc.setFont("helvetica", "normal");
        setTxt(GREY);
        let wy = y + 11;
        whyLines.forEach((l) => { doc.text(l, ML + 4, wy); wy += 5; });
        y += whyH + 6;
      }
    }

    // ── Industry Use Cases ───────────────────────────────────────────────────
    if (findIndustryUseCases && selResearch) {
      const industryUC = findIndustryUseCases(
        sel.company, sel.industry || "", selResearch
      );
      if (industryUC?.use_cases?.length) {
        newPage();
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        setTxt(NAVY);
        doc.text("Relevant Use Cases", ML, y);
        y += 3;
        setFill(BLUE);
        doc.rect(ML, y, 36, 1, "F");
        y += 8;

        industryUC.use_cases.forEach((uc, i) => {
          const descLines = doc.splitTextToSize(uc.desc, CW - 10);
          const h = descLines.length * 5 + 16;
          checkY(h + 4);

          setFill(BODY);
          setStr(FAINT);
          doc.setLineWidth(0.25);
          doc.roundedRect(ML, y, CW, h, 2, 2, "FD");
          setFill(BLUE);
          doc.roundedRect(ML, y, 2.5, h, 1, 1, "F");

          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          setTxt(NAVY);
          doc.text(`${i + 1}. ${uc.title}`, ML + 6, y + 7);

          doc.setFont("helvetica", "normal");
          setTxt(GREY);
          let dy = y + 12;
          descLines.forEach((l) => { doc.text(l, ML + 6, dy); dy += 5; });
          y += h + 4;
        });

        // Social proof
        if (industryUC.social_proof) {
          checkY(20);
          y += 4;
          setFill([240, 245, 255]);
          setStr(BLUE);
          doc.setLineWidth(0.25);
          const spLines = doc.splitTextToSize(industryUC.social_proof, CW - 8);
          const spH = spLines.length * 5 + 12;
          doc.roundedRect(ML, y, CW, spH, 2, 2, "FD");
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          setTxt(BLUE);
          doc.text("PROVEN ADOPTION", ML + 4, y + 6);
          doc.setFont("helvetica", "normal");
          setTxt(GREY);
          let sy = y + 11;
          spLines.forEach((l) => { doc.text(l, ML + 4, sy); sy += 5; });
          y += spH + 6;
        }
      }
    }

    // ── Matched Success Stories ───────────────────────────────────────────────
    if (selMatchedStories.length > 0) {
      newPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      setTxt(NAVY);
      doc.text("Success Stories", ML, y);
      y += 3;
      setFill(GREEN);
      doc.rect(ML, y, 30, 1, "F");
      y += 8;

      selMatchedStories.forEach((story, i) => {
        const sumLines = doc.splitTextToSize(story.summary, CW - 10);
        const outLines = doc.splitTextToSize(story.outcome, CW - 10);
        const h = (sumLines.length + outLines.length) * 5 + 24;
        checkY(h + 6);

        setFill(BODY);
        setStr(i === 0 ? BLUE : FAINT);
        doc.setLineWidth(i === 0 ? 0.5 : 0.25);
        doc.roundedRect(ML, y, CW, h, 2, 2, "FD");
        setFill(i === 0 ? BLUE : GREY);
        doc.roundedRect(ML, y, 2.5, h, 1, 1, "F");

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        setTxt(NAVY);
        doc.text(story.company, ML + 6, y + 7);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        setTxt(GREY);
        doc.text(story.industry, ML + 6, y + 12);

        doc.setFontSize(9);
        let sy = y + 18;
        sumLines.forEach((l) => { doc.text(l, ML + 6, sy); sy += 5; });

        setFill([240, 251, 245]);
        setStr(GREEN);
        doc.setLineWidth(0.2);
        doc.roundedRect(ML + 5, sy - 1, CW - 10, outLines.length * 5 + 6, 1.5, 1.5, "FD");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        setTxt(GREEN);
        doc.text("📈 ", ML + 7, sy + 4);
        doc.setFont("helvetica", "normal");
        outLines.forEach((l) => { doc.text(l, ML + 14, sy + 4); sy += 5; });

        y += h + 6;
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LINKEDIN SEQUENCE
    // ─────────────────────────────────────────────────────────────────────────
    newPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setTxt(NAVY);
    doc.text("LinkedIn Outreach Sequence", ML, y);
    y += 3;
    setFill(BLUE);
    doc.rect(ML, y, 40, 1, "F");
    y += 8;

    const liMessages = [
      { key: "connection_note", title: "Connection Note",     day: "NOW",    color: [0, 119, 181] },
      { key: "day0_message",    title: "First Message",       day: "DAY 0",  color: NAVY },
      { key: "day3_followup",   title: "Follow-Up 1",         day: "DAY 3",  color: BLUE },
      { key: "day7_followup",   title: "Follow-Up 2",         day: "DAY 7",  color: GREEN },
      { key: "day14_followup",  title: "Follow-Up 3 (Final)", day: "DAY 14", color: GREY },
    ];

    liMessages.forEach(({ key, title, day, color }) => {
      if (selMessages?.[key]) messageBlock(title, day, selMessages[key], color);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EMAIL SEQUENCE
    // ─────────────────────────────────────────────────────────────────────────
    newPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setTxt(NAVY);
    doc.text("Email Outreach Sequence", ML, y);
    y += 3;
    setFill(AMBER);
    doc.rect(ML, y, 36, 1, "F");
    y += 8;

    const emailMessages = [
      { key: "email_body",      title: "First Email",               day: "EMAIL", color: NAVY },
      { key: "email_followup1", title: "Email Follow-Up 1",         day: "E + 3", color: BLUE },
      { key: "email_followup2", title: "Email Follow-Up 2 (Final)", day: "E + 7", color: GREY },
    ];

    emailMessages.forEach(({ key, title, day, color }) => {
      if (selMessages?.[key]) messageBlock(title, day, selMessages[key], color);
    });

    // ── Objections (if present) ───────────────────────────────────────────────
    if (selMessages?.objections?.length) {
      newPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      setTxt(NAVY);
      doc.text("Objection Handling", ML, y);
      y += 3;
      setFill(AMBER);
      doc.rect(ML, y, 30, 1, "F");
      y += 8;

      selMessages.objections.forEach((obj) => {
        const respLines = doc.splitTextToSize(obj.response || "", CW - 10);
        const h = respLines.length * 5 + 18;
        checkY(h + 6);

        setFill(BODY);
        setStr(FAINT);
        doc.setLineWidth(0.25);
        doc.roundedRect(ML, y, CW, h, 2, 2, "FD");
        setFill(AMBER);
        doc.roundedRect(ML, y, 2.5, h, 1, 1, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        setTxt(AMBER);
        const titleLines = doc.splitTextToSize(`? ${obj.title}`, CW - 10);
        doc.text(titleLines[0] || "", ML + 6, y + 7);

        doc.setFont("helvetica", "normal");
        setTxt(GREY);
        let ry = y + 13;
        respLines.forEach((l) => { doc.text(l, ML + 6, ry); ry += 5; });
        y += h + 5;
      });
    }

    // ── Footer on all pages ───────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer bar on last page
      if (i === totalPages) {
        checkY(40);
        setFill(NAVY);
        doc.rect(ML, y, CW, 32, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        setTxt(WHITE);
        doc.text("Ready to connect?", ML + 6, y + 9);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        setTxt([160, 200, 255]);
        doc.text("docs.zeliot.in/condense  ·  www.zeliot.in/blog  ·  bit.ly/3NmxJpe", ML + 6, y + 17);
        doc.text("Veera Raghavan  ·  Enterprise Business (India)  ·  +91 935-309-4136", ML + 6, y + 24);
      }

      // Page number
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      setTxt(FAINT);
      doc.text(`Page ${i} of ${totalPages}`, PW / 2, 292, { align: "center" });
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const safeName = (sel.name || "prospect")
      .replace(/[^a-z0-9]/gi, "_")
      .slice(0, 30);
    const safeCompany = (sel.company || "").replace(/[^a-z0-9]/gi, "_").slice(0, 20);
    doc.save(`Condense_Proposal_${safeCompany}_${safeName}.pdf`);

    onDone?.();
  } catch (err) {
    console.error("PDF export error:", err);
    onError?.(err);
  }
}
