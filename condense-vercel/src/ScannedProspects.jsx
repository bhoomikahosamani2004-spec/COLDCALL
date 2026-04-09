// ─── ScannedProspects.jsx ────────────────────────────────────────────────────
// Drop-in page for the Zeliot Condense Outreach app.
// Integrates with the existing prospects/research/messages state and agent pipeline.
//
// INTEGRATION STEPS:
// 1. Import this file in App.jsx:
//      import ScannedProspects from "./ScannedProspects";
//
// 2. Add a nav button in the header (alongside "🎯 Prospects", "📊 Tech GTM", etc.):
//      { key: "scanned", label: "📷 Scanned" }
//
// 3. Render the view inside the main content area:
//      {activeView === "scanned" && (
//        <ScannedProspects
//          prospects={prospects}
//          setProspects={setProspects}
//          research={research}
//          setResearch={setResearch}
//          messages={messages}
//          setMessages={setMessages}
//          edits={edits}
//          setEdits={setEdits}
//          ratings={ratings}
//          setRatings={setRatings}
//          ratingFeedback={ratingFeedback}
//          setRatingFeedback={setRatingFeedback}
//          trainingExamples={trainingExamples}
//          setTrainingExamples={setTrainingExamples}
//          replies={replies}
//          extraContext={extraContext}
//          setExtraContext={setExtraContext}
//          running={running}
//          setRunning={setRunning}
//          senderProfile={senderProfile}
//          runAgent={runAgent}
//          enrichProspect={enrichProspect}
//          enriching={enriching}
//          markSent={markSent}
//          dbSave={dbSave}
//          findIndustryUseCases={findIndustryUseCases}
//          findMatchingStories={findMatchingStories}
//          SUCCESS_STORIES={SUCCESS_STORIES}
//          FOLLOWUP_SCHEDULE={FOLLOWUP_SCHEDULE}
//          exportProposalPDF={exportProposalPDF}
//        />
//      )}

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_SUPABASE_URL
  || process.env.REACT_APP_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_SUPABASE_ANON_KEY
  || process.env.REACT_APP_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function scannedDbSave(table, id, data) {
  if (!supabase) return;
  try { await supabase.from(table).upsert({ id, data, updated_at: new Date().toISOString() }); }
  catch(e) { console.error("scannedDbSave error:", e); }
}

// ─── DESIGN TOKENS (mirrors App.jsx) ─────────────────────────────────────────
const FONT    = "'Inter', 'DM Sans', system-ui, sans-serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO    = "'JetBrains Mono', 'Fira Code', monospace";

const C = {
  bg: "#F5F7FA", bgDeep: "#FFFFFF", surface: "#FFFFFF", surfaceAlt: "#F8FAFC",
  border: "rgba(10,37,64,0.10)", borderBright: "rgba(27,110,243,0.35)", borderDim: "rgba(10,37,64,0.06)",
  gold: "#1B6EF3", goldBright: "#3D8BFF", goldDim: "rgba(27,110,243,0.10)", goldDimmer: "rgba(27,110,243,0.05)",
  green: "#0D9E6E", greenDim: "rgba(13,158,110,0.10)",
  amber: "#D97706", amberDim: "rgba(217,119,6,0.10)",
  red: "#E53E3E", redDim: "rgba(229,62,62,0.10)",
  blue: "#1B6EF3", blueDim: "rgba(27,110,243,0.10)",
  purple: "#7C3AED", purpleDim: "rgba(124,58,237,0.10)",
  navy: "#0A2540", navyMid: "#1A3A5C",
  text: "#0A2540", textMid: "#4A6080", textDim: "#8A9BB0", textFaint: "#C8D4E0",
};

const STATUS_CONFIG = {
  idle:        { color: "#8A9BB0", bg: "#EEF2F7",                   label: "Not Started" },
  researching: { color: "#D97706", bg: "rgba(217,119,6,0.10)",      label: "Researching" },
  generating:  { color: "#1B6EF3", bg: "rgba(27,110,243,0.10)",     label: "Generating"  },
  ready:       { color: "#0D9E6E", bg: "rgba(13,158,110,0.10)",     label: "Ready"       },
  following:   { color: "#7C3AED", bg: "rgba(124,58,237,0.10)",     label: "Following Up"},
  done:        { color: "#0D9E6E", bg: "rgba(13,158,110,0.10)",     label: "Complete"    },
  replied:     { color: "#D97706", bg: "rgba(217,119,6,0.10)",      label: "Replied ✓"  },
  error:       { color: "#E53E3E", bg: "rgba(229,62,62,0.10)",      label: "Error"       },
};

// ─── TINY SHARED COMPONENTS ───────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
      fontFamily: MONO, padding: "3px 10px", borderRadius: 20,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ width: 14, height: 14, border: "1.5px solid #DDEAFF",
      borderTop: "1.5px solid #1B6EF3", borderRadius: "50%",
      animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
  );
}

function PrimaryBtn({ onClick, disabled, children, color = C.gold }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "9px 20px", borderRadius: 6, border: "none",
      background: disabled ? "#E4ECF4" : `linear-gradient(135deg, ${color}, ${color}CC)`,
      color: disabled ? C.textDim : "#fff", fontWeight: 600, fontSize: 12,
      fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", gap: 7,
      boxShadow: disabled ? "none" : `0 2px 10px ${color}44`,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

// ─── CARD EXTRACTION via /api/gemini (same Gemini route used by the rest of the app) ──
async function extractCardWithClaude(base64Image, mediaType) {
  const body = {
    contents: [{
      role: "user",
      parts: [
        { inline_data: { mime_type: mediaType, data: base64Image } },
   { text: `You are extracting data from a business card image.
Extract all available contact information and return ONLY valid JSON — no preamble, no markdown, no code fences.

Return this exact shape (use empty string "" for any field not found on the card):
{
  "name": "Full name",
  "jobTitle": "Job title / designation",
  "company": "Company / organisation name",
  "email": "Email address",
  "phone": "Phone or mobile number",
  "linkedinUrl": "LinkedIn URL if printed",
  "website": "Company website",
  "address": "Physical address if present",
  "industry": "Infer industry from company/title (e.g. Automotive, SaaS, Healthcare)",
  "region": "Country or region inferred from address/phone/domain",
  "notes": "Any other useful text on the card"
}` },
      ],
    }],
    generationConfig: { maxOutputTokens: 1000, temperature: 0.1 },
  };

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Gemini API error");

const text = (data.candidates?.[0]?.content?.parts || [])
  .map(p => p.text || "").join("").trim();
if (!text) throw new Error("Empty response from Gemini — try again");

// Strip markdown fences if Gemini wraps in ```json
const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
const start = cleaned.indexOf("{");
const end   = cleaned.lastIndexOf("}");
if (start === -1 || end === -1) throw new Error("No JSON in response");
return JSON.parse(cleaned.slice(start, end + 1));
}

// ─── FILE → BASE64 ───────────────────────────────────────────────────────────
// ─── FILE → COMPRESSED BASE64 ─────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Resize to max 1200px on longest side
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height / width) * MAX);
          width = MAX;
        } else {
          width = Math.round((width / height) * MAX);
          height = MAX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      // Compress as JPEG at 0.75 quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      URL.revokeObjectURL(url);
      resolve(dataUrl.split(",")[1]); // return base64 only
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ScannedProspects({
  prospects = [], setProspects,
  research = {}, setResearch,
  messages = {}, setMessages,
  edits = {}, setEdits,
  ratings = {}, setRatings,
  ratingFeedback = {}, setRatingFeedback,
  trainingExamples = [], setTrainingExamples,
  replies = [],
  extraContext = {}, setExtraContext,
  running, setRunning,
  senderProfile = {},
  runAgent,
  enrichProspect, enriching,
  markSent,
  dbSave,
  findIndustryUseCases,
  findMatchingStories,
  SUCCESS_STORIES = [],
  FOLLOWUP_SCHEDULE = [],
  exportProposalPDF,
}) {
  // ── Local state ──────────────────────────────────────────────────────────
  const [selectedId, setSelectedId]       = useState(null);
  const [scanning, setScanning]           = useState(false);
  const [scanError, setScanError]         = useState("");
  const [scanSuccess, setScanSuccess]     = useState("");
  const [preview, setPreview]             = useState(null);   // data URL for preview
  const [extracted, setExtracted]         = useState(null);   // raw extracted JSON
  const [editForm, setEditForm]           = useState(null);   // editable form before saving
  const [activeTab, setActiveTab]         = useState("messages");
  const [activeMsg, setActiveMsg]         = useState(null);
  const [logs, setLogs]                   = useState({});
  const [searchQuery, setSearchQuery]     = useState("");
  const [exportingPDF, setExportingPDF]   = useState(false);
const [scannedProspects, setScannedProspects] = useState([]);
const [scannedResearch, setScannedResearch]   = useState({});
const [scannedMessages, setScannedMessages]   = useState({});
const [scannedEdits, setScannedEdits]         = useState({});
const [scannedLoaded, setScannedLoaded]       = useState(false);
  const [cameraOpen, setCameraOpen]       = useState(false);
  const [cameraStream, setCameraStream]   = useState(null);
  useEffect(() => {
  async function loadScanned() {
    if (!supabase) { setScannedLoaded(true); return; }
    try {
      const [p, r, m, e] = await Promise.all([
        supabase.from("v3_scanned_prospects").select("id, data"),
        supabase.from("v3_scanned_research").select("id, data"),
        supabase.from("v3_scanned_messages").select("id, data"),
        supabase.from("v3_scanned_edits").select("id, data"),
      ]);
      setScannedProspects((p.data || []).map(r => r.data).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setScannedResearch(Object.fromEntries((r.data || []).map(r => [r.id, r.data])));
      setScannedMessages(Object.fromEntries((m.data || []).map(r => [r.id, r.data])));
      setScannedEdits(Object.fromEntries((e.data || []).map(r => [r.id, r.data])));
    } catch(err) { console.error("loadScanned error:", err); }
    setScannedLoaded(true);
  }
  loadScanned();
}, []);

  const fileInputRef  = useRef();
  const videoRef      = useRef();
  const canvasRef     = useRef();

  // ── Derived ──────────────────────────────────────────────────────────────
 const scanned    = scannedProspects;
const sel        = scanned.find(p => p.id === selectedId) || null;
const selR       = sel ? scannedResearch[sel.id]  : null;
const selM       = sel ? scannedMessages[sel.id]  : null;
const selStories = sel && selR ? findMatchingStories?.(sel.company, sel.industry || "", selR) ?? [] : [];

  const addLog = (id, msg) =>
    setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));
  const runScannedAgent = async (prospect) => {
  setScannedProspects(prev => prev.map(p =>
    p.id === prospect.id ? { ...p, status: "researching" } : p
  ));

  await runAgent?.(prospect);

  // Poll until research + messages appear in App.jsx props (max 30 checks)
  let attempts = 0;
  const poll = setInterval(() => {
    attempts++;
    const r = research[prospect.id];
    const m = messages[prospect.id];

    if ((r || m) || attempts > 30) {
      clearInterval(poll);

      setScannedProspects(prev => prev.map(p => {
        if (p.id !== prospect.id) return p;
        const updated = { ...p, status: m ? "ready" : p.status };
        scannedDbSave("v3_scanned_prospects", p.id, updated);
        return updated;
      }));

      if (r) {
        setScannedResearch(prev => ({ ...prev, [prospect.id]: r }));
        scannedDbSave("v3_scanned_research", prospect.id, r);
      }
      if (m) {
        setScannedMessages(prev => ({ ...prev, [prospect.id]: m }));
        scannedDbSave("v3_scanned_messages", prospect.id, m);
        setActiveMsg("connection_note");
      }
    }
  }, 1000);
};

  // ── Scanner: file upload ──────────────────────────────────────────────────
  const handleFileSelect = async (file) => {
    if (!file) return;
    setScanError(""); setScanSuccess("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScanning(true);
    setExtracted(null); setEditForm(null);
    try {
      const b64  = await fileToBase64(file);
      const mime = file.type || "image/jpeg";
      const data = await extractCardWithClaude(b64, mime);
      setExtracted(data);
      setEditForm({ ...data });
      setScanSuccess("✅ Card scanned — review details below then save.");
    } catch (err) {
      setScanError("❌ Extraction failed: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  // ── Scanner: live camera ──────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setScanError("❌ Camera access denied. Please allow camera permissions.");
    }
  };

  const closeCamera = useCallback(() => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setCameraOpen(false);
  }, [cameraStream]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    closeCamera();
    setScanning(true); setScanError(""); setScanSuccess("");
    setExtracted(null); setEditForm(null);
    try {
      const compressed = (() => {
  const MAX = 1200;
  let { width: w, height: h } = canvasRef.current;
  if (w > MAX || h > MAX) {
    if (w > h) { h = Math.round((h/w)*MAX); w = MAX; }
    else { w = Math.round((w/h)*MAX); h = MAX; }
  }
  const c2 = document.createElement("canvas");
  c2.width = w; c2.height = h;
  c2.getContext("2d").drawImage(canvasRef.current, 0, 0, w, h);
  return c2.toDataURL("image/jpeg", 0.75).split(",")[1];
})();
const b64 = compressed;
      const data = await extractCardWithClaude(b64, "image/jpeg");
      setExtracted(data);
      setEditForm({ ...data });
      setScanSuccess("✅ Card captured — review details below then save.");
    } catch (err) {
      setScanError("❌ Extraction failed: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  // ── Save extracted card as prospect ──────────────────────────────────────
 const saveScanned = () => {
    if (!editForm?.name && !editForm?.company) return;
    const id = `sc_${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];
    const newP = {
      ...editForm,
      id,
      source: "scanned",
      status: "idle",
      createdAt: new Date().toISOString(),
      uploadDate: today,
      sentAt: null,
      cardPreview: preview,
    };
    setScannedProspects(prev => [newP, ...prev]);
    scannedDbSave("v3_scanned_prospects", id, newP);
    setSelectedId(id);
    setPreview(null); setExtracted(null); setEditForm(null);
    setScanSuccess(""); setScanError("");
    setActiveTab("messages");
    setActiveMsg(null);
  };

  const discardScan = () => {
    setPreview(null); setExtracted(null); setEditForm(null);
    setScanSuccess(""); setScanError("");
  };

  // ── Delete scanned prospect ───────────────────────────────────────────────
 const deleteSP = async (id) => {
    if (selectedId === id) setSelectedId(null);
    setScannedProspects(prev => prev.filter(p => p.id !== id));
    setScannedResearch(prev => { const n = {...prev}; delete n[id]; return n; });
    setScannedMessages(prev => { const n = {...prev}; delete n[id]; return n; });
    setScannedEdits(prev => { const n = {...prev}; Object.keys(n).filter(k => k.startsWith(id)).forEach(k => delete n[k]); return n; });
    if (supabase) {
      await Promise.all([
        supabase.from("v3_scanned_prospects").delete().eq("id", id),
        supabase.from("v3_scanned_research").delete().eq("id", id),
        supabase.from("v3_scanned_messages").delete().eq("id", id),
        supabase.from("v3_scanned_edits").delete().eq("id", id),
      ]);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDaysUntil = (p, day) => {
    if (!p?.sentAt) return null;
    const t = new Date(p.sentAt).getTime() + day * 86400000;
    return Math.ceil((t - Date.now()) / 3600000 / 24);
  };

  const filteredScanned = scanned.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (p.name || "").toLowerCase().includes(q) || (p.company || "").toLowerCase().includes(q);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Keyframe for spinner (already defined in App.jsx css but redeclared here for safety) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes scanPulse { 0%,100%{opacity:1;transform:scaleX(1)} 50%{opacity:0.6;transform:scaleX(0.97)} } @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Camera modal */}
      {cameraOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 500,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden",
            border: "2px solid rgba(27,110,243,0.6)", boxShadow: "0 0 40px rgba(27,110,243,0.3)",
            maxWidth: "min(700px, 92vw)", width: "100%" }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ display: "block", width: "100%", borderRadius: 10 }} />
            {/* Scan overlay */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "72%", height: "52%", border: "2px solid rgba(27,110,243,0.7)",
                borderRadius: 8, boxShadow: "0 0 0 9999px rgba(0,0,0,0.38)",
                position: "relative" }}>
                {/* Corner accents */}
                {[["0","0","borderTop","borderLeft"],["0","auto","borderTop","borderRight"],
                  ["auto","0","borderBottom","borderLeft"],["auto","auto","borderBottom","borderRight"]
                ].map(([t,r,bT,bL],i) => (
                  <div key={i} style={{ position:"absolute", top:t, right:r, bottom:r==="auto"?t:undefined,
                    left:bL==="borderLeft"?0:undefined,
                    width:22, height:22, [bT]:"3px solid #3D8BFF", [bL]:"3px solid #3D8BFF",
                    borderRadius: i===0?"4px 0 0 0":i===1?"0 4px 0 0":i===2?"0 0 0 4px":"0 0 4px 0" }} />
                ))}
                {/* Scan line */}
                <div style={{ position:"absolute", left:0, right:0, top:"50%",
                  height:2, background:"linear-gradient(90deg,transparent,#1B6EF3,transparent)",
                  animation:"scanPulse 1.8s ease-in-out infinite" }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: MONO }}>
            Align card inside the frame
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={captureFrame} style={{
              padding: "14px 40px", borderRadius: 50, border: "none",
              background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)",
              color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 14,
              cursor: "pointer", boxShadow: "0 4px 20px rgba(27,110,243,0.5)",
              display: "flex", alignItems: "center", gap: 8 }}>
              📸 Capture
            </button>
            <button onClick={closeCamera} style={{
              padding: "14px 28px", borderRadius: 50, border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent", color: "rgba(255,255,255,0.7)", fontFamily: FONT,
              fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <div style={{ width: 290, background: "#fff", borderRight: "1px solid #E4ECF4",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "2px 0 8px rgba(10,37,64,0.04)", flexShrink: 0 }}>

          {/* Stats strip */}
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #EEF2F7",
            background: "linear-gradient(135deg, #0A2540, #1A3A5C)", flexShrink: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
              color: "#fff", marginBottom: 8, letterSpacing: "-0.01em" }}>
              📷 Scanned Prospects
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { v: scanned.length, l: "Total" },
                { v: scanned.filter(p => p.status === "ready" || p.status === "following").length, l: "Active" },
                { v: scanned.filter(p => p.status === "done").length, l: "Done" },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 18, fontFamily: DISPLAY, fontWeight: 800,
                    color: "#5DE8A0", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: MONO }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid #EEF2F7", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                fontSize: 12, color: C.textDim, pointerEvents: "none" }}>🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search scanned..."
                style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4",
                  color: C.text, borderRadius: 6, padding: "7px 10px 7px 28px",
                  fontSize: 11, fontFamily: FONT, outline: "none", boxSizing: "border-box" }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: C.textDim, fontSize: 13 }}>✕</button>
              )}
            </div>
          </div>

          {/* Prospect list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredScanned.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>📷</div>
                <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
                  No scanned cards yet.<br/>Scan a business card →
                </div>
              </div>
            ) : filteredScanned.map(p => {
              const isSelected = p.id === selectedId;
              return (
                <div key={p.id} onClick={() => setSelectedId(p.id)}
                  style={{ padding: "11px 14px", background: isSelected ? "#EEF5FF" : "#fff",
                    borderBottom: "1px solid #F0F4F8",
                    borderLeft: isSelected ? "3px solid #1B6EF3" : "3px solid transparent",
                    cursor: "pointer", transition: "all 0.12s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? C.navy : C.text,
                      lineHeight: 1.3, fontFamily: FONT, flex: 1, paddingRight: 4 }}>{p.name || "Unknown"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                      {running === p.id && <Spinner />}
                      <button onClick={async e => { e.stopPropagation(); await deleteSP(p.id); }}
                        title="Remove" style={{ background: "none", border: "none", cursor: "pointer",
                          color: C.textFaint, fontSize: 14, padding: "0 2px" }}
                        onMouseEnter={e => e.currentTarget.style.color = C.red}
                        onMouseLeave={e => e.currentTarget.style.color = C.textFaint}>✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{p.company}</div>
                  {p.email && <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>✉️ {p.email}</div>}
                  {p.phone && <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>📱 {p.phone}</div>}
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge status={p.status} />
                    <span style={{ fontSize: 9, color: "#7C3AED", background: "#F5F0FF",
                      padding: "2px 8px", borderRadius: 10, border: "1px solid #DDD0F8",
                      fontFamily: MONO }}>📷 scanned</span>
                    {(p.status === "ready" || p.status === "error") && (
                      <button onClick={e => { e.stopPropagation(); runScannedAgent(p); }}
                        disabled={running !== null}
                        style={{ fontSize: 9, color: C.gold, background: C.goldDim,
                          border: `1px solid ${C.gold}44`, padding: "2px 8px", borderRadius: 10,
                          cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.5 : 1 }}>↺ Regen</button>
                    )}
                  </div>
                  {/* Follow-up chips */}
                  {p.status === "following" && (
                    <div style={{ marginTop: 5, display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {[3, 7, 14].map(day => {
                        const d = getDaysUntil(p, day);
                        const due = d !== null && d <= 0;
                        const soon = d !== null && d > 0 && d <= 1;
                        return (
                          <span key={day} style={{ fontSize: 9, fontFamily: MONO, padding: "2px 6px",
                            borderRadius: 10, background: due ? C.redDim : soon ? C.amberDim : "#F0F4F8",
                            color: due ? C.red : soon ? C.amber : C.textDim,
                            border: `1px solid ${due ? C.red + "44" : soon ? C.amber + "44" : "#E0E8F0"}` }}>
                            D{day}: {due ? "DUE" : `${d}d`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#F5F7FA" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* ── SCANNER PANEL ──────────────────────────────────────────── */}
            <div style={{ background: "#fff", border: "1px solid #E4ECF4", borderRadius: 14,
              padding: 24, marginBottom: 24,
              boxShadow: "0 2px 16px rgba(10,37,64,0.06)",
              animation: "fadeSlideUp 0.25s ease" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700,
                    color: C.navy, letterSpacing: "-0.02em" }}>Business Card Scanner</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>
                    Snap or upload a card — Claude extracts all contact details instantly
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <PrimaryBtn onClick={openCamera} color="#7C3AED">
                    📷 Use Camera
                  </PrimaryBtn>
                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={e => handleFileSelect(e.target.files[0])}
                    style={{ display: "none" }} />
                  <PrimaryBtn onClick={() => fileInputRef.current?.click()} color={C.gold}>
                    ↑ Upload Image
                  </PrimaryBtn>
                </div>
              </div>

              {/* Status messages */}
              {scanError && (
                <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.red}44`,
                  borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 14 }}>{scanError}</div>
              )}
              {scanSuccess && (
                <div style={{ padding: "10px 14px", background: C.greenDim, border: `1px solid ${C.green}44`,
                  borderRadius: 8, fontSize: 12, color: C.green, marginBottom: 14 }}>{scanSuccess}</div>
              )}

              {scanning && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                  background: C.goldDimmer, border: `1px solid ${C.gold}33`, borderRadius: 10, marginBottom: 14 }}>
                  <Spinner />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Reading card...</div>
                    <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>Claude is extracting contact details</div>
                  </div>
                </div>
              )}

              {/* Preview + edit form */}
              {(preview || editForm) && !scanning && (
                <div style={{ display: "flex", gap: 20, animation: "fadeSlideUp 0.2s ease" }}>

                  {/* Card preview */}
                  {preview && (
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO,
                        marginBottom: 6, letterSpacing: "0.08em" }}>CARD PREVIEW</div>
                      <img src={preview} alt="Scanned card"
                        style={{ width: 220, borderRadius: 10, border: "1px solid #E4ECF4",
                          boxShadow: "0 4px 16px rgba(10,37,64,0.10)", display: "block" }} />
                    </div>
                  )}

                  {/* Editable fields */}
                  {editForm && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: DISPLAY,
                        marginBottom: 2 }}>Review & Edit Extracted Details</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { key: "name",       label: "Full Name *"        },
                          { key: "company",    label: "Company *"          },
                          { key: "jobTitle",   label: "Job Title"          },
                          { key: "email",      label: "Email"              },
                          { key: "phone",      label: "Phone / WhatsApp"   },
                          { key: "linkedinUrl",label: "LinkedIn URL"       },
                          { key: "industry",   label: "Industry (inferred)"},
                          { key: "region",     label: "Region"             },
                          { key: "website",    label: "Website"            },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: 10, color: C.textMid, display: "block",
                              marginBottom: 3, fontFamily: FONT, fontWeight: 500 }}>{f.label}</label>
                            <input value={editForm[f.key] || ""}
                              onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE",
                                color: C.text, borderRadius: 6, padding: "7px 10px", fontSize: 12,
                                fontFamily: FONT, outline: "none", boxSizing: "border-box" }} />
                          </div>
                        ))}
                      </div>

                      {/* Extra notes */}
                      <div>
                        <label style={{ fontSize: 10, color: C.textMid, display: "block",
                          marginBottom: 3, fontFamily: FONT, fontWeight: 500 }}>Notes (from card)</label>
                        <textarea value={editForm.notes || ""}
                          onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                          rows={2}
                          style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE",
                            color: C.text, borderRadius: 6, padding: "7px 10px", fontSize: 12,
                            fontFamily: FONT, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <PrimaryBtn onClick={saveScanned}
                          disabled={!editForm.name && !editForm.company} color={C.green}>
                          ✓ Save Prospect
                        </PrimaryBtn>
                        <button onClick={discardScan} style={{ padding: "9px 18px", borderRadius: 6,
                          border: "1px solid #E4ECF4", background: "#fff", color: C.textMid,
                          fontSize: 12, fontFamily: FONT, cursor: "pointer" }}>
                          Discard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

             
            </div>

            {/* ── SELECTED PROSPECT DETAIL ────────────────────────────────── */}
            {!sel ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "60px 0", gap: 16, textAlign: "center" }}>
                <div style={{ fontSize: 48, opacity: 0.15 }}>👤</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 18, color: C.navy, fontWeight: 600 }}>
                  Select a scanned prospect
                </div>
                <div style={{ fontSize: 13, color: C.textDim, maxWidth: 380, lineHeight: 1.7 }}>
                  Scan a business card above or select an existing scanned contact from the sidebar to view messages and research.
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeSlideUp 0.22s ease" }}>

                {/* Prospect header */}
                <div style={{ background: "#fff", border: "1px solid #E4ECF4", borderRadius: 14,
                  padding: "20px 24px", marginBottom: 20,
                  boxShadow: "0 2px 8px rgba(10,37,64,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {/* Mini card preview */}
                      {sel.cardPreview && (
                        <img src={sel.cardPreview} alt="card"
                          style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 6,
                            border: "1px solid #E4ECF4", flexShrink: 0 }} />
                      )}
                      <div>
                        <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
                          color: C.navy, letterSpacing: "-0.02em", marginBottom: 4 }}>
                          {sel.name || "Unknown"}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
  {sel.jobTitle && (
    <div style={{ fontSize: 12, color: C.textMid, fontFamily: FONT, fontWeight: 500 }}>
      {sel.jobTitle}
    </div>
  )}
  {sel.company && (
    <div style={{ fontSize: 12, color: C.gold, fontFamily: FONT, fontWeight: 600 }}>
      {sel.company}
    </div>
  )}
</div>
                        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                          {sel.email     && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>✉️ {sel.email}</span>}
                          {sel.phone     && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>📱 {sel.phone}</span>}
                          {sel.website   && <a href={sel.website.startsWith("http") ? sel.website : "https://" + sel.website}
                            target="_blank" rel="noreferrer"
                            style={{ fontSize: 10, color: C.gold, fontFamily: MONO }}>🌐 {sel.website}</a>}
                          {sel.linkedinUrl && <a href={sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl}
                            target="_blank" rel="noreferrer"
                            style={{ fontSize: 10, color: "#0077B5", fontFamily: MONO }}>💼 LinkedIn</a>}
                          {sel.region    && <span style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>📍 {sel.region}</span>}
                        </div>
                        {sel.notes && (
                          <div style={{ marginTop: 8, fontSize: 11, color: C.textDim, fontFamily: FONT,
                            background: "#F8FAFC", padding: "6px 10px", borderRadius: 6,
                            border: "1px solid #E4ECF4", maxWidth: 460 }}>{sel.notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Badge status={sel.status} />

                      {/* Run Agent / Regen */}
                      {(sel.status === "idle" || sel.status === "error") && (
                        <PrimaryBtn onClick={() => runScannedAgent(sel)} disabled={running !== null} color={C.gold}>
                          {running === sel.id ? <><Spinner /> Running...</> : "⚡ Run Agent"}
                        </PrimaryBtn>
                      )}
                      {(sel.status === "ready" || sel.status === "following") && (
                        <button onClick={() => runScannedAgent(sel)} disabled={running !== null}
                          style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.gold}44`,
                            background: C.goldDim, color: C.gold, fontSize: 11, fontFamily: FONT,
                            fontWeight: 500, cursor: running ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 5, opacity: running ? 0.5 : 1 }}>
                          ↺ Regen
                        </button>
                      )}

                      {/* Mark Sent */}
                      {sel.status === "ready" && (
                        <PrimaryBtn onClick={() => markSent?.(sel.id)} color={C.green}>
                          ✓ Mark Sent
                        </PrimaryBtn>
                      )}

                      {/* Enrich — always show (mirrors Prospects page) */}
                      <button onClick={() => enrichProspect?.(sel)}
                        disabled={enriching === sel.id}
                        style={{ padding: "8px 14px", borderRadius: 6,
                          border: sel._enriched ? "1px solid #B8EDD3" : "1px solid #7C3AED44",
                          background: sel._enriched ? "#F0FBF5" : "#FAF5FF",
                          color: sel._enriched ? C.green : "#7C3AED",
                          fontSize: 11, fontFamily: FONT, fontWeight: 500,
                          cursor: enriching === sel.id ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", gap: 5 }}>
                        {enriching === sel.id
                          ? <><Spinner /> Enriching...</>
                          : sel._enriched ? `✅ via ${sel._enriched}` : "🔍 Enrich"}
                      </button>

                      {/* Fetch Phone — show if no phone */}
                      {!sel.phone && (
                        <button onClick={async () => {
                          setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _phoneFetching: true } : p));
                          try {
                            const res = await fetch("/api/enrich-phone", {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name: sel.name, company: sel.company, jobTitle: sel.jobTitle, linkedinUrl: sel.linkedinUrl || "" }),
                            });
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            const data = await res.json();
                            if (data.found && data.phone) {
                              setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, phone: data.phone, _phoneFetching: false } : p));
                            } else {
                              setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _phoneFetching: false } : p));
                            }
                          } catch {
                            setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _phoneFetching: false } : p));
                          }
                        }} disabled={sel._phoneFetching}
                          style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #0D9E6E44",
                            background: "#F0FBF5", color: C.green, fontSize: 11, fontFamily: FONT,
                            fontWeight: 500, cursor: sel._phoneFetching ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 5 }}>
                          {sel._phoneFetching ? <><Spinner /> Fetching...</> : "📱 Fetch Phone"}
                        </button>
                      )}

                      {/* Zoho CRM Push */}
                      {selM && (
                        <button onClick={async () => {
                          setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _zohoPushing: true, _zohoStatus: null } : p));
                          try {
                            const res = await fetch("/api/zoho-push", {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ prospect: sel, messages: selM, description: selR?.why_condense_fits || "" }),
                            });
                            const d = await res.json();
                            const ok = d.data?.[0]?.status === "success";
                            setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _zohoPushing: false, _zohoStatus: ok ? "success" : "error" } : p));
                            setTimeout(() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _zohoStatus: null } : p)), 4000);
                          } catch {
                            setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _zohoPushing: false, _zohoStatus: "error" } : p));
                            setTimeout(() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, _zohoStatus: null } : p)), 4000);
                          }
                        }} disabled={sel._zohoPushing}
                          style={{ padding: "8px 14px", borderRadius: 6, fontSize: 11, fontFamily: FONT, fontWeight: 500,
                            border: `1px solid ${sel._zohoStatus === "success" ? "#B8EDD3" : sel._zohoStatus === "error" ? "#FFCCCC" : "#E4629444"}`,
                            background: sel._zohoStatus === "success" ? "#F0FBF5" : sel._zohoStatus === "error" ? "#FFF5F5" : "#FFF0F5",
                            color: sel._zohoStatus === "success" ? C.green : sel._zohoStatus === "error" ? C.red : "#E46294",
                            cursor: sel._zohoPushing ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 5 }}>
                          {sel._zohoPushing ? <><Spinner /> Pushing...</>
                            : sel._zohoStatus === "success" ? "✅ Pushed!"
                            : sel._zohoStatus === "error" ? "❌ Failed"
                            : "☁️ Zoho CRM"}
                        </button>
                      )}

                      {/* Export PDF */}
                      {selM && exportProposalPDF && (
                        <button onClick={() => exportProposalPDF({ sel, selResearch: selR, selMessages: selM,
                          selMatchedStories: selStories, findIndustryUseCases,
                          onStart: () => setExportingPDF(true),
                          onDone:  () => setExportingPDF(false),
                          onError: () => setExportingPDF(false) })}
                          disabled={exportingPDF}
                          style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #7C3AED44",
                            background: "#F5F0FF", color: "#7C3AED", fontSize: 11, fontFamily: FONT,
                            fontWeight: 500, cursor: exportingPDF ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 5 }}>
                          {exportingPDF ? <><Spinner /> PDF...</> : "📄 Export PDF"}
                        </button>
                      )}

                      {/* Complete */}
                      {sel.status === "following" && (
                        <button onClick={() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, status: "done" } : p))}
                          style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.green}44`,
                            background: C.greenDim, color: C.green, fontSize: 11, fontFamily: FONT,
                            fontWeight: 500, cursor: "pointer" }}>✓ Complete</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Extra context box */}
                <div style={{ background: "#fff", border: "1px solid #E4ECF4", borderRadius: 10,
                  padding: 18, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>✏️ Extra Context</div>
                  <textarea value={extraContext[sel.id] || ""}
                    onChange={e => setExtraContext(prev => ({ ...prev, [sel.id]: e.target.value }))}
                    placeholder="Met at conference, using AWS IoT, mentioned pain with Kafka ops..."
                    style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4",
                      color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 12,
                      fontFamily: FONT, lineHeight: 1.7, outline: "none", resize: "vertical",
                      minHeight: 68, boxSizing: "border-box" }} />
                </div>

                {/* Agent log */}
                {logs[sel.id]?.length > 0 && (
                  <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8,
                    padding: "14px 16px", marginBottom: 20 }}>
                    <div style={{ fontSize: 10, color: C.textMid, fontFamily: MONO,
                      letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                        background: running === sel.id ? C.amber : C.green }} />
                      AGENT LOG
                    </div>
                    <div style={{ maxHeight: 110, overflowY: "auto" }}>
                      {logs[sel.id].map((line, i) => (
                        <div key={i} style={{ fontSize: 11, fontFamily: MONO, lineHeight: 1.8,
                          color: line.startsWith("✅") ? C.green : line.startsWith("❌") ? C.red : C.textMid }}>
                          {line}
                        </div>
                      ))}
                      {running === sel.id && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                          <Spinner />
                          <span style={{ fontSize: 11, fontFamily: MONO, color: C.blue }}>Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab bar */}
                {(selR || selM) && (
                  <div style={{ display: "flex", borderBottom: "2px solid #E4ECF4", marginBottom: 20,
                    background: "#fff", borderRadius: "8px 8px 0 0", padding: "0 4px" }}>
                    {[
                      { key: "messages",   label: "💬 Messages"  },
                      { key: "research",   label: "🔍 Research"  },
                      { key: "stories",    label: `🏆 Stories${selStories.length > 0 ? ` (${selStories.length})` : ""}` },
                      { key: "objections", label: "🛡️ Objections" },
                    ].map(t => (
                      <button key={t.key} onClick={() => setActiveTab(t.key)}
                        style={{ padding: "12px 18px", border: "none", background: "transparent",
                          cursor: "pointer",
                          borderBottom: activeTab === t.key ? "2px solid #1B6EF3" : "2px solid transparent",
                          marginBottom: "-2px", color: activeTab === t.key ? "#1B6EF3" : C.textDim,
                          fontFamily: FONT, fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
                          borderRadius: "6px 6px 0 0", transition: "all 0.12s" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── MESSAGES TAB ─────────────────────────────────────── */}
                {activeTab === "messages" && selM && (
                  <div style={{ background: "#fff", border: "1px solid #E4ECF4",
                    borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                    {/* Sub-tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid #EEF2F7",
                      overflowX: "auto", padding: "0 4px" }}>
                      {FOLLOWUP_SCHEDULE.map(m => {
                        const isActive = activeMsg === m.key;
                        return (
                          <button key={m.key} onClick={() => setActiveMsg(m.key)}
                            style={{ padding: "10px 14px", border: "none", background: "transparent",
                              cursor: "pointer",
                              borderBottom: isActive ? "2px solid #1B6EF3" : "2px solid transparent",
                              color: isActive ? "#1B6EF3" : C.textDim,
                              fontFamily: FONT, fontSize: 11, fontWeight: isActive ? 600 : 400,
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                              minWidth: 76, whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 9, color: C.textDim }}>{m.icon} {m.day}</span>
                            <span style={{ textTransform: "uppercase", fontSize: 9 }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Message editor */}
                    {activeMsg && (() => {
                      const msgDef  = FOLLOWUP_SCHEDULE.find(m => m.key === activeMsg);
                      const editKey = `${sel.id}_${activeMsg}`;
                      const raw     = scannedEdits[editKey] ?? selM[activeMsg] ?? "";
                      const isFollowup = ["day3_followup","day7_followup","day14_followup",
                        "email_followup1","email_followup2"].includes(activeMsg);
                      const fn = sel.name?.split(" ")[0] || "";
                      const alreadyGreeted = /^(hi |greetings|dear |hope)/i.test(raw.trimStart());
                      const text = (isFollowup && fn && !alreadyGreeted && edits[editKey] === undefined)
                        ? `Hi ${fn},\n\n${raw}` : raw;

                      return (
                        <div style={{ padding: 20 }}>
                          <div style={{ display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{msgDef.label}</div>
                              <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginTop: 3 }}>{msgDef.hint}</div>
                              {activeMsg === "email_body" && selM.email_subject && (
                                <div style={{ marginTop: 8, padding: "5px 10px", background: C.goldDimmer,
                                  borderRadius: 4, fontSize: 11, fontFamily: MONO, color: C.goldBright }}>
                                  Subject: {selM.email_subject}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              {edits[editKey] !== undefined && (
                                <button onClick={() => setScannedEdits(prev => { const n = {...prev}; delete n[editKey]; return n; })}
                                  style={{ fontSize: 11, color: C.textDim, background: "none",
                                    border: "none", cursor: "pointer" }}>↺ Reset</button>
                              )}
                              <button onClick={() => navigator.clipboard.writeText(text)}
                                style={{ fontSize: 11, color: C.gold, background: C.goldDim,
                                  border: `1px solid ${C.gold}33`, padding: "5px 12px",
                                  borderRadius: 6, cursor: "pointer", fontFamily: FONT, fontWeight: 500 }}>
                                📋 Copy
                              </button>
                            </div>
                          </div>

                          <textarea value={text}
                           onChange={e => {
                            setScannedEdits(prev => ({ ...prev, [editKey]: e.target.value }));
                            scannedDbSave("v3_scanned_edits", editKey, e.target.value);
                            }}
                            style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4",
                              color: C.navy, borderRadius: 8, padding: "14px 16px", fontSize: 13,
                              fontFamily: FONT, lineHeight: 1.9, resize: "vertical", outline: "none",
                              minHeight: activeMsg === "email_body" ? 280 : 140, boxSizing: "border-box" }} />

                          {/* Send buttons */}
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EEF2F7" }}>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO,
                              letterSpacing: "0.04em", marginBottom: 8 }}>SEND DIRECTLY →</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {/* WhatsApp */}
                              <button onClick={() => {
                                const ph = (senderProfile.phone || sel.phone || "").replace(/\D/g, "");
                                if (ph) {
                                  window.open(`https://wa.me/${ph}?text=${encodeURIComponent(text)}`, "_blank");
                                } else {
                                  navigator.clipboard.writeText(text);
                                  window.open("https://web.whatsapp.com/", "_blank");
                                }
                              }} style={{ padding: "7px 14px", borderRadius: 4, cursor: "pointer",
                                border: "1px solid rgba(37,211,102,0.35)", background: "rgba(37,211,102,0.08)",
                                color: "#25D366", fontSize: 11, fontFamily: FONT, fontWeight: 500,
                                display: "flex", alignItems: "center", gap: 5 }}>
                                💬 WhatsApp
                              </button>
                              {/* Email */}
                              <button onClick={() => {
                                const sig  = senderProfile.signature ? `\n\n${senderProfile.signature}` : "";
                                const subj = encodeURIComponent(selM.email_subject || `Zeliot Condense — ${sel.company}`);
                                const body = encodeURIComponent(text + sig);
                                window.open(`mailto:${sel.email || ""}?subject=${subj}&body=${body}`, "_blank");
                              }} style={{ padding: "7px 14px", borderRadius: 4, cursor: "pointer",
                                border: `1px solid ${C.amber}55`, background: C.amberDim,
                                color: C.amber, fontSize: 11, fontFamily: FONT, fontWeight: 500,
                                display: "flex", alignItems: "center", gap: 5 }}>
                                ✉️ Send Mail
                              </button>
                              {/* LinkedIn */}
                              <button onClick={() => {
                                const url = sel.linkedinUrl
                                  ? (sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl)
                                  : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((sel.name || "") + " " + (sel.company || ""))}`;
                                navigator.clipboard.writeText(text);
                                window.open(url, "_blank");
                              }} style={{ padding: "7px 14px", borderRadius: 4, cursor: "pointer",
                                border: "1px solid #0077B544", background: "#EBF5FB",
                                color: "#0077B5", fontSize: 11, fontFamily: FONT, fontWeight: 500,
                                display: "flex", alignItems: "center", gap: 5 }}>
                                💼 LinkedIn
                              </button>
                            </div>

                            {/* Mark sent */}
                            {edits[`${sel.id}_sent_${activeMsg}`] ? (
                              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 14px", background: "#F0FBF5", border: "1px solid #B8EDD3",
                                borderRadius: 6 }}>
                                <span>✅</span>
                                <span style={{ fontSize: 12, color: C.green, fontFamily: FONT, fontWeight: 500 }}>
                                  Marked as sent · {new Date(edits[`${sel.id}_sent_${activeMsg}`].sentAt).toLocaleDateString()}
                                </span>
                                <button onClick={() => setEdits(prev => { const n={...prev}; delete n[`${sel.id}_sent_${activeMsg}`]; return n; })}
                                  style={{ marginLeft: "auto", fontSize: 10, color: C.textDim, background: "none", border: "none", cursor: "pointer" }}>undo</button>
                              </div>
                            ) : (
                              <button onClick={() => {
                                const sentAt = new Date().toISOString();
                                setEdits(prev => ({ ...prev, [`${sel.id}_sent_${activeMsg}`]: { sentAt } }));
                                setProspects(prev => prev.map(p => p.id === sel.id
                                  ? { ...p, sentLog: { ...(p.sentLog || {}), [activeMsg]: sentAt } } : p));
                              }} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6,
                                padding: "8px 16px", borderRadius: 6, border: "1px solid #B8EDD3",
                                background: "#F0FBF5", color: C.green, fontSize: 12, fontFamily: FONT,
                                fontWeight: 500, cursor: "pointer" }}>
                                <span>✓</span> Mark this message as sent
                              </button>
                            )}
                          </div>

                          {/* Star rating */}
                          <div style={{ marginTop: 16, padding: 16, background: "#F8FAFC",
                            borderRadius: 8, border: "1px solid #E4ECF4" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>
                              ⭐ Rate this message
                            </div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                              {[1,2,3,4,5].map(star => {
                                const cur = ratings[editKey]?.stars || 0;
                                return (
                                  <button key={star} onClick={() => {
                                    const r = { stars: star, message: text, messageType: activeMsg,
                                      prospect: sel.name, company: sel.company, createdAt: new Date().toISOString() };
                                    setRatings(prev => ({ ...prev, [editKey]: r }));
                                    if (star >= 4) {
                                      const ex = { id: `t_${Date.now()}`, ...r, feedback: ratingFeedback[editKey] || "" };
                                      setTrainingExamples(prev => prev.find(t => t.id === ex.id) ? prev : [...prev, ex]);
                                    }
                                  }} style={{ fontSize: 22, background: "none", border: "none",
                                    cursor: "pointer", color: star <= cur ? "#F5A623" : "#D8E2EE",
                                    transform: star <= cur ? "scale(1.1)" : "scale(1)", transition: "all 0.15s" }}>★</button>
                                );
                              })}
                              {ratings[editKey]?.stars >= 4 && (
                                <span style={{ fontSize: 11, color: C.green, fontFamily: MONO, marginLeft: 8, alignSelf: "center" }}>✅ Added to training!</span>
                              )}
                            </div>
                            <textarea value={ratingFeedback[editKey] || ""}
                              onChange={e => setRatingFeedback(prev => ({ ...prev, [editKey]: e.target.value }))}
                              placeholder="Optional: what did you like or want changed?"
                              rows={2}
                              style={{ width: "100%", background: "#fff", border: "1px solid #D8E2EE",
                                color: C.text, borderRadius: 6, padding: "7px 12px", fontSize: 12,
                                fontFamily: FONT, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── RESEARCH TAB ─────────────────────────────────────── */}
                {activeTab === "research" && selR && (
                  <div style={{ background: "#fff", border: "1px solid #E4ECF4",
                    borderRadius: "0 0 10px 10px", padding: 20,
                    display: "flex", flexDirection: "column", gap: 12 }}>

                    {/* Fit score */}
                    {selR.condense_fit && (() => {
                      const sc = selR.condense_fit.score;
                      const col = sc === "high" ? C.green : sc === "medium" ? C.amber : C.red;
                      return (
                        <div style={{ background: `${col}15`, border: `1px solid ${col}44`,
                          borderRadius: 10, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 18 }}>{sc === "high" ? "🟢" : sc === "medium" ? "🟡" : "🔴"}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: col, fontFamily: FONT }}>
                              {sc?.toUpperCase()} FIT — {sel.company}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selR.condense_fit.reason}</div>
                        </div>
                      );
                    })()}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginBottom: 8 }}>COMPANY OVERVIEW</div>
                        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selR.company_overview}</div>
                      </div>
                      <div style={{ background: "#FFFBF0", border: "1px solid #F0C070", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, color: C.amber, fontFamily: MONO, marginBottom: 8 }}>PAIN POINTS</div>
                        {(selR.pain_points || []).map((pt, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0",
                            display: "flex", gap: 8, lineHeight: 1.5 }}>
                            <span style={{ color: C.amber, flexShrink: 0 }}>—</span>{pt}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "#F0FBF5", border: "1px solid #B8EDD3", borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 10 }}>⚡ Why Condense Helps {sel.company}</div>
                      {(selR.why_condense_fits || "").split(". ").filter(s => s.trim()).map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px",
                          background: "#fff", borderRadius: 8, border: "1px solid #B8EDD3", marginBottom: 6 }}>
                          <span style={{ color: C.green, fontWeight: 700, flexShrink: 0, fontFamily: MONO }}>→</span>
                          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                            {pt.trim()}{pt.trim().endsWith(".") ? "" : "."}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginBottom: 8 }}>TECH SIGNALS</div>
                        {(selR.tech_stack_signals || []).map((s, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0",
                            display: "flex", gap: 8 }}>
                            <span style={{ color: C.gold }}>·</span>{s}
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginBottom: 8 }}>CONVERSATION HOOKS</div>
                        {(selR.conversation_hooks || []).map((h, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0",
                            borderBottom: "1px solid #EEF2F7", lineHeight: 1.5 }}>
                            <span style={{ color: C.purple, fontWeight: 700 }}>{i + 1}.</span> {h}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pre-read links */}
                    {selR.pre_read_links?.length > 0 && (
                      <div style={{ background: "#fff", border: "1px solid #E4ECF4", borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 10, color: C.gold, fontFamily: MONO, marginBottom: 10 }}>📎 PRE-READ LINKS</div>
                        {selR.pre_read_links.map((link, i) => (
                          <div key={i} style={{ padding: "7px 10px", background: "#F8FAFC", borderRadius: 6,
                            marginBottom: 6, borderLeft: "3px solid #1B6EF3" }}>
                            <a href={link.url} target="_blank" rel="noreferrer"
                              style={{ fontSize: 12, color: C.gold, textDecoration: "none", fontWeight: 500 }}>
                              {link.title} ↗
                            </a>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>{link.relevance}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STORIES TAB ──────────────────────────────────────── */}
                {activeTab === "stories" && (
                  <div style={{ background: "#fff", border: "1px solid #E4ECF4",
                    borderRadius: "0 0 10px 10px", padding: 20 }}>
                    {selStories.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "32px 0", color: C.textDim, fontFamily: MONO, fontSize: 12 }}>
                        No closely matched stories — run the agent first.
                      </div>
                    ) : selStories.map((story, i) => (
                      <div key={story.id} style={{ background: "#fff",
                        border: `1px solid ${i === 0 ? "#B8CCFF" : "#E4ECF4"}`,
                        borderRadius: 10, padding: 16, marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{story.company}</div>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>{story.industry}</div>
                          </div>
                          {i === 0 && <span style={{ fontSize: 9, fontFamily: MONO, color: C.gold,
                            background: C.goldDim, padding: "2px 8px", borderRadius: 10 }}>BEST MATCH</span>}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 8 }}>{story.summary}</div>
                        <div style={{ padding: "6px 10px", background: C.greenDim, borderRadius: 6,
                          fontSize: 11, color: C.green }}>📈 {story.outcome}</div>
                        <button onClick={() => navigator.clipboard.writeText(`${story.company} — ${story.summary} Result: ${story.outcome}`)}
                          style={{ marginTop: 8, fontSize: 10, color: C.textDim, background: "none",
                            border: "1px solid #E4ECF4", padding: "4px 10px", borderRadius: 4,
                            cursor: "pointer", fontFamily: MONO }}>Copy for pitch</button>
                      </div>
                    ))}

                    {SUCCESS_STORIES.filter(s => !selStories.find(m => m.id === s.id)).map(story => (
                      <div key={story.id} style={{ display: "flex", justifyContent: "space-between",
                        alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F0F4F8" }}>
                        <div>
                          <div style={{ fontSize: 12, color: C.textMid, fontWeight: 500 }}>{story.company}</div>
                          <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>{story.industry}</div>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(`${story.company} — ${story.summary} Result: ${story.outcome}`)}
                          style={{ fontSize: 10, color: C.textDim, background: "none",
                            border: "1px solid #E4ECF4", padding: "4px 10px", borderRadius: 4,
                            cursor: "pointer", fontFamily: MONO }}>Copy</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── OBJECTIONS TAB ───────────────────────────────────── */}
                {activeTab === "objections" && selM?.objections && (
                  <div style={{ background: "#fff", border: "1px solid #E4ECF4",
                    borderRadius: "0 0 10px 10px", padding: 20,
                    display: "flex", flexDirection: "column", gap: 10 }}>
                    {selM.objections.map((obj, i) => (
                      <div key={i} style={{ background: "#fff", border: "1px solid #E4ECF4",
                        borderRadius: 10, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>
                            ？ {obj.title}
                          </span>
                          <button onClick={() => navigator.clipboard.writeText(obj.response)}
                            style={{ fontSize: 11, color: C.textDim, background: "none",
                              border: "1px solid #E4ECF4", padding: "4px 10px", borderRadius: 4,
                              cursor: "pointer", fontFamily: MONO }}>Copy</button>
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7,
                          padding: "10px 14px", background: "#F8FAFC", borderRadius: 6 }}>
                          {obj.response}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── FOLLOW-UP TIMELINE ───────────────────────────────── */}
                {sel.status === "following" && sel.sentAt && (
                  <div style={{ background: "#fff", border: "1px solid #E4ECF4", borderRadius: 10,
                    padding: "18px 24px", marginTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 16 }}>
                      Follow-Up Timeline
                    </div>
                    <div style={{ display: "flex", position: "relative" }}>
                      <div style={{ position: "absolute", top: 14, left: "12.5%", right: "12.5%",
                        height: 2, background: "#E4ECF4", zIndex: 0 }} />
                      {[{ label: "Sent", day: 0, key: "day0_message" },
                        { label: "Day 3", day: 3, key: "day3_followup" },
                        { label: "Day 7", day: 7, key: "day7_followup" },
                        { label: "Day 14", day: 14, key: "day14_followup" }
                      ].map(step => {
                        const d = getDaysUntil(sel, step.day);
                        const due = d !== null && d <= 0;
                        return (
                          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column",
                            alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%",
                              background: due ? C.greenDim : "#F0F4F8",
                              border: `1px solid ${due ? C.green : "#D8E2EE"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, color: due ? C.green : C.textDim }}>
                              {due ? "✓" : "·"}
                            </div>
                            <div style={{ fontSize: 10, color: due ? C.green : C.textDim, fontFamily: MONO }}>
                              {step.label}
                            </div>
                            {step.day > 0 && (
                              <div style={{ fontSize: 9, fontFamily: MONO, color: due ? C.red : C.amber }}>
                                {due ? "OVERDUE" : `in ${d}d`}
                              </div>
                            )}
                            {due && step.day > 0 && (
                              <button onClick={() => { setActiveTab("messages"); setActiveMsg(step.key); }}
                                style={{ fontSize: 9, color: C.green, background: C.greenDim,
                                  border: `1px solid ${C.green}44`, padding: "2px 8px",
                                  borderRadius: 4, cursor: "pointer", fontFamily: MONO }}>View →</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
