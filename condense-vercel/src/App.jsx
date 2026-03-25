import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ─── TRAINING DATA (32 real Veera messages) ─────────────────────────────────
const trainingData = [{"name": "Samir Soman", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "USA", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "After connection", "text": "Greetings Samir. Pleasure connecting with you. How are you?"}, {"stage": "Follow Up", "text": "Given your role as Cloud Architect-SRE & Platform Engineering Lead, DevOps at AutoZone, we believe Condense could support your platform initiatives by simplifying real-time streaming, reducing operational overhead around Kafka/streaming infrastructure, improving observability, and enabling more scalable, reliable data pipelines across cloud environments."}, {"stage": "Follow Up", "text": "We would appreciate 30 minutes at your convenience for a quick virtual discussion to understand your current architecture and explore potential areas of alignment along with your email id to share the detailed email. Need your support to take things forward. Thanks."}]}, {"name": "Pranjal Singh", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "India", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "First Message", "text": "Reached out to connect with you to have a 30mins of your slot during next week to position our platform Condense to AutoZone. Can I have your email id to send an tailored email and use cases. Thanks"}, {"stage": "Follow Up", "text": "I came across your profile while looking at teams building large-scale data platforms on GCP at AutoZone.\n\nAt Condense, we help data engineering teams ingest high-throughput streaming data, standardise pipelines, and operate reliably at scale—especially where Kafka, real-time telemetry, and cloud-native architectures are involved.\n\nWould love to exchange notes on how you're handling ingestion, schema evolution, and scaling on GCP."}, {"stage": "Follow Up", "text": "Can we connect next week on your availability for 30mins please?"}]}, {"name": "Shankar N", "job_title": "Senior Vice President- Customer Success", "seniority": "VP", "company": "UB Technology Innovations (UBTI)", "industry": "Software Solutions", "region": "USA", "pain_primary": "Complex data integration Multi-client reliability", "messages": [{"stage": "First Message", "text": "Hi Shankar. How are you?\n\nNeed your email id and if possible 30 mins of your available slots during next week to discuss.\n\n\nI will share a detailed email once I have your email. Thanks"}, {"stage": "Follow Up", "text": "Condense and UBTI can together deliver end-to-end digital transformation by combining a real-time data backbone with solution and application expertise. Condense ingests and streams high-volume data from IoT devices, OT systems, machines, and enterprise platforms, enabling real-time analytics, predictive maintenance, fleet intelligence, and AI-driven optimization."}, {"stage": "Follow Up", "text": "Could we schedule 30 minutes next week to discuss and decide on the appropriate next steps, including whether to proceed further?"}]}, {"name": "Bhavesh Panchal", "job_title": "Chief Technology Officer", "seniority": "CTO", "company": "Magenta Mobility", "industry": "EV Mobility", "region": "India", "pain_primary": "Real-time fleet and battery telemetry reliability. Scalable event processing for fleet growth.High availability for operational continuity Cost-efficient scaling of mobility data infrastructure", "messages": [{"stage": "First Message", "text": "Real-Time Data Platform for EV & Mobility Innovation for Magenta Mobility\nHi Bhavesh,\nHope you are doing well. I'm reaching out from Zeliot, a Bosch-backed deep-tech company building real-time data infrastructure for large-scale mobility platforms. Our platform, Condense, helps standardize and stream real-time data across EVs, charging infra, and enterprise systems—strengthening the data foundation without disrupting existing applications.\n\nWe commonly support use cases like enabling event-driven architectures for fleet operations, real-time analytics, and faster innovation across mobility platforms.\n\nWould you be open to a brief conversation to explore potential alignment with Magenta Mobility's technology roadmap?\n\nBest regards,\nVeera Raghavan"}]}, {"name": "Ajay Kumar", "job_title": "Chief Information Officer", "seniority": "CIO", "company": "Zero Motorcycles Inc.", "industry": "Electric Vehicle Manufacturing (Electric Motorcycles)", "region": "USA", "pain_primary": "Real-time vehicle and battery telemetry reliability, High availability of connected vehicle and monitoring systems, Scalable data infrastructure for growing EV fleets, Cost-efficient management of R&D and production data systems", "messages": [{"stage": "First Message", "text": "Ajay Sir. Good Morning. I'm reaching out to explore a potential collaboration between Zero Motorcycles and Zeliot, leveraging our Condense platform — a real-time data infrastructure built for connected vehicle ecosystems.\n\nCondense enables OEMs and EV manufacturers to seamlessly ingest, process, and analyze vehicle data at scale — helping improve diagnostics, compliance, and customer experience through standardized APIs and low-latency analytics.\n\nI'd love to schedule a short 30-minute discussion to walk you through how Condense could align with Zero Motorcycles' connected tech roadmap.\nWould next week work for you?\n\nLooking forward to your response.\n\nRegards,\nVeera"}, {"stage": "Follow Up", "text": "Condense-backed by BOSCH helps OEMs and EV manufacturers ingest, standardize, and analyze vehicle data at scale using low-latency, standardized APIs to improve diagnostics, compliance, and customer experience. I'd love to schedule a quick 30-minute discussion to explore how Condense could align with Zero Motorcycles' connected technology roadmap—would next week work for you?\nAlternatively, if you're attending Geotab Connect 2026, happening February 10–12 at the MGM Grand in Las Vegas, we could catch up there as well.\nLooking forward to hearing from you. Have a great day."}]}, {"name": "Bapun Kumar Pradhan", "job_title": "Product Development Engineer", "seniority": "Engineer", "company": "Routematic", "industry": "Transportation, Logistics, Supply Chain and Storage", "region": "India", "pain_primary": "Real-time employee transport tracking and route optimization reliability, Scalable processing of high-volume trip and GPS event data, High availability of scheduling and fleet management systems, Cost-efficient scaling of mobility operations infrastructure", "messages": [{"stage": "First Message", "text": "Hi Bapun,\n\nGood Morning! I'm Veera, leading Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our platform, Condense, simplifies Kafka and real-time data streaming with BYOC flexibility, governance, and an IoT/edge-first design.\n\nFor a mobility platform like Routematic, Condense can enable real-time trip data streaming, fleet telemetry, and route optimization analytics — helping improve reliability, efficiency, and overall commuter experience.\n\nWould you be open for a quick face to face meeting during next week to explore how we could support your product roadmap at Routematic?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n935-309-4136"}, {"stage": "Follow Up", "text": "GM Bapun,\nCondense backed by BOSCH helps mobility platforms ingest, standardize, and analyze vehicle and trip data at scale using low-latency APIs—enabling better fleet visibility, compliance, and operational intelligence without heavy data engineering. I'd love to schedule a quick 30-minute conversation to explore how Condense could align with Routematic's platform and growth roadmap. Would sometime next week work for you?"}]}, {"name": "Tushar Bhagat", "job_title": "Group CEO", "seniority": "CEO", "company": "Uffizio", "industry": "Software Development", "region": "India", "pain_primary": "Reliable real-time GPS and vehicle telemetry processing, Scalable handling of high-volume tracking and event data, High availability of mission-critical fleet management platforms, Cost-efficient infrastructure scaling for growing customer base", "messages": [{"stage": "First Message", "text": "Hi Sir,\nGreat connecting with you virtually on 9th Jan along with the Bosch team—really enjoyed the discussion and learning more about your platform roadmap. I have sent an email along the deck on Condense, Zeliot's Bosch-backed, AI-first real-time data streaming platform, already powering large-scale mobility and telematics use cases across OEMs.\nWe see strong alignment around Uffizio–Condense synergies (telematics ingestion, real-time transforms for domain algorithms) and proven OTA & high-frequency streaming at OEM scale.\nHappy to set up a short virtual demo with your technical team to walk through the architecture and relevant use cases when convenient.\nRegards,\nVeera"}]}, {"name": "Vikas Parihar", "job_title": "Global Automotive Supply Chain & Logistics Leader", "seniority": "Senior Leadership (Global Function Head level)", "company": "Ola Electric", "industry": "Electric Vehicles / Automotive", "region": "India (Global Role Scope)", "pain_primary": "Lack of unified real-time visibility across vehicle telemetry, charging networks, and distribution operations.", "messages": [{"stage": "Initial Outreach", "text": "Greetings Vikas,\n\nI'm Veera, leading Enterprise Business for India at Zeliot–Condense (Bosch-backed). Our flagship platform, Condense, helps enterprises simplify Kafka and real-time data streaming with BYOC flexibility, built-in governance, and an IoT/edge-first design.\n\nFor an EV pioneer like Ola Electric, Condense can enable real-time vehicle telemetry, charging network data streaming, and fleet performance analytics — driving operational efficiency, predictive insights, and enhanced customer experience.\n\nWould you be open for a virtual discussion next week, based on your availability, to explore potential synergies?\n\nBest regards,\nVeera Raghavan\nCountry Head – Enterprise Business (India)\nZeliot–Condense\n935-309-4136"}]}];

// ─── INDUSTRY USE CASES LIBRARY ──────────────────────────────────────────────
const INDUSTRY_USE_CASES = [
  {
    id: "automotive",
    industries: ["automotive", "auto", "car", "vehicle", "mobility", "oem", "two-wheeler", "ev", "electric vehicle", "fleet", "telematics"],
    intro: "Given [COMPANY]'s leadership in automotive platforms and mobility intelligence, we see strong alignment in how Condense can help power real-time, scalable automotive data systems.",
    use_cases: [
      { title: "Connected Vehicle Data Platforms", desc: "Ingest and process telemetry from vehicles at scale and power downstream mobility services." },
      { title: "Real-Time Vehicle Intelligence APIs", desc: "Enable instant insights for pricing, diagnostics, driver behavior, and predictive maintenance." },
      { title: "Fleet & Dealer Analytics", desc: "Process streaming data from fleets, dealerships, and partner ecosystems for operational insights." },
      { title: "Insurance & Risk Intelligence", desc: "Enable real-time driving behavior analytics for usage-based insurance and risk scoring." },
      { title: "Marketplace & Vehicle Lifecycle Data", desc: "Unify vehicle telemetry, ownership, service, and marketplace data streams into a single real-time pipeline." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance while benefiting from a fully managed real-time processing platform." },
    ],
    social_proof: "Zeliot supports leading mobility and automotive companies such as TVS Motor, Volvo, Montra Electric, Bosch, Eicher, CEAT, Royal Enfield, Tata Motors, Adani Ports & Logistics, SML ISUZU, and Ashok Leyland — helping them build large-scale connected vehicle platforms, process high-frequency telematics data, and enable real-time mobility intelligence services.",
    closing: "I would be happy to walk you through how leading mobility platforms are using Condense. Please let me know a convenient time for a short discussion next week. Looking forward to your guidance on a suitable time for the discussion.",
  },
  {
    id: "ecommerce",
    industries: ["ecommerce", "e-commerce", "marketplace", "retail tech", "d2c", "quick commerce", "meesho", "flipkart", "amazon", "online retail"],
    intro: "Given the scale at which [COMPANY] operates its marketplace and analytics workloads, we see strong alignment in how Condense can simplify real-time data pipelines while significantly reducing infrastructure and operational complexity.",
    use_cases: [
      { title: "Real-Time Order & Seller Analytics", desc: "Stream updates from transaction systems into analytics platforms in real time to enable faster visibility into order flows, seller performance, and marketplace health." },
      { title: "Customer Behavior & Funnel Analytics", desc: "Capture and process high-volume app and web events to power real-time dashboards, experimentation frameworks, and personalization engines." },
      { title: "Fraud & Anomaly Detection", desc: "Stream transaction and activity data to identify suspicious behavior, payment anomalies, or operational risks instantly rather than hours later." },
      { title: "Operational Intelligence for Logistics & Fulfillment", desc: "Enable real-time monitoring of logistics events, delivery pipelines, and fulfillment operations to quickly detect bottlenecks or service disruptions." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance." },
    ],
    social_proof: "Many teams we work with have been able to reduce their streaming infrastructure and data pipeline costs by 40–50%, while significantly simplifying the engineering effort required to maintain these pipelines. Condense integrates seamlessly with existing modern data stacks such as Kafka, Snowflake, BigQuery, Databricks, and other analytics systems.",
    closing: "I would love to explore whether there might be an opportunity to support [COMPANY]'s analytics platform with real-time data capabilities or help optimize parts of the current streaming architecture. Would you be open to a 30-minute conversation sometime next week? Looking forward to connecting.",
  },
  {
    id: "retail",
    industries: ["retail", "autozone", "distribution", "supply chain", "wholesale", "fmcg", "cpg", "supermarket", "grocery"],
    intro: "Given your role at [COMPANY], I believe Condense can complement your existing architecture by acting as a scalable, low-latency streaming backbone that integrates seamlessly with your data systems.",
    use_cases: [
      { title: "Real-Time Inventory & Stock Visibility", desc: "Stream updates from POS systems, warehouse systems, and distribution centers into a unified pipeline to enable near real-time inventory reconciliation, low-stock alerts, and cross-location availability tracking." },
      { title: "Supply Chain & Logistics Monitoring", desc: "Ingest telemetry and order-status updates from multiple systems to provide live tracking of shipments, SLA monitoring, and exception handling with event-driven alerts." },
      { title: "Pricing & Promotion Intelligence", desc: "Enable real-time price updates, campaign triggers, and rule-based adjustments by streaming transactional and competitive pricing data directly into analytics systems." },
      { title: "Customer & Order Analytics", desc: "Capture order events, browsing behavior, and transaction streams in real time to power recommendation engines, fraud detection, and operational dashboards." },
      { title: "Streaming to BigQuery / Data Lake", desc: "Condense can write structured, partitioned data directly to analytics storage layers, enabling both real-time analytics and historical processing without additional ETL overhead." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance." },
    ],
    social_proof: "Condense is already trusted in production by leading automotive and mobility organizations, including TVS, Volvo Eicher, SML Isuzu, Tata Motors, Ashok Leyland, Instavans, Switch Mobility, Montra Electric, and Royal Enfield — supporting real-time vehicle data, manufacturing visibility, and digital platform initiatives at scale.",
    closing: "I would welcome 30 minutes at your convenience to understand your current streaming architecture and explore whether Condense could optimize performance, cost, or operational efficiency in your setup. Looking forward to connecting.",
  },
  {
    id: "healthcare",
    industries: ["healthcare", "hospital", "health", "medical", "pharma", "clinical", "diagnostics", "healthtech", "nicu", "icu"],
    intro: "For [COMPANY], we see strong alignment with your focus on patient-centric innovation and care excellence. Condense can play a key role across multiple clinical and operational dimensions.",
    use_cases: [
      { title: "Patient Monitoring & Telemetry", desc: "Real-time ingestion of vital signs (ECG, SpO₂, fetal monitoring, NICU telemetry) into centralized dashboards accessible by clinicians. Faster anomaly detection = better patient safety." },
      { title: "Predictive Analytics in Patient Care", desc: "Integration with AI/ML models for risk prediction, early warning systems, and outcomes forecasting." },
      { title: "Telehealth & Remote Monitoring", desc: "Seamlessly stream device and wearable data into secure cloud dashboards for remote consultations and follow-up care." },
      { title: "Hospital Operations Dashboards", desc: "Real-time view of bed occupancy, ER wait times, OT utilization, and resource bottlenecks." },
      { title: "Clinical Research Data Pipelines", desc: "Secure streaming of anonymized patient data for research collaborations, faster insights, and improved trial outcomes." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment ensuring complete control over patient data, security, and compliance." },
    ],
    social_proof: "Condense is a secure, scalable, and AI/ML-ready data platform backed by Bosch that simplifies Kafka and real-time streaming pipelines — helping enterprises consolidate fragmented data flows into a single intelligent backbone, improving clinical outcomes, operational efficiency, and cost optimization.",
    closing: "We would be delighted to showcase a live demo of Condense tailored to healthcare use cases and discuss how [COMPANY] can leverage it to improve care delivery while optimizing TCO. May I kindly request your availability for a short discussion next week? Looking forward to your guidance.",
  },
  {
    id: "digital_transformation",
    industries: ["digital transformation", "enterprise", "conglomerate", "it services", "consulting", "technology", "saas", "software", "platform"],
    intro: "Condense enables organizations to continuously stream and standardize live data from operational systems, enterprise applications, and digital products into a single real-time data foundation — creating a consistent, reusable data layer that internal product teams, process owners, and AI initiatives can build upon.",
    use_cases: [
      { title: "Unified Real-Time Data Backbone", desc: "Standardize live data flows across business functions, internal products, and platforms, ensuring shared context and consistency across transformation initiatives." },
      { title: "Real-Time Visibility & Process Optimization", desc: "Observe process performance as it happens, identify bottlenecks and deviations early, and support closed-loop improvement across operations and decision layers." },
      { title: "Accelerate AI, Analytics & Intelligent Automation", desc: "Provide AI/ML models, dashboards, and automation workflows with live data streams for faster learning, proactive decisioning, and real-time responsiveness." },
      { title: "Reduce Integration Sprawl", desc: "Replace fragmented, point-to-point integrations with a scalable streaming layer that simplifies operations and supports long-term platform and product evolution." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance." },
    ],
    social_proof: "Condense is already trusted in production by leading organizations including TVS Motor, Eicher Motors, SML Isuzu, Tata Motors, Ashok Leyland, Instavans, Switch Mobility, Montra Electric, and Royal Enfield — supporting real-time data, manufacturing visibility, and digital platform initiatives at scale.",
    closing: "If helpful, I'd be glad to share a brief overview focused on how Condense supports internal product platforms, AI readiness, and continuous process excellence. Looking forward to connecting.",
  },
];

function findIndustryUseCases(company, industry, researchData) {
  const target = `${company} ${industry} ${researchData?.company_overview || ""}`.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  INDUSTRY_USE_CASES.forEach(uc => {
    let score = 0;
    uc.industries.forEach(tag => { if (target.includes(tag)) score += 3; });
    if (score > bestScore) { bestScore = score; bestMatch = uc; }
  });
  return bestMatch || INDUSTRY_USE_CASES[4]; // default to digital_transformation
}

// ─── SUCCESS STORIES LIBRARY (from Zeliot PDFs) ──────────────────────────────
const SUCCESS_STORIES = [
  { id: "vecv_volvo_eicher", company: "VECV (Volvo Eicher)", industry: "Commercial Vehicle OEM", tags: ["automotive","oem","commercial vehicle","ibm","kafka","connected vehicle","fleet","eicher","volvo","truck"], summary: "VECV switched from IBM Event Streams to Condense to power their connected vehicle program for 200K+ M&HCV variants — achieving real-time scalability, cloud flexibility, and AIS-140 compliance.", outcome: "20% TCO reduction · 99.95% uptime · 35% less dev & ops spend · 6 months GTM acceleration · 500 MBps peak throughput · 200K connected vehicles." },
  { id: "royal_enfield", company: "Royal Enfield", industry: "Automotive OEM / Two-Wheeler", tags: ["automotive","oem","two-wheeler","gcp","kafka","byoc","motorbike","bike"], summary: "Royal Enfield uses Condense as the core streaming engine for their next-gen connected bike platform, handling high-volume telemetry on Google Cloud (GCP) with BYOC Kafka.", outcome: "40,000+ connected bikes · BYOC Kafka on GCP · high-volume telemetry ingestion at scale." },
  { id: "montra_electric", company: "Montra Electric", industry: "EV OEM / Electric Mobility", tags: ["ev","electric vehicle","oem","kafka","confluent","tco","three-wheeler","electric"], summary: "Montra Electric replaced Confluent + Sibros with Condense, handling 65 MBps average data ingress across diverse EV variants including trucks and 3-wheelers.", outcome: "40% reduction in TCO · scaled from 20K to 62K+ connected vehicles." },
  { id: "ceat", company: "CEAT Tyres", industry: "Tyre OEM / Fleet Management", tags: ["tyre","fleet","oem","byoc","fleet management","automotive"], summary: "CEAT built a full fleet-management system for intelligent tyre health analytics in under 120 days using Condense — fully deployed on their own cloud (BYOC).", outcome: "Rapid GTM in 120 days · 6,500+ connected vehicles · fully operational BYOC deployment." },
  { id: "adani_ports", company: "Adani Ports & Logistics", industry: "Logistics / Ports", tags: ["logistics","ports","supply chain","asset tracking","google pub/sub","adani"], summary: "Adani Ports deployed Condense as a unified backend for all connected assets across pan-India ports, integrating with Amnex device gateways via Google Pub/Sub.", outcome: "Pan-India asset control · Google Pub/Sub data backend · centralized monitoring across all ports." },
];

// ─── PERSISTENT STORAGE HELPERS ──────────────────────────────────────────────
async function dbSave(table, id, data) {
  if (!supabase) return;
  try {
    await supabase.from(table).upsert({ id, data, updated_at: new Date().toISOString() });
  } catch(e) { console.error('Save error:', e); }
}
async function dbLoad(table) {
  if (!supabase) return {};
  try {
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('id, data')
        .range(from, from + pageSize - 1);
      if (error || !data || data.length === 0) break;
      allData = [...allData, ...data];
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return Object.fromEntries(allData.map(r => [r.id, r.data]));
  } catch(e) { console.error('Load error:', e); return {}; }
}

// ─── GEMINI API WRAPPER ───────────────────────────────────────────────────────
async function callClaude({ system, messages, max_tokens = 1500 }) {
  const contents = messages.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user";
    let parts;
    if (typeof msg.content === "string") {
      parts = [{ text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      parts = msg.content.map((c) => {
        if (c.type === "text") return { text: c.text };
        if (c.type === "tool_result") return { text: String(c.content || "done") };
        return { text: JSON.stringify(c) };
      }).filter((p) => p.text);
    } else {
      parts = [{ text: String(msg.content || "") }];
    }
    return { role, parts: parts.length ? parts : [{ text: " " }] };
  });

  const body = {
    contents,
    generationConfig: { maxOutputTokens: max_tokens, temperature: 0.3, responseMimeType: "application/json" },
  };
  if (system) body.system_instruction = { parts: [{ text: system }] };

  const res = await fetch("/api/gemini", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Gemini error ${res.status}: ${e}`); }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Gemini API error");
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";
  return { content: [{ type: "text", text }], stop_reason: "end_turn" };
}

function extractJSON(text) {
  if (!text?.trim()) throw new Error("Empty response from Gemini");
  let s = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").replace(/<[^>]+>/g, "").trim();
  const start = s.indexOf("{"); const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  const parsed = JSON.parse(s.slice(start, end + 1));
  if (parsed.email_body) {
    parsed.email_body = parsed.email_body.replace(/\n{3,}/g, "\n\n");
  }
  return parsed;
}

function stripCites(text) {
  if (!text) return text;
  if (typeof text === "string") return text.replace(/<[^>]+>/g, "").trim();
  if (Array.isArray(text)) return text.map(stripCites);
  return text;
}

// ─── FIND MATCHING SUCCESS STORIES ───────────────────────────────────────────
function findMatchingStories(company, industry, researchData) {
  const target = `${company} ${industry} ${researchData?.company_overview || ""} ${(researchData?.pain_points || []).join(" ")}`.toLowerCase();
  return SUCCESS_STORIES.map(story => {
    let score = 0;
    story.tags.forEach(tag => { if (target.includes(tag.toLowerCase())) score += 2; });
    if (target.includes(story.industry.toLowerCase().split("/")[0].trim())) score += 3;
    return { ...story, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

// ─── RESEARCH AGENT (ENHANCED) ────────────────────────────────────────────────
async function runResearchAgent(company, linkedinUrl, personName, jobTitle, jdText, onLog) {
  onLog("🔍 Deep research starting for " + company + "...");
  await new Promise(r => setTimeout(r, 2000));

  const researchPrompt = `You are a B2B sales research agent for Condense (Kafka-based real-time data streaming platform by Zeliot, Bosch-backed). Provide detailed research JSON.`;

  const data = await callClaude({
    system: "You are a B2B research agent. Return ONLY valid JSON.",
    messages: [{ role: "user", content: researchPrompt }],
    max_tokens: 2500,
  });
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  return extractJSON(text);
}

// ─── LINKEDIN LOOKUP ──────────────────────────────────────────────────────────
async function lookupLinkedIn(linkedinUrl, onStatus) {
  onStatus("🔍 Looking up LinkedIn profile...");
  try {
    const res = await fetch("/api/linkedin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkedinUrl }),
    });
    if (!res.ok) throw new Error("Lookup failed");
    const data = await res.json();
    onStatus("✅ Profile found!");
    return data;
  } catch (err) { throw new Error("Could not extract profile: " + err.message); }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const FONT = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Sora', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap');
  body { background: #F5F7FA; font-family: 'Inter', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const C = {
  bg: "#F5F7FA", navy: "#0A2540", gold: "#1B6EF3", text: "#0A2540",
  textMid: "#4A6080", textDim: "#8A9BB0", red: "#E53E3E", redDim: "rgba(229,62,62,0.1)",
  green: "#0D9E6E", amber: "#D97706", amberDim: "rgba(217,119,6,0.1)"
};

const STATUS_CONFIG = {
  idle: { color: "#8A9BB0", bg: "#EEF2F7", label: "Not Started" },
  researching: { color: "#D97706", bg: "rgba(217,119,6,0.1)", label: "Researching" },
  generating: { color: "#1B6EF3", bg: "rgba(27,110,243,0.1)", label: "Generating" },
  ready: { color: "#0D9E6E", bg: "rgba(13,158,110,0.1)", label: "Ready" },
  following: { color: "#7C3AED", bg: "rgba(124,58,237,0.1)", label: "Following Up" },
};

const FOLLOWUP_SCHEDULE = [
  { key: "connection_note", label: "Connection Note", day: "Now", icon: "🔗", hint: "Max 300 chars" },
  { key: "day0_message", label: "First Message", day: "Day 0", icon: "💬", hint: "After acceptance" },
  { key: "email_body", label: "Email", day: "Email", icon: "✉️", hint: "Full email version" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return <span style={{ fontSize: 9, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>;
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: "1.5px solid #DDEAFF", borderTop: "1.5px solid #1B6EF3", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

function GlowButton({ onClick, disabled, children, primary }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "8px 16px", borderRadius: 6, background: primary ? "#1B6EF3" : "transparent", color: primary ? "#FFF" : "#1B6EF3", border: primary ? "none" : "1px solid #1B6EF3", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ border: "1px solid #D8E2EE", borderRadius: 6, padding: "8px", fontSize: 13 }} />
    </div>
  );
}

function SendButtons({ prospect, messageText }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
      <button onClick={() => window.open(`https://wa.me/${prospect.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(messageText)}`)} style={{ padding: '7px 14px', borderRadius: 4, background: '#25D366', color: '#FFF', border: 'none', fontSize: 11, cursor: 'pointer' }}>WhatsApp</button>
      <button onClick={() => window.open(`mailto:${prospect.email}?body=${encodeURIComponent(messageText)}`)} style={{ padding: '7px 14px', borderRadius: 4, background: '#D97706', color: '#FFF', border: 'none', fontSize: 11, cursor: 'pointer' }}>Email</button>
    </div>
  );
}

function NotificationBell({ notifications, onClear }) {
  const due = notifications.filter(n => !n.cleared);
  return <div style={{ padding: "6px 12px", border: "1px solid #E4ECF4", borderRadius: 6, color: C.amber }}>🔔 {due.length}</div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [prospects, setProspects] = useState([]);
  const [research, setResearch] = useState({});
  const [enriching, setEnriching] = useState(null);
  const [messages, setMessages] = useState({});
  const [edits, setEdits] = useState({});
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState({});
  const [activeMsg, setActiveMsg] = useState("connection_note");
  const [activeTab, setActiveTab] = useState("messages");
  const [activeView, setActiveView] = useState("prospects");
  const [dbLoaded, setDbLoaded] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState("");
  const [running, setRunning] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", jobTitle: "", linkedinUrl: "", email: "", phone: "", jdText: "" });
  const [trainingExamples, setTrainingExamples] = useState([]);
  const [replies, setReplies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [senderProfile, setSenderProfile] = useState({});
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchRunning, setBatchRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addLog = (id, msg) => setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));

  // ENRICH LOGIC
  const enrichProspect = async (prospect) => {
    if (!prospect.name || !prospect.company) return;
    setEnriching(prospect.id);
    addLog(prospect.id, "🔍 Searching contact info...");
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: prospect.name, company: prospect.company }),
      });
      const data = await res.json();
      setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, email: data.email || p.email, phone: data.phone || p.phone } : p));
      addLog(prospect.id, `✅ Found: ${data.email || "No email"}`);
    } catch (err) { addLog(prospect.id, `⚠️ Error: ${err.message}`); }
    finally { setEnriching(null); }
  };

  useEffect(() => {
    const sel = prospects.find(p => p.id === selected);
    if (sel && !sel.email && !enriching && !logs[sel.id]?.some(l => l.includes("Found"))) {
      enrichProspect(sel);
    }
  }, [selected, prospects]);

  useEffect(() => { setDbLoaded(true); }, []); // Mock db load

  const addProspect = () => {
    const id = `p_${Date.now()}`;
    setProspects(prev => [{ ...form, id, status: "idle", createdAt: new Date().toISOString() }, ...prev]);
    setSelected(id);
    setForm({ name: "", company: "", jobTitle: "", linkedinUrl: "", email: "", phone: "", jdText: "" });
  };

  const markSent = (id) => setProspects(prev => prev.map(p => p.id === id ? { ...p, status: "following", sentAt: new Date().toISOString() } : p));

  const getDaysUntilFollowup = (p, day) => {
    if (!p.sentAt) return 0;
    const target = new Date(new Date(p.sentAt).getTime() + day * 24 * 60 * 60 * 1000);
    return Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  };

  const sel = prospects.find(p => p.id === selected);

  if (!dbLoaded) return <div>Loading...</div>;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <div style={{ background: C.navy, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ color: "#FFF", fontWeight: 700 }}>Condense Outreach</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setActiveView("prospects")} style={{ color: "#FFF", background: "none", border: "none" }}>🎯 Prospects</button>
            <button onClick={() => setActiveView("dashboard")} style={{ color: "#FFF", background: "none", border: "none" }}>📊 Dashboard</button>
            <NotificationBell notifications={notifications} />
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* SIDEBAR */}
          {activeView === "prospects" && (
            <div style={{ width: 300, background: "#FFF", borderRight: "1px solid #E4ECF4", overflowY: "auto", padding: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <Input label="Name" value={form.name} onChange={v => setForm({...form, name: v})} />
                <Input label="Company" value={form.company} onChange={v => setForm({...form, company: v})} />
                <GlowButton onClick={addProspect} primary>+ Add Prospect</GlowButton>
              </div>

              {prospects.map(p => (
                <div key={p.id} onClick={() => setSelected(p.id)} style={{ padding: 10, borderBottom: "1px solid #F0F4F8", cursor: "pointer", background: selected === p.id ? "#EEF5FF" : "transparent" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{p.company}</div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge status={p.status} />
                    {enriching === p.id && <Spinner />}
                    {!p.email && p.status !== "researching" && enriching !== p.id && (
                      <span style={{ fontSize: 9, color: C.red, fontWeight: 700, fontFamily: MONO, background: C.redDim, padding: '2px 6px', borderRadius: 4 }}>⚠️ NO EMAIL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAIN */}
          <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
            {sel ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2>{sel.name} @ {sel.company}</h2>
                  <div style={{ display: "flex", gap: 10 }}>
                    {!sel.email && (
                      <button onClick={() => enrichProspect(sel)} disabled={enriching === sel.id} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #7C3AED44", color: "#7C3AED", fontSize: 11, cursor: "pointer" }}>
                        {enriching === sel.id ? <Spinner /> : "🔍 Find Email"}
                      </button>
                    )}
                    {sel.status !== "following" && <GlowButton onClick={() => markSent(sel.id)} primary>Mark Sent</GlowButton>}
                  </div>
                </div>

                <div style={{ display: "flex", borderBottom: "2px solid #E4ECF4", gap: 20, marginBottom: 20 }}>
                   <button onClick={() => setActiveTab("messages")}>Messages</button>
                   <button onClick={() => setActiveTab("research")}>Research</button>
                </div>

                {activeTab === "messages" && (
                  <div style={{ background: "#FFF", padding: 20, borderRadius: 8, border: "1px solid #E4ECF4" }}>
                    <textarea 
                      value={edits[`${sel.id}_msg`] || "Drafting..."} 
                      onChange={e => setEdits({...edits, [`${sel.id}_msg`]: e.target.value})}
                      style={{ width: "100%", minHeight: 200, padding: 10, borderRadius: 6, border: "1px solid #D8E2EE" }}
                    />
                    <SendButtons prospect={sel} messageText={edits[`${sel.id}_msg`] || ""} />
                  </div>
                )}

                {/* Follow-up Timeline */}
                {sel.status === "following" && sel.sentAt && (
                  <div style={{ marginTop: 20, padding: 20, background: "#FFF", borderRadius: 8, border: "1px solid #E4ECF4" }}>
                    <div style={{ fontWeight: 700, marginBottom: 15 }}>Follow-Up Timeline</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      {[0, 3, 7, 14].map(day => (
                        <div key={day} style={{ textAlign: "center" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: getDaysUntilFollowup(sel, day) <= 0 ? C.green : "#F0F4F8", margin: "0 auto" }} />
                          <div style={{ fontSize: 10, marginTop: 5 }}>Day {day}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", marginTop: 100, color: C.textDim }}>Select a prospect to start</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
