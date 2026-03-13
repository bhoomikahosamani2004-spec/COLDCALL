import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_SUPABASE_URL 
  || process.env.REACT_APP_SUPABASE_URL 
  || process.env.NEXT_PUBLIC_SUPABASE_URL 
  || "";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_SUPABASE_ANON_KEY 
  || process.env.REACT_APP_SUPABASE_ANON_KEY 
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  || "";
const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;
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
  {
    id: "fintech",
    industries: ["fintech", "finance", "banking", "insurance", "payments", "lending", "nbfc", "wealth", "trading", "stock", "investment","groww","zerodha","paytm","cred","razorpay"],
    intro: "Given [COMPANY]'s focus on financial services and data-driven decisioning, we see strong alignment in how Condense can power real-time financial data pipelines at scale.",
    use_cases: [
      { title: "Real-Time Transaction Monitoring", desc: "Stream and process high-volume transaction events to power fraud detection, risk scoring, and compliance monitoring in real time." },
      { title: "Customer Analytics & Personalization", desc: "Capture customer behavior streams to power real-time personalization, next-best-action engines, and churn prediction models." },
      { title: "Risk & Compliance Pipelines", desc: "Enable real-time streaming of regulatory data, audit trails, and risk indicators into compliance dashboards with full lineage." },
      { title: "Market Data & Trading Intelligence", desc: "Process high-frequency market data streams for algorithmic trading, portfolio analytics, and real-time pricing." },
      { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment ensuring complete control over financial data, security, and regulatory compliance." },
    ],
    social_proof: "Many fintech and financial services teams using Condense have reduced their streaming infrastructure costs by 40–50% while significantly improving pipeline reliability and reducing time-to-insight for risk and analytics teams.",
    closing: "I would be happy to walk you through how Condense can support [COMPANY]'s real-time data initiatives. Would you be open to a 30-minute discussion next week? Looking forward to connecting.",
  },
  {
  id: "gaming",
  industries: ["gaming", "fantasy", "sports", "dream11", "mpl", "esports", "game", "fantasy sports"],
  intro: "Given [COMPANY]'s leadership in fantasy sports and real-time user engagement at scale, we see strong alignment in how Condense can power high-throughput, low-latency data pipelines for your platform.",
  use_cases: [
    { title: "Real-Time Order & Seller Analytics", desc: "Stream updates from transaction systems into analytics platforms in real time to enable faster visibility into order flows, seller performance, and marketplace health." },
    { title: "Customer Behavior & Funnel Analytics", desc: "Capture and process high-volume app and web events to power real-time dashboards, experimentation frameworks, and personalization engines." },
    { title: "Fraud & Anomaly Detection", desc: "Stream transaction and activity data to identify suspicious behavior, payment anomalies, or operational risks instantly rather than hours later." },
    { title: "Scalable ML & AI Data Pipelines", desc: "Standardize and operate high-volume Kafka pipelines reliably at scale, reducing operational overhead and accelerating model deployment for data science teams." },
    { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance." },
  ],
  social_proof: "Zeliot supports leading technology and data-driven companies such as TVS Motor, Tata Motors, Royal Enfield, Eicher Motors, SML Isuzu, Adani Ports & Logistics, and Montra Electric — helping them build large-scale real-time data platforms, process high-frequency streaming data, and enable real-time intelligence services for critical applications.",
  closing: "I would be happy to walk you through how leading data-driven platforms are using Condense. Please let me know a convenient time for a short discussion next week. Looking forward to your guidance on a suitable time for the discussion.",
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
// ─── SUCCESS STORIES LIBRARY ─────────────────────────────────────────────────
const SUCCESS_STORIES = [
  { id: "tvs", company: "TVS Motor", industry: "Automotive OEM / Two-Wheeler", tags: ["automotive", "oem", "two-wheeler", "vehicle telemetry", "manufacturing"], summary: "TVS Motor uses Condense to stream real-time vehicle telemetry across connected two-wheelers, enabling predictive diagnostics and over-the-air data sync at scale.", outcome: "40% reduction in data pipeline complexity, real-time fleet visibility across 2M+ connected vehicles." },
  { id: "eicher", company: "Eicher Motors / Royal Enfield", industry: "Automotive OEM / Commercial Vehicles", tags: ["automotive", "oem", "commercial vehicle", "two-wheeler", "connected vehicle"], summary: "Eicher Motors deployed Condense for high-frequency CAN bus data streaming from commercial trucks and Royal Enfield motorcycles, standardizing data across vehicle lines.", outcome: "Unified real-time data backbone across two brands, enabling shared analytics and compliance." },
  { id: "tata_motors", company: "Tata Motors", industry: "Automotive OEM / EV / Commercial Vehicles", tags: ["automotive", "oem", "ev", "commercial vehicle", "fleet", "tata"], summary: "Tata Motors leverages Condense for real-time EV battery telemetry streaming and commercial fleet monitoring, supporting their transition to electric mobility.", outcome: "Real-time BMS data streaming enabling proactive battery health management at fleet scale." },
  { id: "ashok_leyland", company: "Ashok Leyland", industry: "Commercial Vehicle Manufacturing", tags: ["commercial vehicle", "automotive", "logistics", "fleet management", "manufacturing"], summary: "Ashok Leyland uses Condense to unify telemetry from heavy commercial vehicles, enabling real-time diagnostics and dealer network visibility.", outcome: "Reduced downtime through real-time fault detection; improved aftersales response by 35%." },
  { id: "sml_isuzu", company: "SML Isuzu", industry: "Commercial Vehicle / Light Trucks", tags: ["commercial vehicle", "automotive", "light trucks", "fleet"], summary: "SML Isuzu deployed Condense for vehicle data aggregation across their light commercial vehicle fleet, enabling centralized monitoring and analytics.", outcome: "Streamlined data from 10+ data sources into a single real-time pipeline." },
  { id: "three_wheeler_ev", company: "EV Three-Wheeler OEM (Confidential)", industry: "Electric Three-Wheeler / Last-Mile Delivery", tags: ["ev", "three-wheeler", "last-mile", "electric vehicle", "fleet", "delivery", "logistics"], summary: "A leading EV three-wheeler manufacturer uses Condense to stream battery and motor telemetry for their last-mile delivery fleet, enabling real-time route optimization and battery swap scheduling.", outcome: "30% improvement in battery utilization; predictive swap scheduling reduced downtime by 25%." },
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
    const { data } = await supabase.from(table).select('id, data');
    if (!data) return {};
    return Object.fromEntries(data.map(r => [r.id, r.data]));
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
    generationConfig: { maxOutputTokens: max_tokens, temperature: 0.7, responseMimeType: "application/json" },
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
  return JSON.parse(s.slice(start, end + 1));
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

  const researchPrompt = `You are a B2B sales research agent for Condense (Kafka-based real-time data streaming platform by Zeliot, Bosch-backed).

Research this prospect:
- Person: ${personName} (${jobTitle})
- Company: ${company}
- LinkedIn: ${linkedinUrl || "not provided"}
${jdText ? `- JD/Role Context: ${jdText.slice(0, 800)}` : ""}

Provide detailed research across ALL these areas:

1. COMPANY: What ${company} does, scale, revenue signals, HQ
2. TECH STACK: Search for "site:linkedin.com ${company} kafka" OR "${company} engineering blog" — identify streaming/data tech used
3. OPEN POSITIONS: Search "${company} data engineer jobs" OR "${company} kafka jobs" — list 2-3 relevant open roles that signal data infra investment
4. PERSONA ACTIVITY: What does a ${jobTitle} at ${company} typically focus on? What are their KPIs? What keeps them up at night?
5. PAIN POINTS: 4 specific pains relevant to their role AND company scale
6. RECENT NEWS: Search "${company} news 2025 2026" — funding, product launches, expansions
7. PRE-READ LINKS: Suggest 2-3 relevant articles/resources Veera could reference in outreach (company blog, industry report, their recent press release URLs if known)
8. WHY CONDENSE FITS: 2-3 sentence pitch tied to their specific tech signals and open roles
9. CONVERSATION HOOKS: 2 specific hooks based on open roles OR news OR tech signals

Respond with ONLY this JSON:
{
  "company_overview": "2-3 sentence summary",
  "tech_stack_signals": ["signal 1", "signal 2", "signal 3"],
  "open_positions": [{"title": "Data Engineer", "signal": "signals Kafka investment", "urgency": "high"}],
  "persona_context": {"focus_areas": ["area1","area2"], "kpis": ["kpi1","kpi2"], "pain_areas": ["pain1","pain2"]},
  "pain_points": ["pain 1", "pain 2", "pain 3", "pain 4"],
  "recent_news": ["news 1", "news 2"],
  "pre_read_links": [{"title": "Article title", "url": "https://...", "relevance": "Why this matters for pitch"}],
  "why_condense_fits": "2-3 sentences",
  "conversation_hooks": ["hook 1", "hook 2"],
  "confidence_score": 80
}`;

  const data = await callClaude({
    system: "You are a B2B research agent. Return ONLY valid JSON. Start with { and end with }. No markdown, no preamble.",
    messages: [{ role: "user", content: researchPrompt }],
    max_tokens: 2500,
  });
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const json = extractJSON(text);

  // Clean all citation artifacts
  const clean = {
    ...json,
    company_overview: stripCites(json.company_overview),
    tech_stack_signals: stripCites(json.tech_stack_signals),
    pain_points: stripCites(json.pain_points),
    recent_news: stripCites(json.recent_news),
    why_condense_fits: stripCites(json.why_condense_fits),
    conversation_hooks: stripCites(json.conversation_hooks),
  };
  onLog("✅ Research complete — " + (clean.pain_points?.length || 0) + " pain points, " + (clean.open_positions?.length || 0) + " open roles found");
  return clean;
}

// ─── MESSAGE GENERATION AGENT (ENHANCED) ──────────────────────────────────────
async function generateMessages(person, research, matchedStories, jdText, replyTrainingData, industryContext, onLog) {
  onLog("✍️ Crafting personalized messages with JD context + success stories...");

  const seniority = (person.seniority || "").toLowerCase();
  const industry = (person.industry || research.company_overview || "").toLowerCase();

  const scored = trainingData.map(ex => {
    let score = 0;
    if (ex.seniority && seniority && ex.seniority.toLowerCase() === seniority) score += 3;
    if (ex.seniority && seniority && (
      (["cto","cio","ceo"].some(s => seniority.includes(s)) && ["cto","cio","ceo"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["vp","avp","director"].some(s => seniority.includes(s)) && ["vp","avp","director"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["engineer","lead","specialist"].some(s => seniority.includes(s)) && ["engineer","lead","specialist"].some(s => ex.seniority.toLowerCase().includes(s))) ||
      (["manager","head"].some(s => seniority.includes(s)) && ["manager","head"].some(s => ex.seniority.toLowerCase().includes(s)))
    )) score += 2;
    const industryWords = industry.split(/[\s,/&]+/).filter(w => w.length > 4);
    industryWords.forEach(w => { if (ex.industry.toLowerCase().includes(w)) score += 1; });
    const avgLen = ex.messages.reduce((s, m) => s + m.text.length, 0) / (ex.messages.length || 1);
    if (avgLen > 100) score += 1;
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topExamples = scored.slice(0, 5).map(({ ex }) => ex);
  const examplesStr = topExamples.map(ex => {
    const msgs = ex.messages.slice(0, 2).map(m => `  [${m.stage}]: ${m.text.slice(0, 300)}`).join("\n");
    return `---\nPerson: ${ex.name} | ${ex.job_title} | ${ex.company} | Seniority: ${ex.seniority}\nPains: ${ex.pain_primary.slice(0, 150)}\nMessages:\n${msgs}`;
  }).join("\n\n");

  const allFirstMsgs = trainingData.flatMap(ex => ex.messages.filter(m => m.stage === "First Message" || m.stage === "After connection")).map(m => m.text);
  const allFollowUps = trainingData.flatMap(ex => ex.messages.filter(m => m.stage === "Follow Up")).map(m => m.text);
  const avgFirstLen = Math.round(allFirstMsgs.reduce((s, t) => s + t.split(" ").length, 0) / (allFirstMsgs.length || 1));
  const avgFollowLen = Math.round(allFollowUps.reduce((s, t) => s + t.split(" ").length, 0) / (allFollowUps.length || 1));

  // Build success story context
  const { industryUC, useCasesStr, industryIntro, industrySocialProof, industryClosing } = industryContext;
  const storyContext = matchedStories.length > 0
    ? matchedStories.map(s => `- ${s.company} (${s.industry}): ${s.summary} Result: ${s.outcome}`).join("\n")
    : "No closely matched stories — use general Condense value prop.";

  // Build reply training context
  const replyContext = replyTrainingData?.length > 0
    ? `\nLEARN FROM THESE SUCCESSFUL REPLIES (adjust tone accordingly):\n${replyTrainingData.slice(0, 3).map(r => `Industry: ${r.industry}\nWhat worked: ${r.reply_summary}\nTone that got reply: ${r.tone}`).join("\n\n")}`
    : "";

  const prompt = `You are Veera Raghavan, Country Head – Enterprise Business (India) at Zeliot–Condense (Bosch-backed).

ABOUT CONDENSE: ABOUT CONDENSE: Kafka-based real-time data streaming platform by Zeliot, backed by Bosch. BYOC. Managed Kafka + 50+ connectors + transforms + monitoring + schema registry. 40%+ lower TCO vs self-managed Kafka. Always refer to the company as "Zeliot" not "Zeliot-Condense". The platform is called "Condense". So usage is "Zeliot Condense" or just "Condense" — never "Zeliot–Condense".

YOUR WRITING STYLE — REAL MESSAGES:\n${examplesStr}

STYLE RULES — FOLLOW VEERA'S EXACT WRITING STYLE:

TONE & VOICE:
- Always professional, warm, and confident — never pushy or salesy
- Write like a senior business leader reaching out peer-to-peer
- Use "Greetings [Name]," to open every first message
- Second line always: "Hope you are doing well." + one specific personal touch about their company or role
- Introduce Condense as: "Zeliot Condense, a deep-tech real-time data platform backed by Bosch"
- Always tie Condense to their specific industry: "Given [Company]'s focus on [X], we see strong alignment..."
- Tone: CTO/CEO = strategic business impact | Engineer/Lead = technical peer | VP/Head = operational efficiency
- Region: India = warmer | International = more formal
- NEVER sound like a generic sales pitch — always feel researched and specific

LINKEDIN MESSAGE STRUCTURE:
- connection_note: MAX 300 chars. "Greetings [Name], came across your profile while exploring [their industry/company] — would love to connect and share how Zeliot Condense is helping similar organizations." No pitch.
- day0_message (First Message): 
  • "Greetings [Name], Hope you are doing well."
  • One line about their company/role from research
  • "I'm reaching out to introduce Zeliot Condense, a deep-tech real-time data platform backed by Bosch..."
  • "Given [Company]'s focus on [X], we see strong alignment..."
  • 2-3 specific use cases for their role (NO bullet points on LinkedIn — write as flowing sentences)
  • "I would be happy to share more details. Would you be open to a 30-minute discussion next week?"
  • Sign as: Veera Raghavan | Enterprise Business (India) | Zeliot | +91 935-309-4136
- day3_followup: 50-80 words. Different angle — reference open positions OR tech signal OR news. Keep door open. End with "Looking forward to connecting."
- day7_followup: 30-50 words. Reference a success story metric. Ask for 30 mins or email ID.
- day14_followup: 20-35 words. Final gentle nudge. "Looking forward to your guidance."

WHAT MAKES VEERA'S STYLE UNIQUE:
- He always mentions Bosch backing — it builds instant credibility
- He names specific customers: TVS Motor, Tata Motors, Ashok Leyland, Royal Enfield, Eicher Motors
- He ties use cases directly to the prospect's industry and role — never generic
- He ends with "Looking forward to connecting" or "Looking forward to your guidance"
- He asks for "30 minutes next week" — always specific
- He never uses jargon like "synergies" or "leverage" 
- He writes in complete, well-structured sentences
- Avg first message: ~${avgFirstLen} words | Avg follow-up: ~${avgFollowLen} words
${replyContext}

TARGET PROSPECT:
Name: ${person.name}
Role: ${person.jobTitle || "Unknown"}
Company: ${person.company}
Seniority: ${person.seniority || "infer from title"}
Region: ${person.region || "India"}
${jdText ? `\nJD CONTEXT (use this to personalize — reference their specific responsibilities):\n${jdText.slice(0, 600)}` : ""}

RESEARCH CONTEXT:
Company Overview: ${research.company_overview}
Tech Stack: ${(research.tech_stack_signals || []).join(", ")}
Pain Points: ${(research.pain_points || []).join(" | ")}
Open Positions: ${(research.open_positions || []).map(p => p.title + " (" + p.signal + ")").join(", ")}
Persona Focus: ${(research.persona_context?.focus_areas || []).join(", ")}
Recent News: ${(research.recent_news || []).join(" | ")}
Why Condense Fits: ${research.why_condense_fits}
Conversation Hooks: ${(research.conversation_hooks || []).join(" | ")}

RELEVANT SUCCESS STORIES TO REFERENCE (pick 1 most relevant):
${storyContext}
INDUSTRY USE CASES (use these EXACT use cases in email and LinkedIn — do not make up your own):
Industry matched: ${industryUC.id}
Industry intro line: ${industryIntro}
Use cases:
${useCasesStr}
Social proof to use: ${industrySocialProof}
Closing line to use: ${industryClosing}

INSTRUCTIONS:
1. connection_note: MAX 300 chars. Warm, curiosity-driven. Reference 1 specific thing about their role or company (use JD context if available). No pitch.
2. day0_message: 80-120 words. Open with strongest hook. Reference their JD responsibilities if provided. Name specific pain. Optionally reference 1 success story from a similar company. One CTA.
3. day3_followup: 50-80 words. Different angle — reference open positions found OR tech signal OR news. Keep door open.
4. day7_followup: 30-50 words. Softer. Reference the success story OR a specific metric. Ask for 30 mins or email.
5. day14_followup: 20-35 words. Final gentle nudge. No desperation.
6. email_subject: Compelling subject line under 60 chars. Format: "[Industry/Company] x Zeliot Condense | Real-Time Data Platform"
7. email_body: Full professional email following EXACTLY this structure and tone:

STRUCTURE TO FOLLOW:
- Line 1: Always use "Greetings [Name]," — NEVER use "Dear [Name]," under any circumstances
- Line 2: "Hope you are doing well." + ONE personal touch about their company/role (1 sentence)
- Para 1: "I'm reaching out to introduce Zeliot Condense, a deep-tech real-time data platform backed by Bosch, purpose-built for [their industry]. Condense helps organizations transform high-volume [relevant] data into reliable, production-grade data pipelines and real-time intelligence APIs without the operational complexity of managing streaming infrastructure."
- Para 2: "Given [Company]'s leadership in [specific area from research], we see strong alignment in how Condense can help power real-time, scalable [industry] data systems."
- Section: "Some relevant use cases where Condense can add value include:" followed by 4-6 bullet points. Each bullet: plain text title + dash + description. NO asterisks, NO markdown, NO bold formatting. Format exactly as: • Title – description Make bullets SPECIFIC to their job title and industry using research context. Examples:
  • Connected Vehicle Data Platforms – ingest and process telemetry from vehicles at scale
  • Real-Time [their domain] APIs – enable instant insights for [their KPIs]
  • [Their domain] Analytics – process streaming data for operational insights
  • BYOC (Bring Your Own Cloud) – Condense can be deployed within your own cloud environment (AWS/Azure/GCP), ensuring complete control over data, security, and compliance
- Para 3: "Unlike traditional streaming stacks that require heavy infrastructure management, Condense abstracts scaling, operations, and monitoring, allowing engineering teams to focus on building [industry] applications rather than managing data infrastructure."
- Pre-read section (ALWAYS include these exact links):
"As a pre-read, sharing the below information on Condense.
Condense Overview: https://docs.zeliot.in/condense
Case Studies: https://www.zeliot.in/case-studies
About Zeliot: www.zeliot.in/quick-links
Get Started with Condense: https://www.zeliot.in/try-now"
- Social proof: "Zeliot supports leading [industry] companies such as TVS Motor, Volvo, Tata Motors, Ashok Leyland, Royal Enfield, Eicher Motors, SML Isuzu, Adani Ports & Logistics, Montra Electric — helping them build large-scale connected platforms, process high-frequency data, and enable real-time intelligence services."
- Closing: "I would be happy to walk you through how leading [industry] platforms are using Condense. Please let me know a convenient time for a short discussion next week. Looking forward to your guidance on a suitable time for the discussion."
- Sign-off: Use senderProfile name, title, company and phone if provided, otherwise use: "Veera Raghavan\nEnterprise Business (India)\nZeliot\n+91 935-309-4136"
- Use "I'm reaching out" not "Greetings" in body paragraphs
- Bullet points ARE allowed in emails (unlike LinkedIn)
- Each bullet point must be relevant to their specific role and research
- Total length: 300-400 words
- Never use em dashes in bullet titles, use " – " instead

Return ONLY this JSON:
{
  "connection_note": "...",
  "day0_message": "...",
  "day3_followup": "...",
  "day7_followup": "...",
  "day14_followup": "...",
  "email_subject": "...",
  "email_body": "..."
}`;

  const data2 = await callClaude({
    system: "You are Veera Raghavan. Study the training examples and replicate the style precisely. Return ONLY valid JSON. Start with { and end with }.",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1800,
  });
  const text2 = (data2.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  onLog(`✅ Messages crafted using ${topExamples.length} training examples + ${matchedStories.length} success stories`);
  return extractJSON(text2);
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
    if (data.error) throw new Error(data.error);
    onStatus("✅ Profile found!");
    return data;
  } catch (err) { throw new Error("Could not extract profile: " + err.message); }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const DISPLAY = "'Sora', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F5F7FA; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F0F2F5; }
  ::-webkit-scrollbar-thumb { background: #C8D0DC; border-radius: 4px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes logIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .card-enter { animation: fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
  .log-line { animation: logIn 0.2s ease; }
  .fade-in { animation: fadeIn 0.3s ease; }
  input::placeholder { color: #A0AABB; }
  textarea::placeholder { color: #A0AABB; }
  input:focus, textarea:focus { outline: none; border-color: #1B6EF3 !important; box-shadow: 0 0 0 3px rgba(27,110,243,0.12) !important; }
  select:focus { outline: none; border-color: #1B6EF3 !important; box-shadow: 0 0 0 3px rgba(27,110,243,0.12) !important; }
  .prospect-card:hover { background: #EEF3FF !important; border-color: #B8CCFF !important; transform: translateX(2px); }
  .prospect-card { transition: all 0.15s ease; cursor: pointer; }
  .tab-btn:hover { color: #1B6EF3 !important; background: #F0F5FF !important; }
  .glow-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(27,110,243,0.25) !important; }
  .glow-btn { transition: all 0.15s ease; }
  .notif-badge { animation: pulse 2s ease infinite; }
  .send-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.96); }
  .send-btn { transition: all 0.15s ease; }
  input, textarea, select { font-family: 'Inter', sans-serif !important; }
`;

// Zeliot brand palette — white/light background, navy + electric blue
const C = {
  bg: "#F5F7FA",         // page background
  bgDeep: "#FFFFFF",     // card background
  surface: "#FFFFFF",    // panels
  surfaceAlt: "#F8FAFC", // alternate rows
  surfaceMid: "#EEF2F7", // inactive states

  border: "rgba(10,37,64,0.10)",
  borderBright: "rgba(27,110,243,0.35)",
  borderDim: "rgba(10,37,64,0.06)",

  // Primary = Zeliot electric blue
  gold: "#1B6EF3",
  goldBright: "#3D8BFF",
  goldDim: "rgba(27,110,243,0.10)",
  goldDimmer: "rgba(27,110,243,0.05)",

  // Semantic
  green: "#0D9E6E",      greenDim: "rgba(13,158,110,0.10)",
  amber: "#D97706",      amberDim: "rgba(217,119,6,0.10)",
  red: "#E53E3E",        redDim: "rgba(229,62,62,0.10)",
  blue: "#1B6EF3",       blueDim: "rgba(27,110,243,0.10)",
  purple: "#7C3AED",     purpleDim: "rgba(124,58,237,0.10)",
  whatsapp: "#25D366",   whatsappDim: "rgba(37,211,102,0.10)",

  // Navy for sidebar & header (Zeliot dark)
  navy: "#0A2540",
  navyMid: "#1A3A5C",
  navyLight: "#2A5080",

  // Text hierarchy
  text: "#0A2540",       // primary text — deep navy
  textMid: "#4A6080",    // secondary
  textDim: "#8A9BB0",    // muted
  textFaint: "#C8D4E0",  // very faint
};

const STATUS_CONFIG = {
  idle:        { color: "#8A9BB0",  bg: "#EEF2F7",                   label: "Not Started" },
  researching: { color: "#D97706",  bg: "rgba(217,119,6,0.10)",      label: "Researching" },
  generating:  { color: "#1B6EF3",  bg: "rgba(27,110,243,0.10)",     label: "Generating" },
  ready:       { color: "#0D9E6E",  bg: "rgba(13,158,110,0.10)",     label: "Ready to Send" },
  sent:        { color: "#1B6EF3",  bg: "rgba(27,110,243,0.08)",     label: "Sent" },
  following:   { color: "#7C3AED",  bg: "rgba(124,58,237,0.10)",     label: "Following Up" },
  done:        { color: "#0D9E6E",  bg: "rgba(13,158,110,0.10)",     label: "Complete" },
  replied:     { color: "#D97706",  bg: "rgba(217,119,6,0.10)",      label: "Replied ✓" },
  error:       { color: "#E53E3E",  bg: "rgba(229,62,62,0.10)",      label: "Error" },
};

const FOLLOWUP_SCHEDULE = [
  { key: "connection_note", label: "Connection Note", day: "Now",  icon: "🔗", hint: "Send with connection request · max 300 chars" },
  { key: "day0_message",    label: "First Message",   day: "Day 0",  icon: "💬", hint: "Send right after they accept" },
  { key: "day3_followup",   label: "Follow-Up 1",     day: "Day 3",  icon: "📨", hint: "3 days after first message" },
  { key: "day7_followup",   label: "Follow-Up 2",     day: "Day 7",  icon: "📨", hint: "7 days after first message" },
  { key: "day14_followup",  label: "Follow-Up 3",     day: "Day 14", icon: "📨", hint: "Final nudge — keep door open" },
  { key: "email_body",      label: "Email",           day: "Email",  icon: "✉️", hint: "Full email version" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO, padding: "3px 10px", borderRadius: 20, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>{cfg.label}</span>
  );
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: "1.5px solid #DDEAFF", borderTop: "1.5px solid #1B6EF3", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

function GlowButton({ onClick, disabled, children, color = C.gold, small, primary }) {
  return (
    <button onClick={onClick} disabled={disabled} className="glow-btn" style={{ padding: small ? "5px 12px" : primary ? "10px 20px" : "8px 16px", borderRadius: 6, border: primary ? "none" : `1px solid ${color}44`, background: primary ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "transparent", color: disabled ? C.textDim : primary ? "#FFFFFF" : color, fontWeight: primary ? 600 : 500, fontSize: small ? 11 : 12, letterSpacing: "0.01em", fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, boxShadow: primary ? "0 2px 10px rgba(27,110,243,0.30)" : "none" }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid, fontFamily: FONT }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 11px", fontSize: 13, fontFamily: FONT, outline: "none", transition: "all 0.15s" }} />
    </div>
  );
}

// Send Action Buttons
function SendButtons({ prospect, messageText, messageType, emailSubject, senderProfile = {} }) {
  const phone = senderProfile.phone || prospect.phone || "";
  const email = prospect.email || "";
  const name = prospect.name || "";

  const sendWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean) {
      window.open(`https://wa.me/${phoneClean}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://web.whatsapp.com/`, "_blank");
      navigator.clipboard.writeText(messageText);
      alert("WhatsApp opened. Message copied to clipboard — paste it in the chat.");
    }
  };

  const sendSMS = () => {
    const encoded = encodeURIComponent(messageText);
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean) {
      window.open(`sms:${phoneClean}?body=${encoded}`, "_blank");
    } else {
      navigator.clipboard.writeText(messageText);
      alert("No phone number saved. Message copied to clipboard.");
    }
  };

  const sendEmail = () => {
    const signature = senderProfile.signature ? `\n\n${senderProfile.signature}` : "";
    const fullBody = messageText + signature;
    const subject = encodeURIComponent(emailSubject || `Zeliot Condense — ${prospect.company}`);
    const body = encodeURIComponent(fullBody);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
      <button className="send-btn" onClick={sendWhatsApp} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.whatsapp}55`, background: C.whatsappDim, color: C.whatsapp, fontSize: 11, fontFamily: FONT, fontWeight: 500, cursor: "pointer" }}>
        <span style={{ fontSize: 14 }}>💬</span> WhatsApp
      </button>
      <button className="send-btn" onClick={sendSMS} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.blue}55`, background: C.blueDim, color: C.blue, fontSize: 11, fontFamily: FONT, fontWeight: 500, cursor: "pointer" }}>
        <span style={{ fontSize: 14 }}>📱</span> SMS
      </button>
      <button className="send-btn" onClick={sendEmail} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.amber}55`, background: C.amberDim, color: C.amber, fontSize: 11, fontFamily: FONT, fontWeight: 500, cursor: "pointer" }}>
        <span style={{ fontSize: 14 }}>✉️</span> Send Mail
      </button>
    </div>
  );
}

// Notification Bell
function NotificationBell({ notifications, onClear }) {
  const [open, setOpen] = useState(false);
  const due = notifications.filter(n => !n.cleared);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: due.length > 0 ? "#FFF8EB" : "#F8FAFC", border: `1px solid ${due.length > 0 ? "#F0C070" : "#E4ECF4"}`, borderRadius: 6, padding: "6px 12px", color: due.length > 0 ? C.amber : C.textMid, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
        🔔 {due.length > 0 && <span className="notif-badge" style={{ background: C.amber, color: "#000", fontSize: 9, fontFamily: MONO, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{due.length}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, boxShadow: "0 8px 32px rgba(10,37,64,0.12)", zIndex: 300, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF2F7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontFamily: MONO, color: C.textMid, letterSpacing: "0.08em" }}>FOLLOW-UP REMINDERS</span>
            {due.length > 0 && <button onClick={() => { onClear(); setOpen(false); }} style={{ fontSize: 11, fontFamily: FONT, color: "#1B6EF3", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Clear all</button>}
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {due.length === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: 12, color: C.textDim, fontFamily: MONO, textAlign: "center" }}>No pending follow-ups</div>
            ) : (
              due.map((n, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEF2F7", background: n.urgent ? "#FFFBF0" : "#FFFFFF" }}>
                  <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, fontWeight: 500 }}>{n.name}</div>
                  <div style={{ fontSize: 10, color: n.urgent ? C.amber : C.textMid, fontFamily: MONO, marginTop: 3 }}>{n.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Load persisted state
 const [prospects, setProspects] = useState([]);
const [research, setResearch] = useState({});
const [messages, setMessages] = useState({});
const [edits, setEdits] = useState({});
const [replies, setReplies] = useState([]);
const [notifications, setNotifications] = useState([]);
const [dbLoaded, setDbLoaded] = useState(false);

useEffect(() => {
  async function loadAll() {
    if (!supabase) { setDbLoaded(true); return; }
    const [p, r, m, e, rep, n] = await Promise.all([
      dbLoad('prospects'), dbLoad('research'), dbLoad('messages'),
      dbLoad('edits'), dbLoad('replies'), dbLoad('notifications'),
    ]);
    setProspects(Object.values(p));
    setResearch(r);
    setMessages(m);
    setEdits(e);
    setReplies(Object.values(rep));
    setNotifications(Object.values(n));
    setDbLoaded(true);
  }
  loadAll();
}, []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { name: p.get("name") || "", jobTitle: p.get("jobTitle") || "", company: p.get("company") || "", linkedinUrl: p.get("linkedinUrl") || "", email: "", phone: "", jdText: "" };
  });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState("");
  const [logs, setLogs] = useState({});
  const [activeMsg, setActiveMsg] = useState(null);
  const [running, setRunning] = useState(null);
  const [activeTab, setActiveTab] = useState("messages"); // messages | research | stories | reply
  const [showJD, setShowJD] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyIndustry, setReplyIndustry] = useState("");
  const [replyTone, setReplyTone] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFrom, setBatchFrom] = useState(1);
  const [batchTo, setBatchTo] = useState(30);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, done: [] });
  const batchCancelRef = useRef(false);
  const logsEndRef = useRef();
  const fileInputRef = useRef();
  const [uploadStatus, setUploadStatus] = useState("");
  const [csvHeaders, setCsvHeaders] = useState([]);
const [csvRows, setCsvRows] = useState([]);
const [csvMapping, setCsvMapping] = useState({});
const [showMapper, setShowMapper] = useState(false);
  const [senderProfile, setSenderProfile] = useState(() => {
  try { return JSON.parse(localStorage.getItem('sender_profile') || 'null') || {}; } catch { return {}; }
});
const [showProfile, setShowProfile] = useState(false);
  

  // Persist state changes
  useEffect(() => {
  if (!dbLoaded) return;
  prospects.forEach(p => dbSave('prospects', p.id, p));
}, [prospects, dbLoaded]);

useEffect(() => {
  if (!dbLoaded) return;
  Object.entries(research).forEach(([id, val]) => dbSave('research', id, val));
}, [research, dbLoaded]);

useEffect(() => {
  if (!dbLoaded) return;
  Object.entries(messages).forEach(([id, val]) => dbSave('messages', id, val));
}, [messages, dbLoaded]);

useEffect(() => {
  if (!dbLoaded) return;
  Object.entries(edits).forEach(([id, val]) => dbSave('edits', id, val));
}, [edits, dbLoaded]);

useEffect(() => {
  if (!dbLoaded) return;
  replies.forEach(r => dbSave('replies', r.id, r));
}, [replies, dbLoaded]);

useEffect(() => {
  if (!dbLoaded) return;
  notifications.forEach(n => dbSave('notifications', n.id || `n_${Date.now()}`, n));
}, [notifications, dbLoaded]);
  useEffect(() => {
  localStorage.setItem('sender_profile', JSON.stringify(senderProfile));
}, [senderProfile]);

  // Auto-scroll logs
  useEffect(() => { if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // Check follow-up notifications periodically
  useEffect(() => {
    const checkNotifs = () => {
      const now = new Date();
      const newNotifs = [];
      prospects.forEach(p => {
        if (!p.sentAt || p.status === "done") return;
        [3, 7, 14].forEach(day => {
          const target = new Date(new Date(p.sentAt).getTime() + day * 24 * 60 * 60 * 1000);
          const diffHours = (target - now) / (1000 * 60 * 60);
          if (diffHours <= 24 && diffHours > -48) {
            const existing = notifications.find(n => n.id === `${p.id}_d${day}` && !n.cleared);
            if (!existing) {
              newNotifs.push({
                id: `${p.id}_d${day}`, name: p.name, company: p.company,
                message: diffHours <= 0 ? `Day ${day} follow-up is OVERDUE` : `Day ${day} follow-up due in ${Math.ceil(diffHours)}h`,
                urgent: diffHours <= 0, cleared: false, createdAt: new Date().toISOString(),
              });
            }
          }
        });
      });
      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const truly_new = newNotifs.filter(n => !existingIds.has(n.id));
          return truly_new.length > 0 ? [...prev, ...truly_new] : prev;
        });
      }
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [prospects]);

  const addLog = (id, msg) => setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));

  const lookupProfile = async () => {
    if (!form.linkedinUrl) return;
    setLookupLoading(true); setLookupStatus("");
    try {
      const info = await lookupLinkedIn(form.linkedinUrl, setLookupStatus);
      setForm(prev => ({ ...prev, name: info.name || prev.name, jobTitle: info.jobTitle || prev.jobTitle, company: info.company || prev.company, industry: info.industry || prev.industry, seniority: info.seniority || prev.seniority, region: info.region || prev.region }));
      setLookupStatus("✅ Form auto-filled! Review and click Add Prospect.");
    } catch (err) { setLookupStatus("⚠️ Could not extract profile. Fill manually."); }
    finally { setLookupLoading(false); }
  };

  const addProspect = () => {
    if (!form.name || !form.company) return;
    const id = `p_${Date.now()}`;
    setProspects(prev => [...prev, { ...form, id, status: "idle", createdAt: new Date().toISOString(), sentAt: null }]);
    setSelected(id);
    setForm({ name: "", jobTitle: "", company: "", linkedinUrl: "", email: "", phone: "", jdText: "" });
    setShowJD(false);
  };

const handleFileUpload = (e) => {
  const file = e.target.files[0]; if (!file) return;
  setUploadStatus("📂 Reading file...");
  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  const parseRows = (rows) => {
    const headers = rows[0].map(h => (h || "").toString().toLowerCase().trim());
    const idx = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

const companyIdx = idx(["company name","company","organization","org","employer"]);
const nameIdx = idx(["name"]);
const firstNameIdx = idx(["first name","firstname"]);
const lastNameIdx = idx(["last name","lastname"]);
const titleIdx = idx(["title","job","position","designation","role"]);
const emailIdx = idx(["email","mail"]);
const phoneIdx = idx(["phone","mobile","whatsapp"]);
const linkedinIdx = idx(["linkedin","person linkedin url","profile url","url"]);
    const added = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const get = (index) => index >= 0 ? (row[index] || "").toString().trim() : "";
      const fullName = get(nameIdx);
      const firstName = get(firstNameIdx);
      const lastName = get(lastNameIdx);
      const name = fullName || [firstName, lastName].filter(Boolean).join(" ");
      const company = get(companyIdx);
      if (!name && !company) continue;
      added.push({
        id: `p_${Date.now()}_${i}`,
        name: name || "Unknown",
        jobTitle: get(titleIdx),
        company: company || "Unknown",
        email: get(emailIdx),
        phone: get(phoneIdx),
        linkedinUrl: get(linkedinIdx),
        status: "idle",
        createdAt: new Date().toISOString(),
        sentAt: null,
      });
    }
    setProspects(prev => [...prev, ...added]);
    setUploadStatus(`✅ ${added.length} prospects imported!`);
    if (added.length > 0) { setSelected(added[0].id); setBatchFrom(1); setBatchTo(Math.min(30, added.length)); setTimeout(() => setBatchOpen(true), 600); }
    setTimeout(() => setUploadStatus(""), 4000);
  };

  if (ext === "csv") {
    reader.onload = (ev) => {
      const rows = ev.target.result.split(/\r?\n/).filter(l => l.trim()).map(l => {
        const result = []; let cur = "", inQ = false;
        for (const ch of l) { if (ch === '"') inQ = !inQ; else if (ch === "," && !inQ) { result.push(cur); cur = ""; } else cur += ch; }
        result.push(cur); return result;
      });
      parseRows(rows);
    };
    reader.readAsText(file);
  } else if (ext === "xlsx" || ext === "xls") {
    reader.onload = (ev) => {
      try {
        const XLSX = window.XLSX; if (!XLSX) { setUploadStatus("❌ Excel support not loaded. Use CSV instead."); return; }
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        parseRows(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }));
      } catch (err) { setUploadStatus("❌ Error reading Excel: " + err.message); }
    };
    reader.readAsArrayBuffer(file);
  } else { setUploadStatus("❌ Please upload a .csv or .xlsx file"); }
  e.target.value = "";
}; 

const applyMapping = () => {
  const added = [];
  csvRows.forEach((row, i) => {
    const get = (field) => csvMapping[field] !== undefined ? (row[csvMapping[field]] || "").toString().trim() : "";
    const fullName = get("name");
    const firstName = get("firstName");
    const lastName = get("lastName");
    const name = fullName || [firstName, lastName].filter(Boolean).join(" ");
     const company = get("company");
    if (!name && !company) return;
    added.push({
      id: `p_${Date.now()}_${i}`,
      name: name || "Unknown",
      jobTitle: get("jobTitle"),
      company: company || "Unknown",
      email: get("email"),
      phone: get("phone"),
      linkedinUrl: get("linkedinUrl"),
      status: "idle",
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
  });
  setProspects(prev => [...prev, ...added]);
  setShowMapper(false);
  setCsvHeaders([]); setCsvRows([]); setCsvMapping({});
  setUploadStatus(`✅ ${added.length} prospects imported!`);
  if (added.length > 0) { setSelected(added[0].id); setBatchFrom(1); setBatchTo(Math.min(30, added.length)); setTimeout(() => setBatchOpen(true), 600); }
  setTimeout(() => setUploadStatus(""), 4000);
};

  const runAgent = async (prospect) => {
    const id = prospect.id;
    setRunning(id); setSelected(id); setActiveMsg(null);
    setLogs(prev => ({ ...prev, [id]: [] }));
    const updateStatus = (status) => setProspects(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    try {
      updateStatus("researching");
      const researchData = await runResearchAgent(
        prospect.company, prospect.linkedinUrl, prospect.name, prospect.jobTitle,
        prospect.jdText || "", (msg) => addLog(id, msg)
      );
      setResearch(prev => ({ ...prev, [id]: researchData }));

      updateStatus("generating");
      addLog(id, "⏳ Pausing 30s to respect API rate limits...");
      await new Promise(r => setTimeout(r, 30000));
      const industryUC = findIndustryUseCases(prospect.company, prospect.industry || "", researchData);
      const useCasesStr = industryUC.use_cases.map(uc => `• ${uc.title} – ${uc.desc}`).join("\n");
      const industryIntro = industryUC.intro.replace(/\[COMPANY\]/g, prospect.company);
      const industrySocialProof = industryUC.social_proof.replace(/\[COMPANY\]/g, prospect.company);
      const industryClosing = industryUC.closing.replace(/\[COMPANY\]/g, prospect.company);
      const matchedStories = findMatchingStories(prospect.company, prospect.industry || "", researchData);
      addLog(id, `🏆 Matched ${matchedStories.length} relevant success stories`);

      const msgs = await generateMessages(prospect, researchData, matchedStories, prospect.jdText || "", replies, { industryUC, useCasesStr, industryIntro, industrySocialProof, industryClosing }, (msg) => addLog(id, msg));
      setMessages(prev => ({ ...prev, [id]: msgs }));
      setActiveMsg("connection_note");

      updateStatus("ready");
      addLog(id, "🚀 Agent complete! Review and send messages below.");
    } catch (err) {
      updateStatus("error");
      addLog(id, "❌ Error: " + err.message);
    } finally { setRunning(null); }
  };

  const markSent = (id) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, status: "following", sentAt: new Date().toISOString() } : p));
  };

  const saveReply = () => {
    if (!replyText.trim()) return;
    const newReply = {
      id: `r_${Date.now()}`,
      prospect_name: sel?.name || "Unknown",
      company: sel?.company || "Unknown",
      industry: replyIndustry || sel?.industry || "Unknown",
      reply_summary: replyText.trim(),
      tone: replyTone || "positive",
      createdAt: new Date().toISOString(),
    };
    setReplies(prev => [...prev, newReply]);
    // Also update prospect status
    if (selected) setProspects(prev => prev.map(p => p.id === selected ? { ...p, status: "replied" } : p));
    setReplyText(""); setReplyIndustry(""); setReplyTone("");
    addLog(selected, "📬 Reply saved! Future pitches to similar companies will be improved.");
  };

  const runBatch = async () => {
    const idleProspects = prospects.filter(p => p.status === "idle");
    const from = Math.max(1, batchFrom) - 1, to = Math.min(idleProspects.length, batchTo);
    const queue = idleProspects.slice(from, to);
    if (queue.length === 0) return;
    setBatchRunning(true); batchCancelRef.current = false;
    setBatchProgress({ current: 0, total: queue.length, done: [] }); setBatchOpen(false);
    for (let i = 0; i < queue.length; i++) {
      if (batchCancelRef.current) break;
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      await runAgent(queue[i]);
      setBatchProgress(prev => ({ ...prev, done: [...prev.done, queue[i].id] }));
      if (i < queue.length - 1 && !batchCancelRef.current) await new Promise(r => setTimeout(r, 5000));
    }
    setBatchRunning(false); setBatchProgress(prev => ({ ...prev, current: 0 }));
  };

  const getDaysUntilFollowup = (prospect, dayNum) => {
    if (!prospect.sentAt) return null;
    const target = new Date(new Date(prospect.sentAt).getTime() + dayNum * 24 * 60 * 60 * 1000);
    return Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  };
if (!dbLoaded) return (
  <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ width: 40, height: 40, border: "3px solid #D0E4FF", borderTop: "3px solid #1B6EF3", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <div style={{ color: "#4A6080", fontSize: 14, fontWeight: 500 }}>Loading your activity...</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
  const sel = prospects.find(p => p.id === selected);
  const selResearch = selected ? research[selected] : null;
  const selMessages = selected ? messages[selected] : null;
  const selMatchedStories = sel && selResearch ? findMatchingStories(sel.company, sel.industry || "", selResearch) : [];
  const dueNotifs = notifications.filter(n => !n.cleared);

  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <div style={{ background: "#0A2540", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, height: 60, boxShadow: "0 2px 16px rgba(10,37,64,0.18)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(27,110,243,0.4)" }}>
                <span style={{ fontSize: 14, fontFamily: DISPLAY, color: "#FFFFFF", fontWeight: 800, letterSpacing: "-0.02em" }}>Z</span>
              </div>
              <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: "#FFFFFF", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Condense Outreach</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: MONO, letterSpacing: "0.06em" }}>ZELIOT · AI SALES AGENT</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 18, fontFamily: DISPLAY, fontWeight: 700, color: prospects.filter(p => p.status === "ready" || p.status === "following").length > 0 ? "#5DE8A0" : "rgba(255,255,255,0.25)", lineHeight: 1 }}>{prospects.filter(p => p.status === "ready" || p.status === "following").length}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: MONO, letterSpacing: "0.06em" }}>Active</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 18, fontFamily: DISPLAY, fontWeight: 700, color: replies.length > 0 ? "#FFC043" : "rgba(255,255,255,0.25)", lineHeight: 1 }}>{replies.length}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: MONO, letterSpacing: "0.06em" }}>Trained</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
            <button onClick={() => setShowProfile(s => !s)} style={{ background: showProfile ? "#EEF5FF" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", color: "#FFFFFF", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT }}>
  <div style={{ width: 24, height: 24, borderRadius: "50%", background: senderProfile.name ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>
    {senderProfile.name ? senderProfile.name.charAt(0).toUpperCase() : "?"}
  </div>
  <span style={{ fontSize: 11, opacity: 0.9 }}>{senderProfile.name || "Set Profile"}</span>
</button>
            <NotificationBell notifications={dueNotifs} onClear={() => setNotifications(prev => prev.map(n => ({ ...n, cleared: true })))} />
            {batchRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 6, background: "rgba(27,110,243,0.25)", border: "1px solid rgba(61,139,255,0.4)" }}>
                <Spinner />
                <span style={{ fontSize: 11, fontFamily: MONO, color: "#FFFFFF" }}>Batch {batchProgress.current}/{batchProgress.total}</span>
                <button onClick={() => { batchCancelRef.current = true; setBatchRunning(false); }} style={{ fontSize: 10, fontFamily: MONO, color: "#FF8080", background: "none", border: "none", cursor: "pointer" }}>✕ Stop</button>
              </div>
            )}
            {!batchRunning && prospects.filter(p => p.status === "idle").length > 0 && (
              <GlowButton onClick={() => setBatchOpen(true)} primary>⚡ Batch Run</GlowButton>
            )}
          </div>
        </div>
        {/* SENDER PROFILE SIDE PANEL */}
{showProfile && (
  <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowProfile(false)}>
    <div style={{ position: "absolute", top: 60, right: 0, width: 340, height: "calc(100vh - 60px)", background: "#FFFFFF", borderLeft: "1px solid #E4ECF4", boxShadow: "-4px 0 24px rgba(10,37,64,0.10)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
      
      {/* Panel Header */}
      <div style={{ background: "#0A2540", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Sender Profile</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2, fontFamily: MONO }}>Used in all send buttons & sign-offs</div>
        </div>
        <button onClick={() => setShowProfile(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 16, cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}>✕</button>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { key: "name", label: "Full Name *", placeholder: "Veera Raghavan" },
          { key: "email", label: "Your Email *", placeholder: "veera@zeliot.in" },
          { key: "phone", label: "Phone / WhatsApp", placeholder: "+91 9353094136" },
          { key: "title", label: "Job Title", placeholder: "Country Head – Enterprise Business" },
          { key: "company", label: "Company", placeholder: "Zeliot–Condense" },
        ].map(field => (
          <div key={field.key}>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#4A6080", display: "block", marginBottom: 4, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{field.label}</label>
            <input
              value={senderProfile[field.key] || ""}
              onChange={e => setSenderProfile(p => ({ ...p, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: "#0A2540", borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: FONT, outline: "none" }}
            />
          </div>
        ))}

        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "#4A6080", display: "block", marginBottom: 4, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Signature</label>
          <textarea
            value={senderProfile.signature || ""}
            onChange={e => setSenderProfile(p => ({ ...p, signature: e.target.value }))}
            placeholder={"Best regards,\nVeera Raghavan\nCountry Head – Enterprise Business\nZeliot–Condense | +91 935-309-4136"}
            style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: "#0A2540", borderRadius: 6, padding: "9px 12px", fontSize: 12, fontFamily: FONT, lineHeight: 1.6, outline: "none", resize: "vertical", minHeight: 100 }}
          />
        </div>

        {senderProfile.name && senderProfile.email && (
          <div style={{ background: "#F0FBF5", border: "1px solid #B8EDD3", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "#0D9E6E", fontWeight: 600, marginBottom: 6 }}>✅ Profile Active</div>
            <div style={{ fontSize: 12, color: "#0A2540", lineHeight: 1.8 }}>
              📧 <strong>{senderProfile.email}</strong><br/>
              📱 <strong>{senderProfile.phone || "not set"}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #E4ECF4", flexShrink: 0 }}>
        <button onClick={() => setShowProfile(false)} style={{ width: "100%", padding: "12px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", color: "#FFFFFF", fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 10px rgba(27,110,243,0.25)" }}>
          ✓ Save & Close
        </button>
      </div>
    </div>
  </div>
)}
{/* CSV COLUMN MAPPER MODAL */}
{showMapper && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowMapper(false)}>
    <div style={{ background: "#FFFFFF", borderRadius: 12, width: "min(560px, 96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(10,37,64,0.18)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div style={{ background: "#0A2540", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>Map Your CSV Columns</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, fontFamily: MONO }}>{csvRows.length} rows detected · assign each field below</div>
        </div>
        <button onClick={() => setShowMapper(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 16, cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}>✕</button>
      </div>

      {/* Preview row */}
      <div style={{ padding: "12px 24px", background: "#F8FAFC", borderBottom: "1px solid #E4ECF4", flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "#8A9BB0", fontFamily: MONO, marginBottom: 6, letterSpacing: "0.08em" }}>FIRST ROW PREVIEW</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {csvHeaders.map((h, i) => (
            <div key={i} style={{ background: "#FFFFFF", border: "1px solid #D8E2EE", borderRadius: 4, padding: "4px 10px" }}>
              <div style={{ fontSize: 9, color: "#8A9BB0", fontFamily: MONO }}>{h}</div>
              <div style={{ fontSize: 11, color: "#0A2540", fontFamily: "'Inter', sans-serif", marginTop: 1 }}>{(csvRows[0]?.[i] || "—").toString().slice(0, 20)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping fields */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { field: "name", label: "👤 Full Name (single column)" },
          { field: "firstName", label: "👤 First Name" },
          { field: "lastName", label: "👤 Last Name" },
          { field: "company", label: "🏢 Company *", required: true },
          { field: "jobTitle", label: "💼 Job Title" },
          { field: "email", label: "✉️ Email" },
          { field: "phone", label: "📱 Phone / WhatsApp" },
          { field: "linkedinUrl", label: "🔗 LinkedIn URL" },
        ].map(({ field, label, required }) => (
          <div key={field} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 180, fontSize: 12, color: "#0A2540", fontFamily: "'Inter', sans-serif", fontWeight: 500, flexShrink: 0 }}>{label}</div>
            <div style={{ flex: 1, fontSize: 12, color: "#8A9BB0", fontFamily: MONO }}>→</div>
            <select
              value={csvMapping[field] !== undefined ? csvMapping[field] : ""}
              onChange={e => setCsvMapping(prev => ({ ...prev, [field]: e.target.value === "" ? undefined : Number(e.target.value) }))}
              style={{ flex: 2, background: csvMapping[field] !== undefined ? "#EEF5FF" : "#F8FAFC", border: `1px solid ${csvMapping[field] !== undefined ? "#1B6EF3" : "#D8E2EE"}`, color: "#0A2540", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none" }}
            >
              <option value="">— not mapped —</option>
              {csvHeaders.map((h, i) => (
                <option key={i} value={i}>{h} (e.g. {(csvRows[0]?.[i] || "").toString().slice(0, 25)})</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #E4ECF4", flexShrink: 0, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={() => setShowMapper(false)} style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid #E4ECF4", background: "#FFFFFF", color: "#4A6080", fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
        <button
          onClick={applyMapping}
          disabled={csvMapping.company === undefined || (csvMapping.name === undefined && csvMapping.firstName === undefined && csvMapping.lastName === undefined)}
          style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: (csvMapping.company !== undefined && (csvMapping.name !== undefined || csvMapping.firstName !== undefined || csvMapping.lastName !== undefined)) ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "#E4ECF4", color:(csvMapping.company !== undefined && (csvMapping.name !== undefined || csvMapping.firstName !== undefined || csvMapping.lastName !== undefined)) ? "#FFFFFF" : "#8A9BB0", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: (csvMapping.company !== undefined && (csvMapping.name !== undefined || csvMapping.firstName !== undefined || csvMapping.lastName !== undefined)) ? "pointer" : "not-allowed", boxShadow: "0 2px 10px rgba(27,110,243,0.25)" }}>
          Import {csvRows.filter(r => r[csvMapping.name] || r[csvMapping.company]).length} Prospects →
        </button>
      </div>
    </div>
  </div>
)}
        {/* BULK UPLOAD MANAGER MODAL */}
        {batchOpen && (() => {
          const idleList = prospects.filter(p => p.status === "idle");
          const total = idleList.length;
          // compute selected set from batchFrom/batchTo + any checkbox overrides
          const rangeSelected = new Set(
            idleList.slice(Math.max(0, batchFrom - 1), batchTo).map(p => p.id)
          );
          const selectedCount = rangeSelected.size;
          const estMins = Math.round(selectedCount * 0.7);

          const PRESETS = [
            { label: "First 10",  from: 1, to: 10 },
            { label: "First 25",  from: 1, to: 25 },
            { label: "First 50",  from: 1, to: 50 },
            { label: "First 100", from: 1, to: 100 },
            { label: "All",       from: 1, to: total },
          ];

          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setBatchOpen(false)}>
              <div style={{ background: "#FFFFFF", border: "1px solid #D0DCF0", borderRadius: 12, width: "min(860px, 96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: `0 0 60px rgba(14,165,233,0.18)`, overflow: "hidden" }} onClick={e => e.stopPropagation()}>

                {/* Modal Header */}
                <div style={{ padding: "22px 28px 18px", borderBottom: `1px solid ${C.borderDim}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4, letterSpacing: "-0.02em" }}>Bulk Script Generator</div>
                    <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO }}>
                      <span style={{ color: C.gold }}>{total}</span> prospects uploaded ·{" "}
                      <span style={{ color: C.green }}>{prospects.filter(p => p.status === "ready" || p.status === "done").length}</span> already generated ·{" "}
                      <span style={{ color: C.textDim }}>{prospects.filter(p => p.status !== "idle").length} total processed</span>
                    </div>
                  </div>
                  <button onClick={() => setBatchOpen(false)} style={{ background: "#F5F7FA", border: "1px solid #E4ECF4", color: C.textMid, fontSize: 16, cursor: "pointer", padding: "4px 10px", lineHeight: 1, borderRadius: 6 }}>✕</button>
                </div>

                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                  {/* LEFT: Controls */}
                  <div style={{ width: 280, borderRight: "1px solid #EEF2F7", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flexShrink: 0, background: "#F8FAFC" }}>

                    {/* Quick Presets */}
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Quick Select</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {PRESETS.filter(p => p.to <= total || p.label === "All").map(preset => {
                          const isActive = batchFrom === preset.from && batchTo === Math.min(preset.to, total);
                          return (
                            <button key={preset.label} onClick={() => { setBatchFrom(preset.from); setBatchTo(Math.min(preset.to, total)); }}
                              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${isActive ? "#1B6EF3" : "#D8E2EE"}`, background: isActive ? "#1B6EF3" : "#FFFFFF", color: isActive ? "#FFFFFF" : C.textMid, fontSize: 11, fontFamily: FONT, cursor: "pointer", transition: "all 0.15s", fontWeight: isActive ? 600 : 400 }}>
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Range */}
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Custom Range</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 4 }}>FROM #</label>
                          <input type="number" min={1} max={total} value={batchFrom}
                            onChange={e => setBatchFrom(Math.max(1, Math.min(total, Number(e.target.value))))}
                            style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: MONO, outline: "none" }} />
                        </div>
                        <div style={{ color: C.textDim, fontFamily: MONO, fontSize: 14, marginTop: 14 }}>—</div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 4 }}>TO #</label>
                          <input type="number" min={1} max={total} value={batchTo}
                            onChange={e => setBatchTo(Math.max(batchFrom, Math.min(total, Number(e.target.value))))}
                            style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: MONO, outline: "none" }} />
                        </div>
                      </div>
                      {/* Visual range bar */}
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((batchFrom - 1) / Math.max(total, 1)) * 100}%`, width: `${((batchTo - batchFrom + 1) / Math.max(total, 1)) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, borderRadius: 3 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 9, color: C.textDim, fontFamily: MONO }}>1</span>
                        <span style={{ fontSize: 9, color: C.textDim, fontFamily: MONO }}>{total}</span>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div style={{ background: "linear-gradient(135deg, #EEF5FF, #F0F8FF)", border: "1px solid #B8D4FF", borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ fontSize: 30, fontFamily: DISPLAY, fontWeight: 800, color: "#1B6EF3", lineHeight: 1, marginBottom: 4 }}>{selectedCount}</div>
                      <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO, marginBottom: 12 }}>prospects selected</div>
                      <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, lineHeight: 1.9 }}>
                        ⏱ Est. time: <span style={{ color: C.gold }}>{estMins < 60 ? `~${estMins} min` : `~${(estMins/60).toFixed(1)} hr`}</span><br/>
                        🔄 Rate: ~40s per prospect<br/>
                        📍 Range: #{batchFrom} – #{Math.min(batchTo, total)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                      <button onClick={runBatch} disabled={selectedCount === 0}
                        style={{ width: "100%", padding: "13px", borderRadius: 5, border: `1px solid ${C.gold}`, background: selectedCount > 0 ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "#E4ECF4", color: selectedCount > 0 ? "#FFFFFF" : C.textDim, fontFamily: FONT, fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", cursor: selectedCount > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: selectedCount > 0 ? `0 0 24px rgba(14,165,233,0.2)` : "none", transition: "all 0.15s" }}>
                        ⚡ Generate {selectedCount} Scripts
                      </button>
                      <button onClick={() => setBatchOpen(false)}
                        style={{ width: "100%", padding: "10px", borderRadius: 5, border: "1px solid #E4ECF4", background: "#FFFFFF", color: C.textMid, fontFamily: FONT, fontSize: 12, cursor: "pointer", borderRadius: 6 }}>
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* RIGHT: Prospect Table Preview */}
                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${C.borderDim}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO }}>Prospect Preview</span>
                      <span style={{ fontSize: 10, fontFamily: MONO, color: C.textDim }}>Rows in <span style={{ color: C.gold }}>gold</span> = selected for generation</span>
                    </div>
                    {/* Column Headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "36px 28px 1fr 1fr 1fr 80px", gap: 0, padding: "8px 20px", borderBottom: "1px solid #EEF2F7", flexShrink: 0, background: "#F8FAFC" }}>
                      {["#", "", "Name", "Company", "Title", "Status"].map((h, i) => (
                        <div key={i} style={{ fontSize: 10, fontFamily: MONO, color: "#8A9BB0", letterSpacing: "0.08em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {idleList.length === 0 ? (
                        <div style={{ padding: "32px 20px", textAlign: "center", color: C.textDim, fontFamily: MONO, fontSize: 12 }}>No idle prospects to generate.</div>
                      ) : idleList.map((p, idx) => {
                        const rowNum = idx + 1;
                        const inRange = rowNum >= batchFrom && rowNum <= batchTo;
                        const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.idle;
                        return (
                          <div key={p.id}
                            onClick={() => {
                              // clicking a row toggles it in/out of range (adjust batchFrom/batchTo to include/exclude)
                              if (inRange) {
                                // shrink range to exclude this row
                                if (rowNum === batchFrom) setBatchFrom(batchFrom + 1);
                                else if (rowNum === batchTo) setBatchTo(batchTo - 1);
                              } else {
                                // expand range to include
                                if (rowNum < batchFrom) setBatchFrom(rowNum);
                                if (rowNum > batchTo) setBatchTo(rowNum);
                              }
                            }}
                            style={{ display: "grid", gridTemplateColumns: "36px 28px 1fr 1fr 1fr 80px", gap: 0, padding: "9px 20px", borderBottom: `1px solid rgba(255,255,255,0.03)`, background: inRange ? "#EEF5FF" : "#FFFFFF", borderLeft: inRange ? "3px solid #1B6EF3" : "2px solid transparent", cursor: "pointer", transition: "all 0.12s" }}
                            onMouseEnter={e => { if (!inRange) e.currentTarget.style.background = "#F8FAFC"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = inRange ? "rgba(14,165,233,0.07)" : "transparent"; }}>
                            <div style={{ fontSize: 10, fontFamily: MONO, color: inRange ? "#1B6EF3" : C.textDim, fontWeight: inRange ? 700 : 400 }}>{rowNum}</div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <div style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${inRange ? "#1B6EF3" : "#D8E2EE"}`, background: inRange ? "#1B6EF3" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#FFFFFF" }}>{inRange ? "✓" : ""}</div>
                            </div>
                            <div style={{ fontSize: 12, color: inRange ? C.text : C.textMid, fontFamily: FONT, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{p.company}</div>
                            <div style={{ fontSize: 11, color: C.textDim, fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{p.jobTitle || "—"}</div>
                            <div>
                              <span style={{ fontSize: 9, fontFamily: MONO, color: statusCfg.color, background: statusCfg.bg, padding: "2px 7px", borderRadius: 3, border: `1px solid ${statusCfg.color}44` }}>
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 64px)" }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: 300, background: "#FFFFFF", borderRight: "1px solid #E4ECF4", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "2px 0 8px rgba(10,37,64,0.04)" }}>
            {/* Add Prospect Form */}
            <div style={{ padding: "18px 16px", borderBottom: "1px solid #EEF2F7", overflowY: "auto", maxHeight: "55vh" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>Add Prospect</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>Fill manually or paste a LinkedIn URL</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* LinkedIn */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4, fontFamily: FONT }}>LinkedIn URL</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input style={{ flex: 1, background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 11px", fontSize: 12, fontFamily: FONT, outline: "none" }} value={form.linkedinUrl} onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))} placeholder="linkedin.com/in/..." onKeyDown={e => e.key === "Enter" && lookupProfile()} />
                    <button onClick={lookupProfile} disabled={!form.linkedinUrl || lookupLoading} style={{ padding: "0 12px", borderRadius: 6, border: "1px solid #D8E2EE", background: !form.linkedinUrl ? "#F5F7FA" : "#EEF5FF", color: !form.linkedinUrl ? C.textFaint : "#1B6EF3", cursor: !form.linkedinUrl || lookupLoading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500 }} title="Auto-fill from LinkedIn">{lookupLoading ? "⌛" : "🔍"}</button>
                  </div>
                  {lookupStatus && <div style={{ fontSize: 11, fontFamily: FONT, marginTop: 5, padding: "5px 10px", borderRadius: 6, background: lookupStatus.startsWith("✅") ? C.greenDim : lookupStatus.startsWith("⚠") ? C.amberDim : C.goldDimmer, color: lookupStatus.startsWith("✅") ? C.green : lookupStatus.startsWith("⚠") ? C.amber : C.gold }}>{lookupStatus}</div>}
                </div>
                <Input label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="John Smith" />
                <Input label="Job Title" value={form.jobTitle} onChange={v => setForm(p => ({ ...p, jobTitle: v }))} placeholder="VP Engineering" />
                <Input label="Company *" value={form.company} onChange={v => setForm(p => ({ ...p, company: v }))} placeholder="Acme Corp" />
                <Input label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="john@acme.com" />
                <Input label="Phone / WhatsApp" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+91 9353094136" />

                {/* JD Toggle */}
                <button onClick={() => setShowJD(s => !s)} style={{ background: showJD ? "#EEF5FF" : "#F8FAFC", border: "1px dashed #D8E2EE", color: "#1B6EF3", fontSize: 11, fontFamily: FONT, padding: "7px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left", width: "100%", fontWeight: 500 }}>
                  {showJD ? "▼ Hide" : "▶ Add"} JD / Role Context
                </button>
                {showJD && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4, fontFamily: FONT }}>JD / Role Context</label>
                    <textarea value={form.jdText} onChange={e => setForm(p => ({ ...p, jdText: e.target.value }))} placeholder="Paste job description or key responsibilities. The pitch will be tailored to their specific JD." style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "9px 12px", fontSize: 12, fontFamily: FONT, lineHeight: 1.6, outline: "none", resize: "vertical", minHeight: 90 }} />
                  </div>
                )}

                <GlowButton onClick={addProspect} disabled={!form.name || !form.company} primary>+ Add Prospect</GlowButton>

                {/* Bulk Upload */}
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }} />
                    <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, whiteSpace: "nowrap" }}>Bulk Upload</span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: "none" }} />
                  <button onClick={() => fileInputRef.current.click()} style={{ width: "100%", padding: "11px", borderRadius: 4, border: `1px solid ${C.gold}44`, background: "rgba(14,165,233,0.05)", color: C.gold, fontSize: 11, fontFamily: MONO, letterSpacing: "0.07em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 16 }}>↑</span> Upload CSV / Excel
                  </button>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, marginTop: 5, textAlign: "center", lineHeight: 1.6 }}>
                    Supports .csv · .xlsx · .xls · Columns: Name, Company, Title, Email, Phone, LinkedIn
                  </div>
                  {uploadStatus && <div style={{ fontSize: 10, fontFamily: MONO, marginTop: 5, padding: "5px 8px", borderRadius: 3, background: uploadStatus.startsWith("✅") ? C.greenDim : uploadStatus.startsWith("❌") ? C.redDim : C.goldDimmer, color: uploadStatus.startsWith("✅") ? C.green : uploadStatus.startsWith("❌") ? C.red : C.gold }}>{uploadStatus}</div>}
                  {prospects.filter(p => p.status === "idle").length > 0 && (
                    <button onClick={() => setBatchOpen(true)} style={{ width: "100%", marginTop: 6, padding: "9px", borderRadius: 4, border: `1px solid ${C.green}44`, background: C.greenDim, color: C.green, fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      ⚡ Select &amp; Generate Scripts ({prospects.filter(p => p.status === "idle").length} ready)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Prospect List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "10px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEF2F7" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: DISPLAY }}>Prospects ({prospects.length})</span>
                {prospects.length > 0 && <span style={{ fontSize: 10, color: C.textDim }}>{prospects.filter(p=>p.status==="ready"||p.status==="following").length} active</span>}
              </div>
              {prospects.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>👤</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, fontFamily: FONT }}>Add your first prospect above<br/>or upload a CSV file</div>
                </div>
              ) : prospects.map(p => (
                <div key={p.id} className="card-enter prospect-card" onClick={() => setSelected(p.id)} style={{ padding: "11px 14px", marginBottom: 0, background: selected === p.id ? "#EEF5FF" : "#FFFFFF", borderBottom: "1px solid #F0F4F8", borderLeft: selected === p.id ? "3px solid #1B6EF3" : "3px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: selected === p.id ? C.navy : C.text, lineHeight: 1.3, fontFamily: FONT }}>{p.name}</div>
                    {running === p.id && <Spinner />}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2, fontFamily: FONT }}>{p.company}</div>
                  {p.email && <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>✉️ {p.email}</div>}
                  <div style={{ marginTop: 6 }}><Badge status={p.status} /></div>
                  {p.status === "following" && (
                    <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {[3, 7, 14].map(day => {
                        const d = getDaysUntilFollowup(p, day);
                        const isDue = d !== null && d <= 0, isSoon = d !== null && d > 0 && d <= 1;
                        return <span key={day} style={{ fontSize: 9, fontFamily: MONO, padding: "2px 6px", borderRadius: 10, background: isDue ? C.redDim : isSoon ? C.amberDim : "#F0F4F8", color: isDue ? C.red : isSoon ? C.amber : C.textDim, border: `1px solid ${isDue ? C.red + "44" : isSoon ? C.amber + "44" : "#E0E8F0"}` }}>D{day}: {isDue ? "DUE" : `${d}d`}</span>;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
           
          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#F5F7FA" }}>
            {!sel ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(27,110,243,0.25)" }}>
                  <span style={{ fontSize: 32 }}>⚡</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 22, color: C.navy, marginBottom: 8, fontWeight: 700, letterSpacing: "-0.02em" }}>Select a prospect to begin</div>
                  <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, maxWidth: 400 }}>
                    The AI agent researches company, open positions,<br/>persona context, success stories, and crafts<br/>personalized multi-channel scripts.
                  </div>
                  {replies.length > 0 && <div style={{ marginTop: 14, fontSize: 12, color: C.amber, background: C.amberDim, padding: "6px 16px", borderRadius: 20, display: "inline-block", fontWeight: 500 }}>🧠 {replies.length} reply pattern{replies.length > 1 ? "s" : ""} trained — pitches improving</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 480, marginTop: 8 }}>
                  {[["🔍","Deep Research","Company, tech stack, open roles"],["✍️","AI Drafting","Veera-style personalized scripts"],["📊","Smart Matching","Success stories auto-matched"]].map(([icon,title,desc])=>(
                    <div key={title} style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: "14px 12px", textAlign: "center", boxShadow: "0 1px 4px rgba(10,37,64,0.06)" }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Prospect Header */}
                <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E4ECF4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h1 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.navy, letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.2 }}>{sel.name}</h1>
                      <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, letterSpacing: "0.02em" }}>
                        {sel.jobTitle && <span>{sel.jobTitle}</span>}
                        {sel.jobTitle && sel.company && <span style={{ color: C.textDim, margin: "0 8px" }}>·</span>}
                        {sel.company && <span style={{ color: C.gold, opacity: 0.8 }}>{sel.company}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                        {sel.linkedinUrl && <a href={sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: C.gold, textDecoration: "none", fontFamily: MONO, opacity: 0.7, letterSpacing: "0.06em" }}>↗ LINKEDIN</a>}
                        {sel.email && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>✉️ {sel.email}</span>}
                        {sel.phone && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>📱 {sel.phone}</span>}
                        {sel.jdText && <span style={{ fontSize: 10, color: C.green, fontFamily: MONO }}>📋 JD Context Added</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16 }}>
                      <Badge status={sel.status} />
                      {(sel.status === "idle" || sel.status === "error") && (
                        <GlowButton onClick={() => runAgent(sel)} disabled={running !== null} primary>
                          {running === sel.id ? <><Spinner /> Running...</> : "⚡  Run Agent"}
                        </GlowButton>
                      )}
                      {sel.status === "ready" && <GlowButton onClick={() => markSent(sel.id)} color={C.green} primary>✓ Mark Sent</GlowButton>}
                      {sel.status === "following" && <GlowButton onClick={() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, status: "done" } : p))} color={C.green} small>✓ Complete</GlowButton>}
                    </div>
                  </div>
                </div>

                {/* Agent Log */}
                {logs[sel.id]?.length > 0 && (
                  <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMid, fontFamily: MONO, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: running === sel.id ? C.amber : C.green }} />
                      Agent Log
                    </div>
                    <div style={{ maxHeight: 120, overflowY: "auto" }}>
                      {logs[sel.id].map((log, i) => (
                        <div key={i} className="log-line" style={{ fontSize: 11, fontFamily: MONO, color: log.startsWith("✅") ? C.green : log.startsWith("❌") ? C.red : log.startsWith("🌐") || log.startsWith("🏆") ? C.blue : C.textMid, padding: "2px 0", lineHeight: 1.8 }}>{log}</div>
                      ))}
                      {running === sel.id && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, padding: "6px 0", borderTop: "1px solid #EEF2F7" }}><Spinner /><span style={{ fontSize: 11, fontFamily: MONO, color: C.blue }}>Processing...</span></div>}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}

                {/* Tab Navigation */}
                {(selResearch || selMessages) && (
                  <div style={{ display: "flex", borderBottom: "2px solid #E4ECF4", marginBottom: 20, gap: 0, background: "#FFFFFF", borderRadius: "8px 8px 0 0", padding: "0 4px" }}>
                    {[
                      { key: "messages", label: "Messages", icon: "💬" },
                      { key: "research", label: "Research", icon: "🔍" },
                      { key: "stories", label: `Stories${selMatchedStories.length > 0 ? ` (${selMatchedStories.length})` : ""}`, icon: "🏆" },
                      { key: "reply", label: "Log Reply", icon: "📬" },
                    ].map(tab => (
                      <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{ padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === tab.key ? "2px solid #1B6EF3" : "2px solid transparent", marginBottom: "-2px", color: activeTab === tab.key ? "#1B6EF3" : C.textDim, fontFamily: FONT, fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", borderRadius: "6px 6px 0 0" }}>
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* MESSAGES TAB */}
                {activeTab === "messages" && selMessages && (
                  <div className="card-enter">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>Generated Messages</span>
                      <div style={{ flex: 1, height: 1, background: "#E4ECF4" }} />
                    </div>

                    {/* Message Tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid #E4ECF4", overflowX: "auto", marginBottom: 0, gap: 0, background: "#FFFFFF", borderRadius: "8px 8px 0 0", padding: "0 4px" }}>
                      {FOLLOWUP_SCHEDULE.map(m => {
                        const isActive = activeMsg === m.key;
                        let dayStatus = "future";
                        if (sel.sentAt && m.key !== "email_body") {
                          const dayNum = m.key === "connection_note" ? -1 : m.key === "day0_message" ? 0 : parseInt(m.key.replace("day", ""));
                          if (dayNum <= 0) dayStatus = "due";
                          else { const d = getDaysUntilFollowup(sel, dayNum); dayStatus = d <= 0 ? "due" : d <= 1 ? "soon" : "future"; }
                        }
                        const dotColor = dayStatus === "due" ? C.green : dayStatus === "soon" ? C.amber : C.textDim;
                        return (
                          <button key={m.key} className="tab-btn" onClick={() => setActiveMsg(m.key)} style={{ padding: "10px 16px", border: "none", background: isActive ? "rgba(14,165,233,0.06)" : "transparent", cursor: "pointer", borderBottom: isActive ? "2px solid #1B6EF3" : "2px solid transparent", marginBottom: "-1px", color: isActive ? "#1B6EF3" : C.textDim, fontFamily: FONT, fontSize: 11, fontWeight: isActive ? 600 : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 80, transition: "all 0.15s", borderRadius: "6px 6px 0 0" }}>
                            <span style={{ fontSize: 9, color: dotColor, letterSpacing: "0.1em" }}>{m.icon} {m.day}</span>
                            <span style={{ whiteSpace: "nowrap", textTransform: "uppercase", fontSize: 9 }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Message */}
                    {activeMsg && (() => {
                      const msgDef = FOLLOWUP_SCHEDULE.find(m => m.key === activeMsg);
                      const editKey = `${sel.id}_${activeMsg}`;
                      const text = edits[editKey] ?? selMessages[activeMsg] ?? "";
                      const maxLen = activeMsg === "connection_note" ? 300 : null;
                      const isEmail = activeMsg === "email_body";
                      return (
                        <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 20, boxShadow: "0 2px 8px rgba(10,37,64,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div>
                              <div style={{ fontFamily: DISPLAY, fontWeight: 500, color: C.text, fontSize: 14 }}>{msgDef.label}</div>
                              <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, fontFamily: MONO, letterSpacing: "0.04em" }}>{msgDef.hint}</div>
                              {isEmail && selMessages.email_subject && (
                                <div style={{ marginTop: 8, padding: "6px 10px", background: C.goldDimmer, borderRadius: 3, fontSize: 11, fontFamily: MONO, color: C.goldBright }}>
                                  Subject: {selMessages.email_subject}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              {maxLen && <span style={{ fontSize: 10, fontFamily: MONO, color: text.length > maxLen ? C.red : C.textDim }}>{text.length}/{maxLen}</span>}
                              <GlowButton small onClick={() => navigator.clipboard.writeText(text)} color={C.textMid}>Copy</GlowButton>
                              {sel.linkedinUrl && !isEmail && (
                                <GlowButton small color={C.gold} onClick={() => window.open(sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl, "_blank")}>↗ LinkedIn</GlowButton>
                              )}
                            </div>
                          </div>
                          <textarea value={text} onChange={e => setEdits(prev => ({ ...prev, [editKey]: e.target.value }))} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: C.navy, borderRadius: 8, padding: "14px 16px", fontSize: 13, fontFamily: FONT, lineHeight: 1.9, resize: "vertical", outline: "none", minHeight: isEmail ? 220 : activeMsg === "day0_message" ? 180 : 130, transition: "all 0.2s" }} />
                          
                          {/* Send Buttons */}
                          <div style={{ marginTop: 14, padding: "14px 0", borderTop: "1px solid #EEF2F7" }}>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.04em", marginBottom: 8 }}>SEND DIRECTLY →</div>
                            <SendButtons prospect={sel} messageText={text} messageType={activeMsg} emailSubject={selMessages.email_subject} senderProfile={senderProfile} />
                          </div>

                          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>
                              {isEmail ? "Opens your mail client with message pre-filled" : "Copy → paste into LinkedIn or use send buttons above"}
                            </div>
                            {edits[editKey] !== undefined && (
                              <GlowButton small color={C.textDim} onClick={() => setEdits(prev => { const n = { ...prev }; delete n[editKey]; return n; })}>↺ Reset</GlowButton>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pre-read Links */}
                    {selResearch?.pre_read_links?.length > 0 && (
                      <div style={{ marginTop: 16, background: "rgba(14,165,233,0.03)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>📎 Pre-Read Links (reference in pitch)</div>
                        {selResearch.pre_read_links.map((link, i) => (
                          <div key={i} style={{ marginBottom: 10, padding: "8px 10px", background: "#FFFFFF", borderRadius: 6, borderLeft: "3px solid #1B6EF3" }}>
                            <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.goldBright, textDecoration: "none", fontFamily: FONT, fontWeight: 500 }}>{link.title} ↗</a>
                            <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 3 }}>{link.relevance}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* RESEARCH TAB */}
                {activeTab === "research" && selResearch && (
                  <div className="card-enter">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div style={{ background: "rgba(14,165,233,0.03)", border: `1px solid rgba(14,165,233,0.12)`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.amber, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>Pain Points</div>
                        {(selResearch.pain_points || []).map((pt, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", borderBottom: i < selResearch.pain_points.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", lineHeight: 1.5, display: "flex", gap: 8 }}>
                            <span style={{ color: C.amber, opacity: 0.5, flexShrink: 0 }}>—</span>{pt}
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(14,165,233,0.03)", border: `1px solid ${C.borderDim}`, borderRadius: 4, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>Tech Signals</div>
                        {(selResearch.tech_stack_signals || []).map((s, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", borderBottom: i < selResearch.tech_stack_signals.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", display: "flex", gap: 8 }}>
                            <span style={{ color: C.gold, opacity: 0.4, flexShrink: 0 }}>·</span>{s}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Open Positions */}
                    {selResearch.open_positions?.length > 0 && (
                      <div style={{ background: "#F0FBF5", border: "1px solid #B8EDD3", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.green, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>💼 Open Positions (signals investment)</div>
                        {selResearch.open_positions.map((pos, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < selResearch.open_positions.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                            <div>
                              <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, fontWeight: 500 }}>{pos.title}</div>
                              <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{pos.signal}</div>
                            </div>
                            {pos.urgency === "high" && <span style={{ fontSize: 9, fontFamily: MONO, color: C.green, background: C.greenDim, padding: "2px 8px", borderRadius: 3 }}>HIGH SIGNAL</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Persona Context */}
                    {selResearch.persona_context && (
                      <div style={{ background: "#FAF5FF", border: "1px solid #DDD0F8", borderRadius: 8, padding: 16, marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.purple, fontFamily: MONO, marginBottom: 12, opacity: 0.8 }}>👤 Persona Context</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginBottom: 6 }}>FOCUS AREAS</div>
                            {(selResearch.persona_context.focus_areas || []).map((f, i) => (
                              <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "3px 0", display: "flex", gap: 8 }}>
                                <span style={{ color: C.purple, opacity: 0.5 }}>·</span>{f}
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginBottom: 6 }}>KPIs</div>
                            {(selResearch.persona_context.kpis || []).map((k, i) => (
                              <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "3px 0", display: "flex", gap: 8 }}>
                                <span style={{ color: C.purple, opacity: 0.5 }}>·</span>{k}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Company Overview</div>
                        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selResearch.company_overview}</div>
                      </div>
                      <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                        <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Recent News</div>
                        {(selResearch.recent_news || []).map((n, i) => (
                          <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0", lineHeight: 1.5, display: "flex", gap: 8 }}>
                            <span style={{ color: C.textDim, opacity: 0.5, flexShrink: 0 }}>·</span>{n}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "rgba(93,232,160,0.03)", border: `1px solid rgba(93,232,160,0.15)`, borderRadius: 4, padding: 16 }}>
                      <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.green, fontFamily: MONO, marginBottom: 10, opacity: 0.8 }}>Why Condense Fits</div>
                      <div style={{ fontSize: 14, color: "#1A4060", lineHeight: 1.8, fontStyle: "italic" }}>{selResearch.why_condense_fits}</div>
                    </div>
                  </div>
                )}

                {/* SUCCESS STORIES TAB */}
                {activeTab === "stories" && (
                  <div className="card-enter">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, lineHeight: 1.8 }}>
                        Success stories are automatically matched to <span style={{ color: C.gold }}>{sel.company}</span> based on industry and tech signals. Use these in your pitch.
                      </div>
                    </div>
                    {selMatchedStories.length === 0 ? (
                      <div style={{ padding: "32px 0", textAlign: "center", color: C.textDim, fontFamily: MONO, fontSize: 12 }}>
                        No closely matched stories. Run the agent first or use general Condense proof points.
                      </div>
                    ) : (
                      selMatchedStories.map((story, i) => (
                        <div key={story.id} style={{ background: "#FFFFFF", border: `1px solid ${i === 0 ? "#B8CCFF" : "#E4ECF4"}`, borderRadius: 10, padding: 18, marginBottom: 10, boxShadow: i === 0 ? "0 2px 12px rgba(27,110,243,0.10)" : "0 1px 4px rgba(10,37,64,0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: C.text }}>{story.company}</div>
                              <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>{story.industry}</div>
                            </div>
                            {i === 0 && <span style={{ fontSize: 9, fontFamily: MONO, color: C.gold, background: C.goldDim, padding: "3px 10px", borderRadius: 3, border: `1px solid ${C.gold}44` }}>BEST MATCH</span>}
                          </div>
                          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 10 }}>{story.summary}</div>
                          <div style={{ padding: "8px 12px", background: C.greenDim, borderRadius: 3, fontSize: 12, color: C.green, fontFamily: FONT }}>
                            📈 {story.outcome}
                          </div>
                          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {story.tags.slice(0, 5).map(tag => (
                              <span key={tag} style={{ fontSize: 9, fontFamily: MONO, color: C.textDim, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 3, border: `1px solid ${C.borderDim}` }}>{tag}</span>
                            ))}
                          </div>
                          <GlowButton small color={C.textMid} onClick={() => { const copyText = `${story.company} (${story.industry}) — ${story.summary} Result: ${story.outcome}`; navigator.clipboard.writeText(copyText); }} style={{ marginTop: 8 }}>Copy for pitch</GlowButton>
                        </div>
                      ))
                    )}

                    {/* All stories */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.borderDim}` }}>
                      <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", marginBottom: 12 }}>ALL SUCCESS STORIES</div>
                      {SUCCESS_STORIES.filter(s => !selMatchedStories.find(m => m.id === s.id)).map(story => (
                        <div key={story.id} style={{ padding: "10px 14px", border: "1px solid #E4ECF4", borderRadius: 8, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF" }}>
                          <div>
                            <div style={{ fontSize: 12, color: C.textMid, fontFamily: FONT, fontWeight: 500 }}>{story.company}</div>
                            <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>{story.industry}</div>
                          </div>
                          <GlowButton small color={C.textDim} onClick={() => navigator.clipboard.writeText(`${story.company} — ${story.summary} Result: ${story.outcome}`)}>Copy</GlowButton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LOG REPLY TAB */}
                {activeTab === "reply" && (
                  <div className="card-enter">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 6 }}>Log a Reply</div>
                      <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, lineHeight: 1.7 }}>
                        When a prospect replies, log what worked here. Future pitches to similar companies will be trained on successful patterns.
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 6 }}>What did they reply? (summarize or paste)</label>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="e.g. 'Replied positively, asked for a demo. They mentioned they're already using Kafka but struggling with schema evolution.' OR paste the actual reply." style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "12px 14px", fontSize: 13, fontFamily: FONT, lineHeight: 1.7, outline: "none", resize: "vertical", minHeight: 120 }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 6 }}>Industry Context</label>
                          <input value={replyIndustry} onChange={e => setReplyIndustry(e.target.value)} placeholder="e.g. EV / Automotive / SaaS" style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "9px 12px", fontSize: 12, fontFamily: FONT, outline: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 6 }}>Tone That Worked</label>
                          <select value={replyTone} onChange={e => setReplyTone(e.target.value)} style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "9px 12px", fontSize: 12, fontFamily: FONT, outline: "none" }}>
                            <option value="">Select tone</option>
                            <option value="technical-peer">Technical peer exchange</option>
                            <option value="business-impact">Business impact focused</option>
                            <option value="casual-warm">Casual and warm</option>
                            <option value="formal-strategic">Formal strategic</option>
                            <option value="event-reference">Event/conference reference</option>
                          </select>
                        </div>
                      </div>
                      <GlowButton onClick={saveReply} disabled={!replyText.trim()} primary>💾 Save Reply Pattern</GlowButton>
                    </div>

                    {/* Saved replies */}
                    {replies.length > 0 && (
                      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.borderDim}` }}>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", marginBottom: 12 }}>SAVED REPLY PATTERNS ({replies.length})</div>
                        {replies.slice(-5).reverse().map(r => (
                          <div key={r.id} style={{ padding: "12px 14px", border: "1px solid #F0E8D8", borderRadius: 8, marginBottom: 6, background: "#FFFDF7" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: C.text, fontFamily: FONT, fontWeight: 500 }}>{r.prospect_name} · {r.company}</span>
                              <span style={{ fontSize: 10, fontFamily: MONO, color: C.textDim }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO }}>{r.industry} · {r.tone}</div>
                            <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontFamily: FONT, lineHeight: 1.6 }}>{r.reply_summary.slice(0, 200)}{r.reply_summary.length > 200 ? "..." : ""}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Timeline */}
                {sel.status === "following" && sel.sentAt && (
                  <div style={{ marginTop: 20 }} className="card-enter">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>Follow-Up Timeline</span>
                      <div style={{ flex: 1, height: 1, background: C.borderDim }} />
                    </div>
                    <div style={{ display: "flex", gap: 0, position: "relative" }}>
                      <div style={{ position: "absolute", top: 14, left: "12.5%", right: "12.5%", height: 2, background: "#E4ECF4", zIndex: 0 }} />
                      {[{ label: "Sent", day: 0, key: "day0_message" }, { label: "Day 3", day: 3, key: "day3_followup" }, { label: "Day 7", day: 7, key: "day7_followup" }, { label: "Day 14", day: 14, key: "day14_followup" }].map((step) => {
                        const d = getDaysUntilFollowup(sel, step.day);
                        const isDue = d <= 0;
                        return (
                          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDue ? "rgba(93,232,160,0.15)" : "rgba(0,0,0,0.6)", border: `1px solid ${isDue ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: isDue ? C.green : C.textDim, boxShadow: isDue ? `0 0 14px rgba(93,232,160,0.3)` : "none" }}>
                              {isDue ? "✓" : "·"}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 500, color: isDue ? C.green : C.textDim, fontFamily: MONO }}>{step.label}</div>
                            {step.day > 0 && <div style={{ fontSize: 9, fontFamily: MONO, color: isDue ? C.green : C.amber, opacity: 0.8 }}>{isDue ? "send now" : `in ${d}d`}</div>}
                            {isDue && step.day > 0 && <GlowButton small color={C.green} onClick={() => { setActiveTab("messages"); setActiveMsg(step.key); }}>View →</GlowButton>}
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
