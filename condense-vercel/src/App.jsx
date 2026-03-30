import { useState, useRef, useEffect, useCallback } from "react";
import { exportProposalPDF } from "./exportProposal";
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

// ─── TRAINING DATA ────────────────────────────────────────────────────────────
const trainingData = [{"name": "Samir Soman", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "USA", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "After connection", "text": "Greetings Samir. Pleasure connecting with you. How are you?"}, {"stage": "Follow Up", "text": "Given your role as Cloud Architect-SRE & Platform Engineering Lead, DevOps at AutoZone, we believe Condense could support your platform initiatives by simplifying real-time streaming, reducing operational overhead around Kafka/streaming infrastructure, improving observability, and enabling more scalable, reliable data pipelines across cloud environments."}, {"stage": "Follow Up", "text": "We would appreciate 30 minutes at your convenience for a quick virtual discussion to understand your current architecture and explore potential areas of alignment along with your email id to share the detailed email. Need your support to take things forward. Thanks."}]}, {"name": "Pranjal Singh", "job_title": "Sr./Systems Engineer", "seniority": "IC-Senior", "company": "AutoZone", "industry": "Automotive Retail", "region": "India", "pain_primary": "Inventory event streaming, Order pipeline reliability, Traffic spikes, B2B transaction reliability", "messages": [{"stage": "First Message", "text": "Reached out to connect with you to have a 30mins of your slot during next week to position our platform Condense to AutoZone. Can I have your email id to send an tailored email and use cases. Thanks"}, {"stage": "Follow Up", "text": "I came across your profile while looking at teams building large-scale data platforms on GCP at AutoZone.\n\nAt Condense, we help data engineering teams ingest high-throughput streaming data, standardise pipelines, and operate reliably at scale—especially where Kafka, real-time telemetry, and cloud-native architectures are involved.\n\nWould love to exchange notes on how you're handling ingestion, schema evolution, and scaling on GCP."}, {"stage": "Follow Up", "text": "Can we connect next week on your availability for 30mins please?"}]}, {"name": "Bhavesh Panchal", "job_title": "Chief Technology Officer", "seniority": "CTO", "company": "Magenta Mobility", "industry": "EV Mobility", "region": "India", "pain_primary": "Real-time fleet and battery telemetry reliability. Scalable event processing for fleet growth.", "messages": [{"stage": "First Message", "text": "Real-Time Data Platform for EV & Mobility Innovation for Magenta Mobility\nHi Bhavesh,\nHope you are doing well. I'm reaching out from Zeliot, a Bosch-backed deep-tech company building real-time data infrastructure for large-scale mobility platforms.\n\nWould you be open to a brief conversation to explore potential alignment with Magenta Mobility's technology roadmap?\n\nBest regards,\nVeera Raghavan"}]}];

// ─── INDUSTRY USE CASES ───────────────────────────────────────────────────────
const INDUSTRY_USE_CASES = [
  { id: "automotive", industries: ["automotive","auto","car","vehicle","mobility","oem","ev","electric vehicle","fleet","telematics"], intro: "Given [COMPANY]'s leadership in automotive platforms and mobility intelligence, we see strong alignment in how Condense can help power real-time, scalable automotive data systems.", use_cases: [{ title: "Connected Vehicle Data Platforms", desc: "Ingest and process telemetry from vehicles at scale and power downstream mobility services." }, { title: "Real-Time Vehicle Intelligence APIs", desc: "Enable instant insights for pricing, diagnostics, driver behavior, and predictive maintenance." }, { title: "Fleet & Dealer Analytics", desc: "Process streaming data from fleets, dealerships, and partner ecosystems for operational insights." }, { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment ensuring complete control over data, security, and compliance." }], social_proof: "Zeliot supports TVS Motor, Volvo, Montra Electric, Bosch, Eicher, CEAT, Royal Enfield, Tata Motors, Adani Ports & Logistics, SML ISUZU, and Ashok Leyland.", closing: "I would be happy to walk you through how leading mobility platforms are using Condense. Please let me know a convenient time for a short discussion next week." },
  { id: "ecommerce", industries: ["ecommerce","e-commerce","marketplace","retail tech","d2c","quick commerce"], intro: "Given the scale at which [COMPANY] operates its marketplace and analytics workloads, we see strong alignment in how Condense can simplify real-time data pipelines.", use_cases: [{ title: "Real-Time Order & Seller Analytics", desc: "Stream updates from transaction systems into analytics platforms in real time." }, { title: "Customer Behavior & Funnel Analytics", desc: "Capture and process high-volume app and web events to power real-time dashboards." }, { title: "Fraud & Anomaly Detection", desc: "Stream transaction and activity data to identify suspicious behavior instantly." }, { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment ensuring complete control." }], social_proof: "Teams we work with have reduced streaming infrastructure and data pipeline costs by 40–50%.", closing: "I would love to explore whether there might be an opportunity to support [COMPANY]'s analytics platform. Would you be open to a 30-minute conversation next week?" },
  { id: "digital_transformation", industries: ["digital transformation","enterprise","it services","consulting","technology","saas","software","platform"], intro: "Condense enables organizations to continuously stream and standardize live data from operational systems into a single real-time data foundation.", use_cases: [{ title: "Unified Real-Time Data Backbone", desc: "Standardize live data flows across business functions and platforms." }, { title: "Real-Time Visibility & Process Optimization", desc: "Observe process performance as it happens and support closed-loop improvement." }, { title: "Accelerate AI, Analytics & Intelligent Automation", desc: "Provide AI/ML models and dashboards with live data streams." }, { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment." }], social_proof: "Condense is trusted in production by TVS Motor, Eicher Motors, SML Isuzu, Tata Motors, Ashok Leyland, Instavans, Switch Mobility, Montra Electric, and Royal Enfield.", closing: "If helpful, I'd be glad to share a brief overview focused on how Condense supports internal product platforms and AI readiness." },
  { id: "fintech", industries: ["fintech","finance","banking","insurance","payments","lending","nbfc","wealth","trading"], intro: "Given [COMPANY]'s focus on financial services and data-driven decisioning, we see strong alignment in how Condense can power real-time financial data pipelines at scale.", use_cases: [{ title: "Real-Time Transaction Monitoring", desc: "Stream and process high-volume transaction events to power fraud detection and risk scoring." }, { title: "Customer Analytics & Personalization", desc: "Capture customer behavior streams to power real-time personalization engines." }, { title: "Risk & Compliance Pipelines", desc: "Enable real-time streaming of regulatory data and audit trails." }, { title: "BYOC (Bring Your Own Cloud)", desc: "Condense can be deployed within your own cloud environment ensuring complete control." }], social_proof: "Fintech teams using Condense have reduced streaming infrastructure costs by 40–50% while improving pipeline reliability.", closing: "I would be happy to walk you through how Condense can support [COMPANY]'s real-time data initiatives. Would you be open to a 30-minute discussion next week?" },
];

function findIndustryUseCases(company, industry, researchData) {
  const target = `${company} ${industry} ${researchData?.company_overview || ""}`.toLowerCase();
  let best = null, bestScore = 0;
  INDUSTRY_USE_CASES.forEach(uc => {
    let score = 0;
    uc.industries.forEach(tag => { if (target.includes(tag)) score += 3; });
    if (score > bestScore) { bestScore = score; best = uc; }
  });
  return best || INDUSTRY_USE_CASES[2];
}

// ─── SUCCESS STORIES ──────────────────────────────────────────────────────────
const SUCCESS_STORIES = [
  { id: "vecv_volvo_eicher", company: "VECV (Volvo Eicher)", industry: "Commercial Vehicle OEM", tags: ["automotive","oem","kafka","connected vehicle","fleet"], summary: "VECV switched from IBM Event Streams to Condense to power their connected vehicle program for 200K+ M&HCV variants.", outcome: "20% TCO reduction · 99.95% uptime · 35% less dev & ops spend · 200K connected vehicles." },
  { id: "royal_enfield", company: "Royal Enfield", industry: "Automotive OEM / Two-Wheeler", tags: ["automotive","oem","two-wheeler","gcp","kafka","byoc"], summary: "Royal Enfield uses Condense as the core streaming engine for their next-gen connected bike platform on GCP.", outcome: "40,000+ connected bikes · BYOC Kafka on GCP · high-volume telemetry ingestion at scale." },
  { id: "montra_electric", company: "Montra Electric", industry: "EV OEM / Electric Mobility", tags: ["ev","electric vehicle","oem","kafka","confluent"], summary: "Montra Electric replaced Confluent + Sibros with Condense, handling 65 MBps average data ingress.", outcome: "40% reduction in TCO · scaled from 20K to 62K+ connected vehicles." },
  { id: "ceat", company: "CEAT Tyres", industry: "Tyre OEM / Fleet Management", tags: ["tyre","fleet","oem","byoc"], summary: "CEAT built a full fleet-management system for intelligent tyre health analytics in under 120 days using Condense.", outcome: "Rapid GTM in 120 days · 6,500+ connected vehicles · fully operational BYOC deployment." },
  { id: "tata_motors", company: "Tata Motors", industry: "Automotive OEM / EV", tags: ["automotive","oem","ev","tata","telemetry"], summary: "Tata Motors deployed Condense for full-stack Telemetry, CAN, Events, and DTC integration.", outcome: "15,000 vehicles · 10s packet frequency · mission-critical control." },
];

function findMatchingStories(company, industry, researchData) {
  const target = `${company} ${industry} ${researchData?.company_overview || ""} ${(researchData?.pain_points || []).join(" ")}`.toLowerCase();
  return SUCCESS_STORIES.map(story => {
    let score = 0;
    story.tags.forEach(tag => { if (target.includes(tag.toLowerCase())) score += 2; });
    return { ...story, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
async function dbSave(table, id, data) {
  if (!supabase) return;
  try { await supabase.from(table).upsert({ id, data, updated_at: new Date().toISOString() }); } catch(e) { console.error('Save error:', e); }
}
async function dbLoad(table) {
  if (!supabase) return {};
  try {
    let all = [], from = 0;
    while (true) {
      const { data, error } = await supabase.from(table).select('id, data').range(from, from + 999);
      if (error || !data || data.length === 0) break;
      all = [...all, ...data];
      if (data.length < 1000) break;
      from += 1000;
    }
    return Object.fromEntries(all.map(r => [r.id, r.data]));
  } catch(e) { return {}; }
}

// ─── CLAUDE API WRAPPER ───────────────────────────────────────────────────────
async function callClaude({ system, messages, max_tokens = 1500 }) {
  const contents = messages.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user";
    let parts;
    if (typeof msg.content === "string") parts = [{ text: msg.content }];
    else if (Array.isArray(msg.content)) parts = msg.content.map(c => c.type === "text" ? { text: c.text } : { text: String(c.content || "") }).filter(p => p.text);
    else parts = [{ text: String(msg.content || "") }];
    return { role, parts: parts.length ? parts : [{ text: " " }] };
  });
  const body = { contents, generationConfig: { maxOutputTokens: max_tokens, temperature: 0.3, responseMimeType: "application/json" } };
  if (system) body.system_instruction = { parts: [{ text: system }] };
  const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.text(); throw new Error(`Gemini error ${res.status}: ${e}`); }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Gemini API error");
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  return { content: [{ type: "text", text }], stop_reason: "end_turn" };
}

function extractJSON(text) {
  if (!text?.trim()) throw new Error("Empty response");
  let s = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").replace(/<[^>]+>/g, "").trim();
  const start = s.indexOf("{"), end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  const parsed = JSON.parse(s.slice(start, end + 1));
  if (parsed.email_body) parsed.email_body = parsed.email_body.replace(/\n{3,}/g, "\n\n");
  return parsed;
}

function stripCites(text) {
  if (!text) return text;
  if (typeof text === "string") return text.replace(/<[^>]+>/g, "").trim();
  if (Array.isArray(text)) return text.map(stripCites);
  return text;
}

// ─── V4 EXCEL EMAIL GENERATOR (new correct templates) ─────────────────────────
const STACK_DESC_V4 = {
  "Kafka + BigQuery":            "Apache Kafka for real-time event streaming with BigQuery as the analytical warehouse",
  "Kafka + Databricks":          "Apache Kafka for real-time event streaming with Databricks for stream processing and ML workloads",
  "Kafka + Snowflake":           "Apache Kafka for real-time event streaming with Snowflake as the cloud data warehouse",
  "Kafka + Redshift":            "Apache Kafka for real-time event streaming with Amazon Redshift as the data warehouse",
  "Event Streaming + Warehouse": "an event streaming backbone combined with a modern cloud data warehouse",
};
const TOOL_DESC_V4 = {
  Fivetran:    "Fivetran for automated data ingestion",
  Hevo:        "Hevo Data for pipeline orchestration",
  Rudderstack: "RudderStack for customer data and event pipelines",
  Striim:      "Striim for real-time data integration and CDC",
  Airbyte:     "Airbyte for open-source ELT pipelines",
};
const USE_CASE_V4 = {
  "Real-time analytics":      "real-time analytics",
  "Customer personalization": "customer personalization",
  "Fraud detection":          "fraud detection and anomaly monitoring",
  "Operational dashboards":   "operational dashboards and live monitoring",
};
const BULLETS_V4 = {
  "Real-time Analytics": [
    { t: "Optimize high-throughput Kafka workloads and reduce streaming infrastructure costs", b: "Condense is designed to efficiently handle very large event volumes while minimizing compute, storage, and data movement overhead. This allows teams running high-throughput Kafka environments to significantly reduce cloud infrastructure costs while maintaining performance at scale." },
    { t: "Enable real-time transformations closer to the data stream", b: "Instead of moving raw data across multiple processing layers, Condense allows transformations, filtering, and enrichment to happen directly within the streaming pipeline. This improves latency and reduces unnecessary downstream processing workloads." },
    { t: "Simplify complex ingestion and pipeline layers", b: "Modern data architectures often rely on several tools such as Kafka Connect, CDC pipelines, ELT tools, and event streaming systems. Condense helps streamline this architecture by consolidating ingestion, transformation, and delivery pipelines into a unified real-time data platform." },
    { t: "Deliver reliable, low-latency data pipelines for analytics and operational systems", b: "Condense ensures consistent and reliable data delivery across downstream systems such as data warehouses, analytics platforms, operational services, and AI/ML pipelines — enabling teams to build applications that rely on real-time data." },
    { t: "Handle massive event spikes reliably", b: "For platforms experiencing sudden spikes in user activity, Condense enables streaming pipelines to scale seamlessly without bottlenecks, ensuring data pipelines remain stable and performant during peak loads." },
  ],
  "Event Streaming": [
    { t: "Handle massive event spikes reliably", b: "For platforms experiencing sudden spikes in user activity, Condense enables streaming pipelines to scale seamlessly without bottlenecks, ensuring data pipelines remain stable during peak loads." },
    { t: "Optimize high-throughput Kafka workloads and reduce streaming infrastructure costs", b: "Condense is designed to efficiently handle very large event volumes while minimizing compute, storage, and data movement overhead — allowing teams to significantly reduce cloud infrastructure costs while maintaining performance at scale." },
    { t: "Enable real-time transformations and stream processing closer to the data stream", b: "Condense allows transformations, filtering, and enrichment to happen directly within the streaming pipeline, improving latency and reducing unnecessary downstream processing." },
    { t: "Simplify complex ingestion and pipeline layers", b: "Condense consolidates ingestion, transformation, and delivery pipelines into a unified real-time data platform, reducing sprawl across Kafka Connect, CDC tools, and ELT systems." },
    { t: "Deliver reliable, low-latency data pipelines for analytics and operational systems", b: "Condense ensures consistent and reliable data delivery across data warehouses, analytics platforms, and AI/ML pipelines." },
  ],
  "Warehouse Sync": [
    { t: "Simplify complex ingestion and pipeline layers", b: "Modern data architectures often rely on Kafka Connect, CDC pipelines, ELT tools, and event streaming systems. Condense helps streamline this into a unified real-time data platform — removing the need to stitch multiple layers together." },
    { t: "Optimize warehouse sync performance and reduce infrastructure costs", b: "Condense handles large event volumes efficiently while minimizing compute and data movement overhead between operational systems and the warehouse — reducing both latency and cost." },
    { t: "Enable real-time transformations before warehouse ingestion", b: "Instead of pushing raw data downstream and transforming inside the warehouse, Condense allows filtering, enrichment, and schema normalization to happen within the streaming pipeline — reducing warehouse compute load." },
    { t: "Deliver reliable, consistent data pipelines", b: "Condense ensures reliable and consistent delivery across data warehouses and analytics platforms, eliminating the gaps and delays that often appear in high-volume batch-sync architectures." },
    { t: "Handle massive event spikes reliably", b: "Condense enables streaming pipelines to scale seamlessly without bottlenecks during peak loads — ensuring warehouse sync stays current even when event volumes surge unexpectedly." },
  ],
  "CDC Pipelines": [
    { t: "Simplify CDC and complex pipeline layers", b: "Condense consolidates CDC, ingestion, and delivery pipelines into a unified real-time data platform — eliminating the operational complexity of managing Debezium, Kafka Connect, and downstream sync separately." },
    { t: "Enable real-time transformations closer to the data stream", b: "Condense allows filtering, enrichment, and schema normalization to happen within the CDC pipeline itself — rather than pushing raw change events downstream and processing them later." },
    { t: "Deliver reliable, low-latency data pipelines", b: "Condense ensures consistent delivery of change events across data warehouses, operational services, and AI/ML pipelines — with built-in retry, exactly-once semantics, and schema registry support." },
    { t: "Optimize high-throughput CDC workloads and reduce streaming infrastructure costs", b: "Condense handles very large change event volumes efficiently — minimizing the compute and storage overhead that typically grows as the number of CDC sources and target systems increases." },
    { t: "Handle massive event spikes reliably", b: "Condense enables CDC pipelines to scale seamlessly without bottlenecks — ensuring data pipelines remain stable during peak operational loads." },
  ],
  "AI/Agent Data Pipelines": [
    { t: "Deliver reliable, low-latency data pipelines for AI and ML systems", b: "Condense ensures consistent and reliable delivery of fresh data across AI/ML pipelines, analytics platforms, and operational services — enabling models and agents to operate on current, complete data." },
    { t: "Enable real-time transformations and feature enrichment closer to the data stream", b: "Condense allows feature engineering, filtering, and data enrichment to happen directly within the streaming pipeline — so AI systems receive clean, structured data without additional preprocessing layers." },
    { t: "Optimize high-throughput Kafka workloads and reduce infrastructure costs", b: "Condense efficiently handles very large event volumes while minimizing compute overhead — allowing AI data pipelines to scale cost-effectively as model training and inference data requirements grow." },
    { t: "Simplify complex ingestion and pipeline layers for AI workloads", b: "Condense consolidates ingestion, transformation, and delivery into a unified real-time data platform — accelerating the time it takes to get new data sources into production for AI/ML use cases." },
    { t: "Handle massive event spikes reliably", b: "Condense enables AI data pipelines to scale seamlessly without bottlenecks during peak loads — ensuring models always receive fresh, complete data even during traffic surges." },
  ],
};

function generateDataStackEmail(row) {
  const company     = row["Company"] || row.company || "";
  const stack       = row["Data Stack Signal"] || "";
  const tool        = row["Tool Used"] || "";
  const useCase     = row["Use Case"] || "";
  const cloud       = row["Cloud Provider"] || "";
  const warehouse   = row["Data Warehouse"] || "";
  const persona     = row["Buying Persona"] || "Data Engineering Team";
  const integration = row["Integration Opportunity"] || "Real-time Analytics";

  const stackDesc  = STACK_DESC_V4[stack]       || stack;
  const toolDesc   = TOOL_DESC_V4[tool]          || tool;
  const useCaseCtx = USE_CASE_V4[useCase]        || useCase.toLowerCase();
  const bullets    = BULLETS_V4[integration]     || BULLETS_V4["Real-time Analytics"];

  const kafkaBased = stack.toLowerCase().includes("kafka");
  const kafkaRef   = kafkaBased ? "Kafka, " : "";

  const subject = `Condense — Complementing ${company}'s ${kafkaBased ? "Kafka" : "event streaming"} data platform for scale and cost efficiency`;

  const bulletLines = bullets.map(b => `• ${b.t} — ${b.b}`).join("\n\n");

  const body = `Dear ${persona},

Greetings! I'm reaching out to introduce Condense, a deep-tech real-time data platform from Zeliot, backed by Bosch. Condense is built for modern data engineering and analytics teams that need to operationalize real-time data across products, analytics platforms, and AI systems without the heavy operational complexity of managing distributed streaming infrastructure.

Platforms like ${company} typically operate a modern data architecture built around ${stackDesc}${cloud ? ` on ${cloud}` : ""}, with microservices generating large volumes of ${useCaseCtx} events across the platform.

In addition, many teams complement this with tools like ${toolDesc} for ${useCaseCtx} pipelines, along with Kafka Connect or Debezium for CDC pipelines to move data across systems${warehouse ? ` into ${warehouse}` : ""}.

While this architecture is powerful, it can also introduce operational complexity, multiple pipeline layers, and increasing infrastructure costs as event volumes grow. Condense is designed to complement this ecosystem by providing a high-performance Kafka-native data platform that simplifies and optimizes streaming data pipelines.

Teams typically leverage Condense to:

${bulletLines}

As a pre-read, sharing the below information on Condense.
* Condense Overview: https://docs.zeliot.in/condense
* Case Studies: https://www.zeliot.in/blog
* About Zeliot: www.zeliot.in/quick-links
* Get Started with Condense: https://www.zeliot.in/try-now

Given ${company}'s focus on ${useCaseCtx}, I thought this could be relevant to your data platform initiatives.

Would you be open to a 30-minute discussion to explore how Condense could complement your existing ${kafkaRef}${tool}, and streaming architecture?

Thanks & Regards,
Veera Raghavan
Head of Enterprise Sales
📞 9353094136
✉️ veera.raghavan@zeliot.in`;

  return { subject, body };
}

// ─── RESEARCH AGENT ───────────────────────────────────────────────────────────
async function runResearchAgent(company, linkedinUrl, personName, jobTitle, jdText, onLog) {
  onLog("🔍 Deep research starting for " + company + "...");
  await new Promise(r => setTimeout(r, 2000));
  const researchPrompt = `You are a B2B sales research agent for Condense (Kafka-based real-time data streaming platform by Zeliot, Bosch-backed).
Research this prospect:
- Person: ${personName} (${jobTitle})
- Company: ${company}
- LinkedIn: ${linkedinUrl || "not provided"}
${jdText ? `- JD/Role Context: ${jdText.slice(0, 800)}` : ""}
Return ONLY valid JSON:
{
  "company_overview": "2-3 sentence summary",
  "tech_stack_signals": ["signal 1", "signal 2", "signal 3"],
  "condense_fit": {"score": "high", "reason": "2-3 sentence explanation"},
  "persona_context": {"focus_areas": ["area1","area2"], "kpis": ["kpi1","kpi2"], "pain_areas": ["pain1","pain2"]},
  "pain_points": ["pain 1", "pain 2", "pain 3", "pain 4"],
  "recent_news": ["news 1", "news 2"],
  "pre_read_links": [{"title": "Article title", "url": "https://...", "relevance": "Why this matters"}],
  "why_condense_fits": "2-3 sentences",
  "conversation_hooks": ["hook 1", "hook 2"],
  "confidence_score": 80
}`;
  const data = await callClaude({ system: "You are a B2B research agent. Return ONLY valid JSON.", messages: [{ role: "user", content: researchPrompt }], max_tokens: 2500 });
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const json = extractJSON(text);
  const clean = { ...json, company_overview: stripCites(json.company_overview), tech_stack_signals: stripCites(json.tech_stack_signals), pain_points: stripCites(json.pain_points), recent_news: stripCites(json.recent_news), why_condense_fits: stripCites(json.why_condense_fits), conversation_hooks: stripCites(json.conversation_hooks) };
  onLog("✅ Research complete — " + (clean.pain_points?.length || 0) + " pain points found");
  return clean;
}

// ─── MESSAGE GENERATION AGENT ─────────────────────────────────────────────────
async function generateMessages(person, research, matchedStories, jdText, replyTrainingData, industryContext, extraContext, onLog) {
  onLog("✍️ Crafting personalized messages...");
  const { industryUC, useCasesStr, industryIntro, industrySocialProof, industryClosing } = industryContext;
  const storyContext = matchedStories.length > 0 ? matchedStories.map(s => `- ${s.company} (${s.industry}): ${s.summary} Result: ${s.outcome}`).join("\n") : "No closely matched stories.";

  const prompt = `You are Veera Raghavan, Country Head – Enterprise Business (India) at Zeliot–Condense (Bosch-backed).
ABOUT CONDENSE: Kafka-based real-time data streaming platform by Zeliot, backed by Bosch. BYOC. Managed Kafka + 50+ connectors + transforms + monitoring. 40%+ lower TCO vs self-managed Kafka.
TARGET PROSPECT:
Name: ${person.name}
Role: ${person.jobTitle || "Unknown"}
Company: ${person.company}
Seniority: ${person.seniority || "infer from title"}
Region: ${person.region || "India"}
${jdText ? `JD CONTEXT:\n${jdText.slice(0, 600)}` : ""}
RESEARCH:
Company Overview: ${research.company_overview}
Tech Stack: ${(research.tech_stack_signals || []).join(", ")}
Pain Points: ${(research.pain_points || []).join(" | ")}
Why Condense Fits: ${research.why_condense_fits}
Conversation Hooks: ${(research.conversation_hooks || []).join(" | ")}
${extraContext ? `EXTRA CONTEXT: ${extraContext}` : ""}
SUCCESS STORIES: ${storyContext}
INDUSTRY USE CASES: ${useCasesStr}
Social proof: ${industrySocialProof}
Closing: ${industryClosing}
STYLE RULES:
- Always open with "Greetings [Name]," — never "Dear"
- Second line: "Hope you are doing well."
- Introduce as "Zeliot Condense, a deep-tech real-time data platform backed by Bosch"
- Tie to their specific industry
- End LinkedIn messages with "Looking forward to connecting" or "Looking forward to your guidance"
- Ask for "30 minutes next week"
- Email MUST include pre-read block:
As a pre-read, sharing the below information on Condense.
- Condense Overview: https://docs.zeliot.in/condense
- Case Studies: https://www.zeliot.in/blog
- About Zeliot: www.zeliot.in/quick-links
- Get Started with Condense: https://bit.ly/3NmxJpe
Return ONLY this JSON:
{
  "connection_note": "MAX 300 chars",
  "day0_message": "80-120 words",
  "day3_followup": "50-80 words",
  "day7_followup": "30-50 words",
  "day14_followup": "20-35 words",
  "email_subject": "under 60 chars",
  "email_body": "350-500 words with pre-read block",
  "email_followup1": "3-4 short paragraphs, different angle",
  "email_followup2": "2-3 short paragraphs, final nudge",
  "key_points": ["why this message", "pain targeted", "personalization hook", "proof point used"],
  "objections": [{"title": "We already use Confluent", "response": "..."}, {"title": "Not the right time", "response": "..."}, {"title": "Send more info", "response": "..."}, {"title": "We have internal team", "response": "..."}]
}`;

  const data2 = await callClaude({ system: "You are Veera Raghavan. Return ONLY valid JSON.", messages: [{ role: "user", content: prompt }], max_tokens: 2200 });
  const text2 = (data2.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  onLog(`✅ Messages crafted`);
  return extractJSON(text2);
}

// ─── LINKEDIN LOOKUP ──────────────────────────────────────────────────────────
async function lookupLinkedIn(linkedinUrl, onStatus) {
  onStatus("🔍 Looking up LinkedIn profile...");
  const res = await fetch("/api/linkedin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkedinUrl }) });
  if (!res.ok) throw new Error("Lookup failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  onStatus("✅ Profile found!");
  return data;
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
  .card-enter { animation: fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
  .log-line { animation: logIn 0.2s ease; }
  .fade-in { animation: fadeIn 0.3s ease; }
  input::placeholder { color: #A0AABB; }
  textarea::placeholder { color: #A0AABB; }
  input:focus, textarea:focus { outline: none; border-color: #1B6EF3 !important; box-shadow: 0 0 0 3px rgba(27,110,243,0.12) !important; }
  select:focus { outline: none; border-color: #1B6EF3 !important; }
  .prospect-card:hover { background: #EEF3FF !important; border-color: #B8CCFF !important; transform: translateX(2px); }
  .prospect-card { transition: all 0.15s ease; cursor: pointer; }
  .tab-btn:hover { color: #1B6EF3 !important; background: #F0F5FF !important; }
  .glow-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(27,110,243,0.25) !important; }
  .glow-btn { transition: all 0.15s ease; }
  .notif-badge { animation: pulse 2s ease infinite; }
  .send-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.96); }
  .send-btn { transition: all 0.15s ease; }
  input, textarea, select { font-family: 'Inter', sans-serif !important; }
  .row-hover:hover { background: rgba(27,110,243,0.05) !important; }
`;

const C = {
  bg: "#F5F7FA", bgDeep: "#FFFFFF", surface: "#FFFFFF", surfaceAlt: "#F8FAFC", surfaceMid: "#EEF2F7",
  border: "rgba(10,37,64,0.10)", borderBright: "rgba(27,110,243,0.35)", borderDim: "rgba(10,37,64,0.06)",
  gold: "#1B6EF3", goldBright: "#3D8BFF", goldDim: "rgba(27,110,243,0.10)", goldDimmer: "rgba(27,110,243,0.05)",
  green: "#0D9E6E", greenDim: "rgba(13,158,110,0.10)",
  amber: "#D97706", amberDim: "rgba(217,119,6,0.10)",
  red: "#E53E3E", redDim: "rgba(229,62,62,0.10)",
  blue: "#1B6EF3", blueDim: "rgba(27,110,243,0.10)",
  purple: "#7C3AED", purpleDim: "rgba(124,58,237,0.10)",
  whatsapp: "#25D366", whatsappDim: "rgba(37,211,102,0.10)",
  navy: "#0A2540", navyMid: "#1A3A5C",
  text: "#0A2540", textMid: "#4A6080", textDim: "#8A9BB0", textFaint: "#C8D4E0",
};

const STATUS_CONFIG = {
  idle:        { color: "#8A9BB0", bg: "#EEF2F7",                  label: "Not Started" },
  researching: { color: "#D97706", bg: "rgba(217,119,6,0.10)",     label: "Researching" },
  generating:  { color: "#1B6EF3", bg: "rgba(27,110,243,0.10)",    label: "Generating" },
  ready:       { color: "#0D9E6E", bg: "rgba(13,158,110,0.10)",    label: "Ready to Send" },
  sent:        { color: "#1B6EF3", bg: "rgba(27,110,243,0.08)",    label: "Sent" },
  following:   { color: "#7C3AED", bg: "rgba(124,58,237,0.10)",    label: "Following Up" },
  done:        { color: "#0D9E6E", bg: "rgba(13,158,110,0.10)",    label: "Complete" },
  replied:     { color: "#D97706", bg: "rgba(217,119,6,0.10)",     label: "Replied ✓" },
  error:       { color: "#E53E3E", bg: "rgba(229,62,62,0.10)",     label: "Error" },
};

const FOLLOWUP_SCHEDULE = [
  { key: "connection_note", label: "Connection Note", day: "Now",   icon: "🔗", hint: "Send with connection request · max 300 chars" },
  { key: "day0_message",    label: "First Message",   day: "Day 0", icon: "💬", hint: "Send right after they accept" },
  { key: "day3_followup",   label: "Follow-Up 1",     day: "Day 3", icon: "📨", hint: "3 days after first message" },
  { key: "day7_followup",   label: "Follow-Up 2",     day: "Day 7", icon: "📨", hint: "7 days after first message" },
  { key: "day14_followup",  label: "Follow-Up 3",     day: "Day 14",icon: "📨", hint: "Final nudge — keep door open" },
  { key: "email_body",      label: "Email",           day: "Email", icon: "✉️", hint: "Full email version" },
  { key: "email_followup1", label: "Email F/U 1",     day: "E+3",   icon: "📧", hint: "Follow-up email 3 days after first email" },
  { key: "email_followup2", label: "Email F/U 2",     day: "E+7",   icon: "📧", hint: "Final follow-up email 7 days after first email" },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO, padding: "3px 10px", borderRadius: 20, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>{cfg.label}</span>;
}
function Spinner() {
  return <div style={{ width: 14, height: 14, border: "1.5px solid #DDEAFF", borderTop: "1.5px solid #1B6EF3", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}
function GlowButton({ onClick, disabled, children, color = C.gold, small, primary }) {
  return <button onClick={onClick} disabled={disabled} className="glow-btn" style={{ padding: small ? "5px 12px" : primary ? "10px 20px" : "8px 16px", borderRadius: 6, border: primary ? "none" : `1px solid ${color}44`, background: primary ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "transparent", color: disabled ? C.textDim : primary ? "#FFFFFF" : color, fontWeight: primary ? 600 : 500, fontSize: small ? 11 : 12, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6, boxShadow: primary ? "0 2px 10px rgba(27,110,243,0.30)" : "none" }}>{children}</button>;
}
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid, fontFamily: FONT }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 11px", fontSize: 13, fontFamily: FONT, outline: "none", transition: "all 0.15s" }} />
  </div>;
}

function SendButtons({ prospect, messageText, messageType, emailSubject, senderProfile = {} }) {
  const phone = senderProfile.phone || prospect.phone || "";
  const email = prospect.email || "";
  const sendWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean) window.open(`https://wa.me/${phoneClean}?text=${encoded}`, "_blank");
    else { window.open(`https://web.whatsapp.com/`, "_blank"); navigator.clipboard.writeText(messageText); alert("WhatsApp opened. Message copied to clipboard."); }
  };
  const sendSMS = () => {
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean) window.open(`sms:${phoneClean}?body=${encodeURIComponent(messageText)}`, "_blank");
    else { navigator.clipboard.writeText(messageText); alert("No phone number. Message copied."); }
  };
  const sendLinkedIn = () => {
    const url = prospect.linkedinUrl ? (prospect.linkedinUrl.startsWith("http") ? prospect.linkedinUrl : "https://" + prospect.linkedinUrl) : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((prospect.name || "") + " " + (prospect.company || ""))}`;
    navigator.clipboard.writeText(messageText);
    window.open(url, "_blank");
  };
  const sendEmail = () => {
    const sig = senderProfile.signature ? `\n\n${senderProfile.signature}` : "";
    window.open(`mailto:${email}?subject=${encodeURIComponent(emailSubject || `Zeliot Condense — ${prospect.company}`)}&body=${encodeURIComponent(messageText + sig)}`, "_blank");
  };
  return <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
    <button className="send-btn" onClick={sendWhatsApp} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.whatsapp}55`, background: C.whatsappDim, color: C.whatsapp, fontSize: 11, fontFamily: FONT, fontWeight: 500 }}>💬 WhatsApp</button>
    <button className="send-btn" onClick={sendSMS} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.blue}55`, background: C.blueDim, color: C.blue, fontSize: 11, fontFamily: FONT, fontWeight: 500 }}>📱 SMS</button>
    <button className="send-btn" onClick={sendEmail} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: `1px solid ${C.amber}55`, background: C.amberDim, color: C.amber, fontSize: 11, fontFamily: FONT, fontWeight: 500 }}>✉️ Send Mail</button>
    <button className="send-btn" onClick={sendLinkedIn} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, border: "1px solid #0077B544", background: "#EBF5FB", color: "#0077B5", fontSize: 11, fontFamily: FONT, fontWeight: 500 }}>💼 LinkedIn</button>
  </div>;
}

function NotificationBell({ notifications, onClear }) {
  const [open, setOpen] = useState(false);
  const due = notifications.filter(n => !n.cleared);
  return <div style={{ position: "relative" }}>
    <button onClick={() => setOpen(o => !o)} style={{ background: due.length > 0 ? "#FFF8EB" : "#F8FAFC", border: `1px solid ${due.length > 0 ? "#F0C070" : "#E4ECF4"}`, borderRadius: 6, padding: "6px 12px", color: due.length > 0 ? C.amber : C.textMid, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
      🔔 {due.length > 0 && <span className="notif-badge" style={{ background: C.amber, color: "#000", fontSize: 9, fontFamily: MONO, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{due.length}</span>}
    </button>
    {open && <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, boxShadow: "0 8px 32px rgba(10,37,64,0.12)", zIndex: 300, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF2F7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontFamily: MONO, color: C.textMid, letterSpacing: "0.08em" }}>FOLLOW-UP REMINDERS</span>
        {due.length > 0 && <button onClick={() => { onClear(); setOpen(false); }} style={{ fontSize: 11, fontFamily: FONT, color: "#1B6EF3", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Clear all</button>}
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {due.length === 0 ? <div style={{ padding: "20px 16px", fontSize: 12, color: C.textDim, fontFamily: MONO, textAlign: "center" }}>No pending follow-ups</div>
          : due.map((n, i) => <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEF2F7", background: n.urgent ? "#FFFBF0" : "#FFFFFF" }}>
            <div style={{ fontSize: 12, color: C.text, fontFamily: FONT, fontWeight: 500 }}>{n.name}</div>
            <div style={{ fontSize: 10, color: n.urgent ? C.amber : C.textMid, fontFamily: MONO, marginTop: 3 }}>{n.message}</div>
          </div>)}
      </div>
    </div>}
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [prospects, setProspects] = useState([]);
  const [research, setResearch] = useState({});
  const [messages, setMessages] = useState({});
  const [edits, setEdits] = useState({});
  const [replies, setReplies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [excelRows, setExcelRows] = useState([]);
  const [excelGenerated, setExcelGenerated] = useState({});
  const [excelSelected, setExcelSelected] = useState(null);
  const [excelEditedBody, setExcelEditedBody] = useState({});
  const [ratings, setRatings] = useState({});
  const [ratingFeedback, setRatingFeedback] = useState({});
  const [trainingExamples, setTrainingExamples] = useState([]);
  const [enriching, setEnriching] = useState(null);
  const [enrichedData, setEnrichedData] = useState({});

  useEffect(() => {
    async function loadAll() {
      if (!supabase) { setDbLoaded(true); return; }
      const [p, r, m, e, rep, n, rat, tr, exRows, exGen, exEdits] = await Promise.all([
        dbLoad('v3_prospects'), dbLoad('v3_research'), dbLoad('v3_messages'),
        dbLoad('v3_edits'), dbLoad('v3_replies'), dbLoad('v3_notifications'),
        dbLoad('v3_ratings'), dbLoad('v3_training'),
        dbLoad('v3_excel_rows'), dbLoad('v3_excel_generated'), dbLoad('v3_excel_edits'),
      ]);
      setProspects(Object.values(p).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setResearch(r); setMessages(m); setEdits(e);
      setReplies(Object.values(rep)); setNotifications(Object.values(n));
      setRatings(rat); setTrainingExamples(Object.values(tr));
      const restoredRows = Object.values(exRows).sort((a, b) => a._id - b._id);
      if (restoredRows.length > 0) { setExcelRows(restoredRows); setExcelSelected(restoredRows[0]._id); }
      setExcelGenerated(Object.fromEntries(Object.entries(exGen).map(([k, v]) => [Number(k), v])));
      setExcelEditedBody(Object.fromEntries(Object.entries(exEdits).map(([k, v]) => [k, v])));
      setDbLoaded(true);
    }
    loadAll();
  }, []);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", jobTitle: "", company: "", linkedinUrl: "", email: "", phone: "", jdText: "" });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState("");
  const [logs, setLogs] = useState({});
  const [activeMsg, setActiveMsg] = useState(null);
  const [running, setRunning] = useState(null);
  const [activeTab, setActiveTab] = useState("messages");
  const [showJD, setShowJD] = useState(false);
  const [extraContext, setExtraContext] = useState({});
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
  const excelFileRef = useRef();
  const [uploadStatus, setUploadStatus] = useState("");
  const [senderProfile, setSenderProfile] = useState(() => { try { return JSON.parse(localStorage.getItem('sender_profile') || 'null') || {}; } catch { return {}; } });
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState("prospects");
  const [zohoPushing, setZohoPushing] = useState(false);
  const [zohoPushStatus, setZohoPushStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState("all");
  const [excelSearch, setExcelSearch] = useState("");
  const [excelFilterStack, setExcelFilterStack] = useState("all");
  const [excelFilterInteg, setExcelFilterInteg] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  // Persist
  useEffect(() => { if (!dbLoaded) return; prospects.forEach(p => dbSave('v3_prospects', p.id, p)); }, [prospects, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(research).forEach(([id, val]) => dbSave('v3_research', id, val)); }, [research, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(messages).forEach(([id, val]) => dbSave('v3_messages', id, val)); }, [messages, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(edits).forEach(([id, val]) => dbSave('v3_edits', id, val)); }, [edits, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; replies.forEach(r => dbSave('v3_replies', r.id, r)); }, [replies, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; notifications.forEach(n => dbSave('v3_notifications', n.id || `n_${Date.now()}`, n)); }, [notifications, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(ratings).forEach(([id, val]) => dbSave('v3_ratings', id, val)); }, [ratings, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; trainingExamples.forEach(t => dbSave('v3_training', t.id, t)); }, [trainingExamples, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; excelRows.forEach(r => dbSave('v3_excel_rows', String(r._id), r)); }, [excelRows, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(excelGenerated).forEach(([id, val]) => dbSave('v3_excel_generated', String(id), val)); }, [excelGenerated, dbLoaded]);
  useEffect(() => { if (!dbLoaded) return; Object.entries(excelEditedBody).forEach(([id, val]) => dbSave('v3_excel_edits', id, val)); }, [excelEditedBody, dbLoaded]);
  useEffect(() => { localStorage.setItem('sender_profile', JSON.stringify(senderProfile)); }, [senderProfile]);
  useEffect(() => { if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // Notifications
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const newN = [];
      prospects.forEach(p => {
        if (!p.sentAt || p.status === "done") return;
        [3, 7, 14].forEach(day => {
          const target = new Date(new Date(p.sentAt).getTime() + day * 24 * 60 * 60 * 1000);
          const diffH = (target - now) / (1000 * 60 * 60);
          if (diffH <= 24 && diffH > -48) {
            const exists = notifications.find(n => n.id === `${p.id}_d${day}` && !n.cleared);
            if (!exists) newN.push({ id: `${p.id}_d${day}`, name: p.name, company: p.company, message: diffH <= 0 ? `Day ${day} follow-up is OVERDUE` : `Day ${day} follow-up due in ${Math.ceil(diffH)}h`, urgent: diffH <= 0, cleared: false, createdAt: new Date().toISOString() });
          }
        });
      });
      if (newN.length > 0) setNotifications(prev => { const ids = new Set(prev.map(n => n.id)); const truly = newN.filter(n => !ids.has(n.id)); return truly.length > 0 ? [...prev, ...truly] : prev; });
    };
    check();
    const iv = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [prospects]);

  const addLog = (id, msg) => setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));

  const lookupProfile = async () => {
    if (!form.linkedinUrl) return;
    setLookupLoading(true); setLookupStatus("");
    try {
      const info = await lookupLinkedIn(form.linkedinUrl, setLookupStatus);
      setForm(prev => ({ ...prev, name: info.name || prev.name, jobTitle: info.jobTitle || prev.jobTitle, company: info.company || prev.company }));
      setLookupStatus("✅ Form auto-filled!");
    } catch { setLookupStatus("⚠️ Could not extract profile. Fill manually."); }
    finally { setLookupLoading(false); }
  };

  const addProspect = () => {
    if (!form.name || !form.company) return;
    const id = `p_${Date.now()}`;
    setProspects(prev => [{ ...form, id, status: "idle", createdAt: new Date().toISOString(), sentAt: null }, ...prev]);
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
      const idx = (keys) => headers.findIndex(h => keys.some(k => h.includes(k.toLowerCase())));
      const companyIdx = idx(["company name","company","organization","org"]);
      const nameIdx = idx(["full name","contact name","person name"]);
      const firstNameIdx = idx(["first name","firstname"]);
      const lastNameIdx = idx(["last name","lastname"]);
      const titleIdx = idx(["title","job title","position","designation","role"]);
      const emailIdx = idx(["email","mail"]);
      const phoneIdx = idx(["phone","mobile","whatsapp"]);
      const linkedinIdx = idx(["person linkedin url","linkedin url","linkedin","profile url"]);
      const added = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const get = (index) => index >= 0 ? (row[index] || "").toString().trim() : "";
        const name = get(nameIdx) || [get(firstNameIdx), get(lastNameIdx)].filter(Boolean).join(" ");
        const company = get(companyIdx);
        if (!name && !company) continue;
        added.push({ id: `p_${Date.now()}_${i}`, name: name || "Unknown", jobTitle: get(titleIdx), company: company || "Unknown", email: get(emailIdx), phone: get(phoneIdx), linkedinUrl: get(linkedinIdx), status: "idle", createdAt: new Date().toISOString(), sentAt: null });
      }
      setProspects(prev => [...added, ...prev]);
      setUploadStatus(`✅ ${added.length} prospects imported!`);
      if (added.length > 0) { setSelected(added[0].id); setBatchFrom(1); setBatchTo(Math.min(30, added.length)); setTimeout(() => setBatchOpen(true), 600); }
      setTimeout(() => setUploadStatus(""), 4000);
    };
    if (ext === "csv") {
      reader.onload = (ev) => {
        const rows = ev.target.result.split(/\r?\n/).filter(l => l.trim()).map(l => { const result = []; let cur = "", inQ = false; for (const ch of l) { if (ch === '"') inQ = !inQ; else if (ch === "," && !inQ) { result.push(cur); cur = ""; } else cur += ch; } result.push(cur); return result; });
        parseRows(rows);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        try { const XLSX = window.XLSX; if (!XLSX) { setUploadStatus("❌ Excel support not loaded. Use CSV."); return; } const wb = XLSX.read(ev.target.result, { type: "array" }); const ws = wb.Sheets[wb.SheetNames[0]]; parseRows(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })); } catch (err) { setUploadStatus("❌ Error: " + err.message); }
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  // Excel GTM upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const XLSX = window.XLSX;
      if (!XLSX) { alert("SheetJS not loaded"); return; }
      const wb = XLSX.read(ev.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const withIds = data.map((row, i) => ({ ...row, _id: i, _status: "idle" }));
      setExcelRows(withIds);
      setExcelSelected(0);
      setExcelGenerated({});
      setExcelEditedBody({});
      setActiveView("excel");
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const generateExcelEmail = (row) => {
    const result = generateDataStackEmail(row);
    setExcelGenerated(prev => ({ ...prev, [row._id]: result }));
    setExcelRows(prev => prev.map(r => r._id === row._id ? { ...r, _status: "ready" } : r));
  };

  const generateAllExcel = () => {
    const next = {};
    excelRows.forEach(row => { next[row._id] = generateDataStackEmail(row); });
    setExcelGenerated(next);
    setExcelRows(prev => prev.map(r => ({ ...r, _status: "ready" })));
  };

  const runAgent = async (prospect) => {
    const id = prospect.id;
    setRunning(id); setSelected(id); setActiveMsg(null);
    setLogs(prev => ({ ...prev, [id]: [] }));
    const updateStatus = (status) => setProspects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      updateStatus("researching");
      const researchData = await runResearchAgent(prospect.company, prospect.linkedinUrl, prospect.name, prospect.jobTitle, prospect.jdText || "", (msg) => addLog(id, msg));
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
      const msgs = await generateMessages(prospect, researchData, matchedStories, prospect.jdText || "", replies, { industryUC, useCasesStr, industryIntro, industrySocialProof, industryClosing }, extraContext[id] || "", (msg) => addLog(id, msg));
      setMessages(prev => ({ ...prev, [id]: msgs }));
      setActiveMsg("connection_note");
      updateStatus("ready");
      addLog(id, "🚀 Agent complete!");
    } catch (err) {
      updateStatus("error");
      addLog(id, "❌ Error: " + err.message);
    } finally { setRunning(null); }
  };

  const markSent = (id) => setProspects(prev => prev.map(p => p.id === id ? { ...p, status: "following", sentAt: new Date().toISOString() } : p));

  async function pushToZoho(prospect, msgs, description) {
    const res = await fetch("/api/zoho-push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospect, messages: msgs, description }) });
    const data = await res.json();
    if (data.data?.[0]?.status === "success") return true;
    throw new Error(data.message || "Push failed");
  }

  async function enrichProspect(prospect) {
    setEnriching(prospect.id);
    try {
      const res = await fetch("/api/enrich", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: prospect.name, company: prospect.company, jobTitle: prospect.jobTitle, linkedinUrl: prospect.linkedinUrl }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, email: data.email || p.email, phone: data.phone || p.phone, linkedinUrl: data.linkedinUrl || p.linkedinUrl, jobTitle: data.title || p.jobTitle } : p));
      setEnrichedData(prev => ({ ...prev, [prospect.id]: data }));
      addLog(prospect.id, `✅ Enriched via ${data.source} — ${data.email || "no email found"}`);
    } catch (err) { addLog(prospect.id, `❌ Enrichment failed: ${err.message}`); }
    setEnriching(null);
  }

  const saveReply = () => {
    if (!replyText.trim()) return;
    const newReply = { id: `r_${Date.now()}`, prospect_name: sel?.name || "Unknown", company: sel?.company || "Unknown", industry: replyIndustry || sel?.industry || "Unknown", reply_summary: replyText.trim(), tone: replyTone || "positive", createdAt: new Date().toISOString() };
    setReplies(prev => [...prev, newReply]);
    if (selected) setProspects(prev => prev.map(p => p.id === selected ? { ...p, status: "replied" } : p));
    setReplyText(""); setReplyIndustry(""); setReplyTone("");
    addLog(selected, "📬 Reply saved!");
  };

  const runBatch = async () => {
    const idleProspects = prospects.filter(p => p.status === "idle");
    const queue = idleProspects.slice(Math.max(0, batchFrom - 1), batchTo);
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

  const copyText = (text, key) => { navigator.clipboard.writeText(text); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1800); };

  if (!dbLoaded) return <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ width: 40, height: 40, border: "3px solid #D0E4FF", borderTop: "3px solid #1B6EF3", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <div style={{ color: "#4A6080", fontSize: 14, fontWeight: 500 }}>Loading...</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>;

  const sel = prospects.find(p => p.id === selected);
  const selResearch = selected ? research[selected] : null;
  const selMessages = selected ? messages[selected] : null;
  const selMatchedStories = sel && selResearch ? findMatchingStories(sel.company, sel.industry || "", selResearch) : [];
  const dueNotifs = notifications.filter(n => !n.cleared);

  // Excel filtered rows
  const excelFiltered = excelRows.filter(r => {
    if (excelSearch && !(r.Company || "").toLowerCase().includes(excelSearch.toLowerCase())) return false;
    if (excelFilterStack !== "all" && r["Data Stack Signal"] !== excelFilterStack) return false;
    if (excelFilterInteg !== "all" && r["Integration Opportunity"] !== excelFilterInteg) return false;
    return true;
  });
  const excelStacks = [...new Set(excelRows.map(r => r["Data Stack Signal"]).filter(Boolean))];
  const excelIntegrations = [...new Set(excelRows.map(r => r["Integration Opportunity"]).filter(Boolean))];
  const excelSelRow = excelRows.find(r => r._id === excelSelected);
  const excelSelGen = excelSelRow ? excelGenerated[excelSelRow._id] : null;
  const excelBodyKey = excelSelRow ? `excel_${excelSelRow._id}` : null;
  const excelCurrentBody = excelBodyKey && excelEditedBody[excelBodyKey] !== undefined ? excelEditedBody[excelBodyKey] : excelSelGen?.body || "";
  const excelFiltIdx = excelFiltered.findIndex(r => r._id === excelSelected);

  return <>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />
    <style>{css}</style>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: "#0A2540", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, height: 60, boxShadow: "0 2px 16px rgba(10,37,64,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(27,110,243,0.4)" }}>
            <span style={{ fontSize: 14, fontFamily: DISPLAY, color: "#FFFFFF", fontWeight: 800 }}>Z</span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: "#FFFFFF", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Condense Outreach</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: MONO, letterSpacing: "0.06em" }}>ZELIOT · AI SALES AGENT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {[{ key: "prospects", label: "🎯 Prospects" }, { key: "excel", label: "📊 GTM Excel" }, { key: "dashboard", label: "📈 Dashboard" }, { key: "training", label: "🧠 Training" }].map(v => (
            <button key={v.key} onClick={() => setActiveView(v.key)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: activeView === v.key ? "rgba(27,110,243,0.3)" : "transparent", color: activeView === v.key ? "#FFFFFF" : "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, cursor: "pointer", fontWeight: activeView === v.key ? 600 : 400 }}>{v.label}</button>
          ))}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <button onClick={() => setShowProfile(s => !s)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", color: "#FFFFFF", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: senderProfile.name ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>{senderProfile.name ? senderProfile.name.charAt(0).toUpperCase() : "?"}</div>
            <span style={{ fontSize: 11, opacity: 0.9 }}>{senderProfile.name || "Set Profile"}</span>
          </button>
          <NotificationBell notifications={dueNotifs} onClear={() => setNotifications(prev => prev.map(n => ({ ...n, cleared: true })))} />
          {batchRunning && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 6, background: "rgba(27,110,243,0.25)", border: "1px solid rgba(61,139,255,0.4)" }}>
            <Spinner /><span style={{ fontSize: 11, fontFamily: MONO, color: "#FFFFFF" }}>Batch {batchProgress.current}/{batchProgress.total}</span>
            <button onClick={() => { batchCancelRef.current = true; setBatchRunning(false); }} style={{ fontSize: 10, fontFamily: MONO, color: "#FF8080", background: "none", border: "none", cursor: "pointer" }}>✕ Stop</button>
          </div>}
          {!batchRunning && prospects.filter(p => p.status === "idle").length > 0 && <GlowButton onClick={() => setBatchOpen(true)} primary>⚡ Batch Run</GlowButton>}
        </div>
      </div>

      {/* SENDER PROFILE PANEL */}
      {showProfile && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowProfile(false)}>
        <div style={{ position: "absolute", top: 60, right: 0, width: 340, height: "calc(100vh - 60px)", background: "#FFFFFF", borderLeft: "1px solid #E4ECF4", boxShadow: "-4px 0 24px rgba(10,37,64,0.10)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
          <div style={{ background: "#0A2540", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div><div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Sender Profile</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2, fontFamily: MONO }}>Used in send buttons & sign-offs</div></div>
            <button onClick={() => setShowProfile(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 16, cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ key: "name", label: "Full Name *", placeholder: "Veera Raghavan" }, { key: "email", label: "Your Email *", placeholder: "veera@zeliot.in" }, { key: "phone", label: "Phone / WhatsApp", placeholder: "+91 9353094136" }, { key: "title", label: "Job Title", placeholder: "Head of Enterprise Sales" }, { key: "company", label: "Company", placeholder: "Zeliot" }].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#4A6080", display: "block", marginBottom: 4, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{field.label}</label>
                <input value={senderProfile[field.key] || ""} onChange={e => setSenderProfile(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: "#0A2540", borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: FONT, outline: "none" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: "#4A6080", display: "block", marginBottom: 4, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Signature</label>
              <textarea value={senderProfile.signature || ""} onChange={e => setSenderProfile(p => ({ ...p, signature: e.target.value }))} placeholder={"Best regards,\nVeera Raghavan\nHead of Enterprise Sales\nZeliot | +91 935-309-4136"} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: "#0A2540", borderRadius: 6, padding: "9px 12px", fontSize: 12, fontFamily: FONT, lineHeight: 1.6, outline: "none", resize: "vertical", minHeight: 100 }} />
            </div>
          </div>
          <div style={{ padding: "16px 20px", borderTop: "1px solid #E4ECF4", flexShrink: 0 }}>
            <button onClick={() => setShowProfile(false)} style={{ width: "100%", padding: "12px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", color: "#FFFFFF", fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Save & Close</button>
          </div>
        </div>
      </div>}

      {/* BATCH MODAL */}
      {batchOpen && (() => {
        const idleList = prospects.filter(p => p.status === "idle");
        const total = idleList.length;
        const selectedCount = idleList.slice(Math.max(0, batchFrom - 1), batchTo).length;
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setBatchOpen(false)}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, width: "min(500px, 96vw)", padding: 28, boxShadow: "0 8px 40px rgba(10,37,64,0.18)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Batch Script Generator</div>
            <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO, marginBottom: 20 }}>{total} idle prospects ready</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 4 }}>FROM #</label><input type="number" min={1} max={total} value={batchFrom} onChange={e => setBatchFrom(Math.max(1, Math.min(total, Number(e.target.value))))} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: MONO }} /></div>
              <div style={{ flex: 1 }}><label style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 4 }}>TO #</label><input type="number" min={1} max={total} value={batchTo} onChange={e => setBatchTo(Math.max(batchFrom, Math.min(total, Number(e.target.value))))} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: MONO }} /></div>
            </div>
            <div style={{ background: C.goldDimmer, border: `1px solid ${C.gold}22`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: C.textMid }}>
              {selectedCount} prospects selected · Est. ~{Math.round(selectedCount * 0.7)} min
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={runBatch} disabled={selectedCount === 0} style={{ flex: 1, padding: "12px", borderRadius: 6, border: "none", background: selectedCount > 0 ? "linear-gradient(135deg, #1B6EF3, #3D8BFF)" : "#E4ECF4", color: selectedCount > 0 ? "#FFFFFF" : C.textDim, fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: selectedCount > 0 ? "pointer" : "not-allowed" }}>⚡ Generate {selectedCount} Scripts</button>
              <button onClick={() => setBatchOpen(false)} style={{ padding: "12px 20px", borderRadius: 6, border: "1px solid #E4ECF4", background: "#FFFFFF", color: C.textMid, fontFamily: FONT, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>;
      })()}

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 60px)" }}>

        {/* LEFT SIDEBAR — prospects view only */}
        {activeView === "prospects" && <div style={{ width: 300, background: "#FFFFFF", borderRight: "1px solid #E4ECF4", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "18px 16px", borderBottom: "1px solid #EEF2F7", overflowY: "auto", maxHeight: "55vh" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: DISPLAY }}>Add Prospect</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>Fill manually or paste LinkedIn URL</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 4 }}>LinkedIn URL</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ flex: 1, background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 11px", fontSize: 12, fontFamily: FONT, outline: "none" }} value={form.linkedinUrl} onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))} placeholder="linkedin.com/in/..." onKeyDown={e => e.key === "Enter" && lookupProfile()} />
                  <button onClick={lookupProfile} disabled={!form.linkedinUrl || lookupLoading} style={{ padding: "0 12px", borderRadius: 6, border: "1px solid #D8E2EE", background: !form.linkedinUrl ? "#F5F7FA" : "#EEF5FF", color: !form.linkedinUrl ? C.textFaint : "#1B6EF3", cursor: !form.linkedinUrl || lookupLoading ? "not-allowed" : "pointer", fontSize: 14 }}>{lookupLoading ? "⌛" : "🔍"}</button>
                </div>
                {lookupStatus && <div style={{ fontSize: 11, fontFamily: FONT, marginTop: 5, padding: "5px 10px", borderRadius: 6, background: lookupStatus.startsWith("✅") ? C.greenDim : C.amberDim, color: lookupStatus.startsWith("✅") ? C.green : C.amber }}>{lookupStatus}</div>}
              </div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="John Smith" />
              <Input label="Job Title" value={form.jobTitle} onChange={v => setForm(p => ({ ...p, jobTitle: v }))} placeholder="VP Engineering" />
              <Input label="Company *" value={form.company} onChange={v => setForm(p => ({ ...p, company: v }))} placeholder="Acme Corp" />
              <Input label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="john@acme.com" />
              <Input label="Phone / WhatsApp" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+91 9353094136" />
              <button onClick={() => setShowJD(s => !s)} style={{ background: showJD ? "#EEF5FF" : "#F8FAFC", border: "1px dashed #D8E2EE", color: "#1B6EF3", fontSize: 11, fontFamily: FONT, padding: "7px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left", width: "100%", fontWeight: 500 }}>
                {showJD ? "▼ Hide" : "▶ Add"} JD / Role Context
              </button>
              {showJD && <textarea value={form.jdText} onChange={e => setForm(p => ({ ...p, jdText: e.target.value }))} placeholder="Paste job description to tailor the pitch." style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "9px 12px", fontSize: 12, fontFamily: FONT, lineHeight: 1.6, outline: "none", resize: "vertical", minHeight: 90 }} />}
              <GlowButton onClick={addProspect} disabled={!form.name || !form.company} primary>+ Add Prospect</GlowButton>
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, whiteSpace: "nowrap" }}>BULK UPLOAD</span><div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: "none" }} />
                <button onClick={() => fileInputRef.current.click()} style={{ width: "100%", padding: "11px", borderRadius: 4, border: `1px solid ${C.gold}44`, background: C.goldDimmer, color: C.gold, fontSize: 11, fontFamily: MONO, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>↑ Upload CSV / Excel</button>
                {uploadStatus && <div style={{ fontSize: 10, fontFamily: MONO, marginTop: 5, padding: "5px 8px", borderRadius: 3, background: uploadStatus.startsWith("✅") ? C.greenDim : C.goldDimmer, color: uploadStatus.startsWith("✅") ? C.green : C.gold }}>{uploadStatus}</div>}
                {prospects.filter(p => p.status === "idle").length > 0 && <button onClick={() => setBatchOpen(true)} style={{ width: "100%", marginTop: 6, padding: "9px", borderRadius: 4, border: `1px solid ${C.green}44`, background: C.greenDim, color: C.green, fontSize: 11, fontFamily: MONO, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>⚡ Generate Scripts ({prospects.filter(p => p.status === "idle").length} ready)</button>}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: "10px 12px 4px", borderBottom: "1px solid #EEF2F7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: DISPLAY }}>Prospects ({prospects.length})</span>
                {prospects.length > 0 && <span style={{ fontSize: 10, color: C.textDim }}>{prospects.filter(p => p.status === "ready" || p.status === "following").length} active</span>}
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.textDim, pointerEvents: "none" }}>🔍</span>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search name or company..." style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: C.text, borderRadius: 6, padding: "7px 10px 7px 28px", fontSize: 11, fontFamily: FONT, outline: "none" }} />
              </div>
            </div>
            {prospects.length === 0 ? <div style={{ padding: "40px 20px", textAlign: "center" }}><div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>👤</div><div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, fontFamily: FONT }}>Add your first prospect above<br/>or upload a CSV file</div></div>
              : prospects.filter(p => {
                if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); if (!((p.name || "").toLowerCase().includes(q) || (p.company || "").toLowerCase().includes(q))) return false; }
                return true;
              }).map(p => (
                <div key={p.id} className="card-enter prospect-card" onClick={() => setSelected(p.id)} style={{ padding: "11px 14px", background: selected === p.id ? "#EEF5FF" : "#FFFFFF", borderBottom: "1px solid #F0F4F8", borderLeft: selected === p.id ? "3px solid #1B6EF3" : "3px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {running === p.id && <Spinner />}
                      <button onClick={e => { e.stopPropagation(); if (selected === p.id) setSelected(null); setProspects(prev => prev.filter(pr => pr.id !== p.id)); if (supabase) { supabase.from('v3_prospects').delete().eq('id', p.id); } }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, fontSize: 14, lineHeight: 1, padding: "0 2px" }} onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.textFaint}>✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{p.company}</div>
                  {p.email && <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>✉️ {p.email}</div>}
                  <div style={{ marginTop: 6 }}><Badge status={p.status} /></div>
                  {p.status === "following" && <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {[3, 7, 14].map(day => { const d = getDaysUntilFollowup(p, day); const isDue = d !== null && d <= 0, isSoon = d !== null && d > 0 && d <= 1; return <span key={day} style={{ fontSize: 9, fontFamily: MONO, padding: "2px 6px", borderRadius: 10, background: isDue ? C.redDim : isSoon ? C.amberDim : "#F0F4F8", color: isDue ? C.red : isSoon ? C.amber : C.textDim }}>D{day}: {isDue ? "DUE" : `${d}d`}</span>; })}
                  </div>}
                </div>
              ))}
          </div>
        </div>}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: activeView === "excel" ? 0 : "28px 32px", background: "#F5F7FA" }}>

          {/* ── EXCEL GTM VIEW ── */}
          {activeView === "excel" && <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Excel Left */}
            <div style={{ width: 280, background: "#FFFFFF", borderRight: "1px solid #E4ECF4", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #EEF2F7", display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: DISPLAY }}>GTM Excel Engine</span>
                  <input ref={excelFileRef} type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} style={{ display: "none" }} />
                  <button onClick={() => excelFileRef.current.click()} style={{ fontSize: 10, color: C.gold, background: C.goldDimmer, border: `1px solid ${C.gold}33`, borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontFamily: MONO }}>Upload</button>
                </div>
                {excelRows.length > 0 && <>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.textDim, pointerEvents: "none" }}>🔍</span>
                    <input value={excelSearch} onChange={e => setExcelSearch(e.target.value)} placeholder="Search company..." style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: C.text, borderRadius: 6, padding: "6px 10px 6px 26px", fontSize: 11, fontFamily: FONT, outline: "none" }} />
                  </div>
                  <select value={excelFilterStack} onChange={e => setExcelFilterStack(e.target.value)} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: excelFilterStack === "all" ? C.textDim : C.text, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontFamily: MONO }}>
                    <option value="all">All stacks</option>
                    {excelStacks.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={excelFilterInteg} onChange={e => setExcelFilterInteg(e.target.value)} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: excelFilterInteg === "all" ? C.textDim : C.text, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontFamily: MONO }}>
                    <option value="all">All integrations</option>
                    {excelIntegrations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>{excelFiltered.length} shown · <span style={{ color: C.green }}>{excelFiltered.filter(r => excelGenerated[r._id]).length} ready</span></span>
                    <button onClick={generateAllExcel} style={{ fontSize: 10, color: "#FFFFFF", background: "linear-gradient(135deg,#1B6EF3,#3D8BFF)", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontFamily: MONO, fontWeight: 600 }}>⚡ All</button>
                  </div>
                </>}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {excelRows.length === 0
                  ? <div style={{ padding: "40px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}>📊</div>
                    <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, marginBottom: 12 }}>Upload your India GTM Excel with 1000 companies</div>
                    <button onClick={() => excelFileRef.current.click()} style={{ padding: "9px 16px", borderRadius: 6, border: "none", background: "linear-gradient(135deg,#1B6EF3,#3D8BFF)", color: "#fff", fontSize: 11, fontFamily: FONT, fontWeight: 600, cursor: "pointer" }}>📊 Upload Excel</button>
                  </div>
                  : excelFiltered.map(row => {
                    const isSel = excelSelected === row._id;
                    const isReady = !!excelGenerated[row._id];
                    return <div key={row._id} className="row-hover" onClick={() => setExcelSelected(row._id)} style={{ padding: "9px 12px", borderBottom: "1px solid #F0F4F8", background: isSel ? "#EEF5FF" : "#FFFFFF", borderLeft: isSel ? "3px solid #1B6EF3" : "3px solid transparent", cursor: "pointer", transition: "all 0.1s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{row.Company}</div>
                        {isReady ? <span style={{ fontSize: 8, fontFamily: MONO, color: C.green, background: C.greenDim, padding: "2px 6px", borderRadius: 10, flexShrink: 0 }}>READY</span> : <span style={{ fontSize: 8, fontFamily: MONO, color: C.textDim, background: "#EEF2F7", padding: "2px 6px", borderRadius: 10, flexShrink: 0 }}>PENDING</span>}
                      </div>
                      <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>{row.HQ} · {row.Employees}</div>
                      <div style={{ fontSize: 9, color: C.gold, fontFamily: MONO, marginTop: 2 }}>{row["Data Stack Signal"]}</div>
                    </div>;
                  })}
              </div>
            </div>

            {/* Excel Right */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {!excelSelRow
                ? <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 12, fontFamily: MONO }}>Select a company →</div>
                : <div className="card-enter" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Company chips */}
                  <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: "14px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "-0.02em", marginBottom: 8 }}>{excelSelRow.Company}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {[
                            { v: excelSelRow["Data Stack Signal"], c: C.gold },
                            { v: excelSelRow["Tool Used"], c: C.purple },
                            { v: excelSelRow["Integration Opportunity"], c: C.amber },
                            { v: excelSelRow["Use Case"], c: C.green },
                            { v: excelSelRow["Cloud Provider"], c: "#2563EB" },
                            { v: excelSelRow["Data Warehouse"], c: "#DB2777" },
                            { v: excelSelRow["Buying Persona"], c: "#EA580C" },
                          ].filter(c => c.v).map(chip => (
                            <span key={chip.v} style={{ fontSize: 10, fontFamily: MONO, color: chip.c, background: `${chip.c}15`, border: `1px solid ${chip.c}25`, padding: "3px 9px", borderRadius: 20 }}>{chip.v}</span>
                          ))}
                        </div>
                      </div>
                      {!excelSelGen && <button onClick={() => generateExcelEmail(excelSelRow)} style={{ padding: "9px 20px", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#1B6EF3,#3D8BFF)", color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0, boxShadow: "0 2px 10px rgba(27,110,243,0.3)", cursor: "pointer" }}>⚡ Generate Email</button>}
                    </div>
                  </div>

                  {excelSelGen ? <>
                    {/* Subject */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: "12px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, fontFamily: MONO, color: C.textDim, marginBottom: 4, letterSpacing: "0.1em" }}>SUBJECT LINE</div>
                          <div style={{ fontSize: 13, color: C.navy, fontWeight: 500 }}>{excelSelGen.subject}</div>
                        </div>
                        <button onClick={() => copyText(excelSelGen.subject, "exsub")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid #E4ECF4`, background: "transparent", color: copiedKey === "exsub" ? C.green : C.textMid, fontSize: 11, fontWeight: 500, flexShrink: 0, marginLeft: 16, cursor: "pointer" }}>{copiedKey === "exsub" ? "✓ Copied" : "Copy"}</button>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "10px 18px", borderBottom: "1px solid #EEF2F7", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 9, fontFamily: MONO, color: C.textDim, letterSpacing: "0.1em" }}>EMAIL BODY — EDIT &amp; SEND</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {excelEditedBody[excelBodyKey] !== undefined && <button onClick={() => setExcelEditedBody(prev => { const n = {...prev}; delete n[excelBodyKey]; return n; })} style={{ fontSize: 11, color: C.textDim, background: "none", border: "none", cursor: "pointer" }}>↺ Reset</button>}
                          <button onClick={() => copyText(excelCurrentBody, "exbody")} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid #E4ECF4`, background: "transparent", color: copiedKey === "exbody" ? C.green : C.textMid, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{copiedKey === "exbody" ? "✓ Copied!" : "📋 Copy"}</button>
                          <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(excelSelGen.subject)}&body=${encodeURIComponent(excelCurrentBody)}`, "_blank")} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${C.amber}44`, background: C.amberDim, color: C.amber, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>✉️ Open in Mail</button>
                          {/* Zoho push for excel row */}
                          <button onClick={async () => {
                            setZohoPushing(true);
                            try {
                              await pushToZoho({ name: excelSelRow["Buying Persona"], company: excelSelRow.Company, jobTitle: excelSelRow["Buying Persona"], email: "" }, { email_subject: excelSelGen.subject, email_body: excelCurrentBody }, excelSelRow["Data Stack Signal"]);
                              setZohoPushStatus(prev => ({ ...prev, [`ex_${excelSelRow._id}`]: "success" }));
                              setTimeout(() => setZohoPushStatus(prev => ({ ...prev, [`ex_${excelSelRow._id}`]: null })), 3000);
                            } catch { setZohoPushStatus(prev => ({ ...prev, [`ex_${excelSelRow._id}`]: "error" })); setTimeout(() => setZohoPushStatus(prev => ({ ...prev, [`ex_${excelSelRow._id}`]: null })), 3000); }
                            setZohoPushing(false);
                          }} disabled={zohoPushing} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid #E46294`, background: "#FFF0F5", color: zohoPushStatus[`ex_${excelSelRow._id}`] === "success" ? C.green : "#E46294", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                            {zohoPushStatus[`ex_${excelSelRow._id}`] === "success" ? "✅ Pushed" : zohoPushStatus[`ex_${excelSelRow._id}`] === "error" ? "❌ Failed" : "☁️ Zoho"}
                          </button>
                        </div>
                      </div>
                      <textarea value={excelCurrentBody} onChange={e => setExcelEditedBody(prev => ({ ...prev, [excelBodyKey]: e.target.value }))} style={{ minHeight: 500, background: "#F8FAFC", border: "none", padding: "18px 20px", fontSize: 13, fontFamily: FONT, lineHeight: 1.9, color: C.navy, outline: "none" }} />
                    </div>

                    {/* Nav */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 }}>
                      <button onClick={() => { if (excelFiltIdx > 0) setExcelSelected(excelFiltered[excelFiltIdx - 1]._id); }} disabled={excelFiltIdx <= 0} style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid #E4ECF4", background: "#FFFFFF", color: C.textMid, fontSize: 12, cursor: "pointer", opacity: excelFiltIdx > 0 ? 1 : 0.4 }}>← Previous</button>
                      <span style={{ fontSize: 10, fontFamily: MONO, color: C.textDim }}>{excelFiltIdx + 1} / {excelFiltered.length}</span>
                      <button onClick={() => { if (excelFiltIdx < excelFiltered.length - 1) setExcelSelected(excelFiltered[excelFiltIdx + 1]._id); }} disabled={excelFiltIdx >= excelFiltered.length - 1} style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid #E4ECF4", background: "#FFFFFF", color: C.textMid, fontSize: 12, cursor: "pointer", opacity: excelFiltIdx < excelFiltered.length - 1 ? 1 : 0.4 }}>Next →</button>
                    </div>
                  </> : <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: "52px 32px", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>✉️</div>
                    <div style={{ fontSize: 14, color: C.textMid, marginBottom: 6 }}>Click "Generate Email" for {excelSelRow.Company}</div>
                    <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{excelSelRow["Data Stack Signal"]} · {excelSelRow["Tool Used"]} · {excelSelRow["Integration Opportunity"]}</div>
                  </div>}
                </div>}
            </div>
          </div>}

          {/* ── DASHBOARD VIEW ── */}
          {activeView === "dashboard" && <div style={{ maxWidth: 900, margin: "0 auto" }} className="card-enter">
            <div style={{ marginBottom: 24 }}><div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.navy }}>Dashboard</div><div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Engagement tracking & analytics</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[{ label: "Messages Generated", value: prospects.filter(p => p.status !== "idle").length, icon: "✉️", color: C.blue }, { label: "Prospects Active", value: prospects.filter(p => p.status === "following" || p.status === "ready").length, icon: "🎯", color: C.green }, { label: "Replies Logged", value: replies.length, icon: "💬", color: C.purple }, { label: "GTM Companies", value: excelRows.length, icon: "📊", color: C.gold }, { label: "Emails Generated", value: Object.keys(excelGenerated).length, icon: "⚡", color: C.amber }, { label: "Completed", value: prospects.filter(p => p.status === "done").length, icon: "✅", color: C.green }].map(stat => (
                <div key={stat.label} style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontFamily: DISPLAY, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, marginBottom: 14 }}>📊 Status Breakdown</div>
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => { const count = prospects.filter(p => p.status === status).length; if (count === 0) return null; return <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F0F4F8" }}><span style={{ fontSize: 12, color: C.textMid }}>{cfg.label}</span><span style={{ fontSize: 12, fontFamily: MONO, color: cfg.color, fontWeight: 600 }}>{count}</span></div>; })}
            </div>
          </div>}

          {/* ── TRAINING VIEW ── */}
          {activeView === "training" && <div style={{ maxWidth: 900, margin: "0 auto" }} className="card-enter">
            <div style={{ marginBottom: 24 }}><div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.navy }}>Training</div><div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Teach the AI with your best messages</div></div>
            <div style={{ background: C.goldDimmer, border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>🧠 <strong>How training works:</strong> Rate any generated message 4-5 stars and it's automatically added here. The AI reads all training examples before generating new messages.</div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4ECF4", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🧠</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: DISPLAY }}>Training Examples</span>
                <span style={{ fontSize: 10, fontFamily: MONO, color: C.gold, background: C.goldDim, padding: "2px 8px", borderRadius: 10 }}>{trainingExamples.length} examples</span>
              </div>
              {trainingExamples.length === 0 ? <div style={{ padding: "60px 20px", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🧠</div><div style={{ fontSize: 14, color: C.textDim }}>No training examples yet</div><div style={{ fontSize: 12, color: C.textDim, fontFamily: MONO, marginTop: 4 }}>Rate generated messages 4+ stars to add them</div></div>
                : <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {trainingExamples.map(ex => (
                    <div key={ex.id} style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E4ECF4" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ex.prospect} · {ex.company}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 12, color: "#F5A623" }}>{"★".repeat(ex.stars)}</span>
                          <button onClick={() => setTrainingExamples(prev => prev.filter(t => t.id !== ex.id))} style={{ fontSize: 10, color: C.red, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, maxHeight: 80, overflow: "hidden" }}>{ex.message?.slice(0, 200)}...</div>
                    </div>
                  ))}
                </div>}
            </div>
          </div>}

          {/* ── PROSPECTS VIEW ── */}
          {activeView === "prospects" && !sel && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg, #1B6EF3, #3D8BFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(27,110,243,0.25)" }}><span style={{ fontSize: 32 }}>⚡</span></div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 22, color: C.navy, marginBottom: 8, fontWeight: 700 }}>Select a prospect to begin</div>
              <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, maxWidth: 400 }}>The AI agent researches company, tech stack, persona context, success stories, and crafts personalized multi-channel scripts.</div>
            </div>
          </div>}

          {/* ── PROSPECT DETAIL ── */}
          {activeView === "prospects" && sel && <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Prospect Header */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E4ECF4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.navy, letterSpacing: "-0.02em", marginBottom: 6 }}>{sel.name}</h1>
                  <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO }}>
                    {sel.jobTitle && <span>{sel.jobTitle}</span>}
                    {sel.jobTitle && sel.company && <span style={{ color: C.textDim, margin: "0 8px" }}>·</span>}
                    {sel.company && <span style={{ color: C.gold, opacity: 0.8 }}>{sel.company}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                    {sel.linkedinUrl && <a href={sel.linkedinUrl.startsWith("http") ? sel.linkedinUrl : "https://" + sel.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: C.gold, textDecoration: "none", fontFamily: MONO, opacity: 0.7 }}>↗ LINKEDIN</a>}
                    {sel.email && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>✉️ {sel.email}</span>}
                    {sel.phone && <span style={{ fontSize: 10, color: C.textMid, fontFamily: MONO }}>📱 {sel.phone}</span>}
                    {sel.jdText && <span style={{ fontSize: 10, color: C.green, fontFamily: MONO }}>📋 JD Context Added</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16 }}>
                  <Badge status={sel.status} />
                  {(sel.status === "idle" || sel.status === "error") && <GlowButton onClick={() => runAgent(sel)} disabled={running !== null} primary>{running === sel.id ? <><Spinner /> Running...</> : "⚡ Run Agent"}</GlowButton>}
                  {(!sel.email || !sel.linkedinUrl) && <button onClick={() => enrichProspect(sel)} disabled={enriching === sel.id} style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid #7C3AED44`, background: "#FAF5FF", color: "#7C3AED", fontSize: 11, fontFamily: FONT, fontWeight: 500, cursor: enriching === sel.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>{enriching === sel.id ? <><Spinner /> Enriching...</> : enrichedData[sel.id] ? `✅ via ${enrichedData[sel.id].source}` : "🔍 Enrich"}</button>}
                  {sel.status === "ready" && <GlowButton onClick={() => markSent(sel.id)} color={C.green} primary>✓ Mark Sent</GlowButton>}
                  {selMessages && <GlowButton onClick={() => exportProposalPDF({ sel, selResearch, selMessages, selMatchedStories, findIndustryUseCases, onStart: () => setExportingPDF(true), onDone: () => setExportingPDF(false), onError: () => setExportingPDF(false) })} disabled={exportingPDF} color="#7C3AED">{exportingPDF ? <><Spinner /> PDF...</> : "📄 Export PDF"}</GlowButton>}
                  {selMessages && <button onClick={async () => {
                    setZohoPushing(true); setZohoPushStatus(prev => ({ ...prev, [sel.id]: null }));
                    try { await pushToZoho(sel, selMessages, selResearch?.why_condense_fits || ""); setZohoPushStatus(prev => ({ ...prev, [sel.id]: "success" })); setTimeout(() => setZohoPushStatus(prev => ({ ...prev, [sel.id]: null })), 4000); }
                    catch { setZohoPushStatus(prev => ({ ...prev, [sel.id]: "error" })); setTimeout(() => setZohoPushStatus(prev => ({ ...prev, [sel.id]: null })), 4000); }
                    setZohoPushing(false);
                  }} disabled={zohoPushing} style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid #E46294`, background: zohoPushStatus[sel.id] === "success" ? C.greenDim : "#FFF0F5", color: zohoPushStatus[sel.id] === "success" ? C.green : "#E46294", fontSize: 11, fontFamily: FONT, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    {zohoPushing ? <><Spinner /> Pushing...</> : zohoPushStatus[sel.id] === "success" ? "✅ Pushed!" : zohoPushStatus[sel.id] === "error" ? "❌ Failed" : "☁️ Zoho CRM"}
                  </button>}
                  {sel.status === "following" && <GlowButton onClick={() => setProspects(prev => prev.map(p => p.id === sel.id ? { ...p, status: "done" } : p))} color={C.green} small>✓ Complete</GlowButton>}
                </div>
              </div>
            </div>

            {/* Extra Context */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: 18, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #F59E0B, #F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✏️</div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Extra Context</div><div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>Optional — personalises the message</div></div>
              </div>
              <textarea value={extraContext[sel.id] || ""} onChange={e => setExtraContext(prev => ({ ...prev, [sel.id]: e.target.value }))} placeholder="Met at AutoExpo, uses AWS IoT, recently raised Series B..." style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: FONT, lineHeight: 1.7, outline: "none", resize: "vertical", minHeight: 80 }} />
            </div>

            {/* Agent Log */}
            {logs[sel.id]?.length > 0 && <div style={{ background: "#F8FAFC", border: "1px solid #E4ECF4", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textMid, fontFamily: MONO, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: running === sel.id ? C.amber : C.green }} />Agent Log
              </div>
              <div style={{ maxHeight: 120, overflowY: "auto" }}>
                {logs[sel.id].map((log, i) => <div key={i} className="log-line" style={{ fontSize: 11, fontFamily: MONO, color: log.startsWith("✅") ? C.green : log.startsWith("❌") ? C.red : C.textMid, padding: "2px 0", lineHeight: 1.8 }}>{log}</div>)}
                {running === sel.id && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><Spinner /><span style={{ fontSize: 11, fontFamily: MONO, color: C.blue }}>Processing...</span></div>}
                <div ref={logsEndRef} />
              </div>
            </div>}

            {/* Tab Nav */}
            {(selResearch || selMessages) && <div style={{ display: "flex", borderBottom: "2px solid #E4ECF4", marginBottom: 20, gap: 0, background: "#FFFFFF", borderRadius: "8px 8px 0 0", padding: "0 4px" }}>
              {[{ key: "messages", label: "Messages", icon: "💬" }, { key: "research", label: "Research", icon: "🔍" }, { key: "stories", label: `Stories${selMatchedStories.length > 0 ? ` (${selMatchedStories.length})` : ""}`, icon: "🏆" }, { key: "reply", label: "Log Reply", icon: "📬" }, { key: "keypoints", label: "Key Points", icon: "💡" }, { key: "objections", label: "Objections", icon: "🛡️" }].map(tab => (
                <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{ padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", borderBottom: activeTab === tab.key ? "2px solid #1B6EF3" : "2px solid transparent", marginBottom: "-2px", color: activeTab === tab.key ? "#1B6EF3" : C.textDim, fontFamily: FONT, fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", borderRadius: "6px 6px 0 0" }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && selMessages && <div className="card-enter">
              <div style={{ display: "flex", borderBottom: "1px solid #E4ECF4", overflowX: "auto", marginBottom: 0, background: "#FFFFFF", borderRadius: "8px 8px 0 0", padding: "0 4px" }}>
                {FOLLOWUP_SCHEDULE.map(m => {
                  const isActive = activeMsg === m.key;
                  return <button key={m.key} className="tab-btn" onClick={() => setActiveMsg(m.key)} style={{ padding: "10px 16px", border: "none", background: isActive ? "rgba(27,110,243,0.06)" : "transparent", cursor: "pointer", borderBottom: isActive ? "2px solid #1B6EF3" : "2px solid transparent", marginBottom: "-1px", color: isActive ? "#1B6EF3" : C.textDim, fontFamily: FONT, fontSize: 11, fontWeight: isActive ? 600 : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 80, borderRadius: "6px 6px 0 0" }}>
                    <span style={{ fontSize: 9, letterSpacing: "0.1em" }}>{m.icon} {m.day}</span>
                    <span style={{ whiteSpace: "nowrap", textTransform: "uppercase", fontSize: 9 }}>{m.label}</span>
                  </button>;
                })}
              </div>
              {activeMsg && (() => {
                const msgDef = FOLLOWUP_SCHEDULE.find(m => m.key === activeMsg);
                const editKey = `${sel.id}_${activeMsg}`;
                const text = edits[editKey] ?? selMessages[activeMsg] ?? "";
                const maxLen = activeMsg === "connection_note" ? 300 : null;
                const isEmail = activeMsg === "email_body";
                return <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 500, color: C.text, fontSize: 14 }}>{msgDef.label}</div>
                      <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, fontFamily: MONO }}>{msgDef.hint}</div>
                      {isEmail && selMessages.email_subject && <div style={{ marginTop: 8, padding: "6px 10px", background: C.goldDimmer, borderRadius: 3, fontSize: 11, fontFamily: MONO, color: C.goldBright }}>Subject: {selMessages.email_subject}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {maxLen && <span style={{ fontSize: 10, fontFamily: MONO, color: text.length > maxLen ? C.red : C.textDim }}>{text.length}/{maxLen}</span>}
                      <GlowButton small onClick={() => navigator.clipboard.writeText(text)} color={C.textMid}>Copy</GlowButton>
                    </div>
                  </div>
                  <textarea value={text} onChange={e => setEdits(prev => ({ ...prev, [editKey]: e.target.value }))} style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E4ECF4", color: C.navy, borderRadius: 8, padding: "14px 16px", fontSize: 13, fontFamily: FONT, lineHeight: 1.9, outline: "none", minHeight: isEmail ? 220 : activeMsg === "day0_message" ? 180 : 130 }} />
                  <div style={{ marginTop: 14, padding: "14px 0", borderTop: "1px solid #EEF2F7" }}>
                    <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.04em", marginBottom: 8 }}>SEND DIRECTLY →</div>
                    <SendButtons prospect={sel} messageText={text} messageType={activeMsg} emailSubject={selMessages.email_subject} senderProfile={senderProfile} />
                  </div>
                  {/* Star Rating */}
                  <div style={{ marginTop: 16, padding: 16, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E4ECF4" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>⭐ Rate this message</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(star => {
                        const cur = ratings[`${sel.id}_${activeMsg}`]?.stars || 0;
                        return <button key={star} onClick={() => {
                          const nr = { stars: star, message: text, messageType: activeMsg, prospect: sel.name, company: sel.company, createdAt: new Date().toISOString() };
                          setRatings(prev => ({ ...prev, [`${sel.id}_${activeMsg}`]: nr }));
                          if (star >= 4) setTrainingExamples(prev => { const ex = { id: `t_${Date.now()}`, ...nr, feedback: ratingFeedback[`${sel.id}_${activeMsg}`] || "" }; return prev.find(t => t.id === ex.id) ? prev : [...prev, ex]; });
                        }} style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: star <= cur ? "#F5A623" : "#D8E2EE" }}>★</button>;
                      })}
                      {ratings[`${sel.id}_${activeMsg}`]?.stars >= 4 && <span style={{ fontSize: 11, color: C.green, fontFamily: MONO, alignSelf: "center", marginLeft: 8 }}>✅ Added to training!</span>}
                    </div>
                    <textarea value={ratingFeedback[`${sel.id}_${activeMsg}`] || ""} onChange={e => setRatingFeedback(prev => ({ ...prev, [`${sel.id}_${activeMsg}`]: e.target.value }))} placeholder="Optional feedback..." style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: FONT, outline: "none", minHeight: 60 }} />
                  </div>
                  {edits[editKey] !== undefined && <div style={{ marginTop: 8 }}><GlowButton small color={C.textDim} onClick={() => setEdits(prev => { const n = {...prev}; delete n[editKey]; return n; })}>↺ Reset</GlowButton></div>}
                </div>;
              })()}
            </div>}

            {/* RESEARCH TAB */}
            {activeTab === "research" && selResearch && <div className="card-enter">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.amber, fontFamily: MONO, marginBottom: 12 }}>Pain Points</div>
                  {(selResearch.pain_points || []).map((pt, i) => <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", borderBottom: i < selResearch.pain_points.length - 1 ? "1px solid #F0F4F8" : "none", lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: C.amber, opacity: 0.5, flexShrink: 0 }}>—</span>{pt}</div>)}
                </div>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, fontFamily: MONO, marginBottom: 12 }}>Tech Signals</div>
                  {(selResearch.tech_stack_signals || []).map((s, i) => <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "5px 0", display: "flex", gap: 8 }}><span style={{ color: C.gold, opacity: 0.4 }}>·</span>{s}</div>)}
                </div>
              </div>
              {selResearch.condense_fit && <div style={{ background: selResearch.condense_fit.score === "high" ? C.greenDim : C.amberDim, border: `1px solid ${selResearch.condense_fit.score === "high" ? C.green : C.amber}44`, borderRadius: 8, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{selResearch.condense_fit.score === "high" ? "🟢" : "🟡"}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: selResearch.condense_fit.score === "high" ? C.green : C.amber }}>{selResearch.condense_fit.score?.toUpperCase()} FIT for Condense</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selResearch.condense_fit.reason}</div>
              </div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Company Overview</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{selResearch.company_overview}</div>
                </div>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textDim, fontFamily: MONO, marginBottom: 10 }}>Recent News</div>
                  {(selResearch.recent_news || []).map((n, i) => <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "4px 0", lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: C.textDim, opacity: 0.5 }}>·</span>{n}</div>)}
                </div>
              </div>
              <div style={{ marginTop: 10, background: "#F0FBF5", border: "1px solid #B8EDD3", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, marginBottom: 14 }}>⚡ Why Condense Helps {sel.company}</div>
                {(selResearch.why_condense_fits || "").split(". ").filter(s => s.trim()).map((point, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#FFFFFF", borderRadius: 8, border: "1px solid #B8EDD3", marginBottom: 8 }}>
                    <span style={{ color: C.green, fontWeight: 700, flexShrink: 0, fontFamily: MONO }}>→</span>
                    <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{point.trim()}{point.trim().endsWith(".") ? "" : "."}</span>
                  </div>
                ))}
              </div>
            </div>}

            {/* STORIES TAB */}
            {activeTab === "stories" && <div className="card-enter">
              {selMatchedStories.length === 0 ? <div style={{ padding: "32px 0", textAlign: "center", color: C.textDim, fontFamily: MONO, fontSize: 12 }}>No closely matched stories. Run the agent first.</div>
                : selMatchedStories.map((story, i) => (
                  <div key={story.id} style={{ background: "#FFFFFF", border: `1px solid ${i === 0 ? "#B8CCFF" : "#E4ECF4"}`, borderRadius: 10, padding: 18, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div><div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: C.text }}>{story.company}</div><div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>{story.industry}</div></div>
                      {i === 0 && <span style={{ fontSize: 9, fontFamily: MONO, color: C.gold, background: C.goldDim, padding: "3px 10px", borderRadius: 3 }}>BEST MATCH</span>}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 10 }}>{story.summary}</div>
                    <div style={{ padding: "8px 12px", background: C.greenDim, borderRadius: 3, fontSize: 12, color: C.green }}>📈 {story.outcome}</div>
                    <div style={{ marginTop: 10 }}><GlowButton small color={C.textMid} onClick={() => navigator.clipboard.writeText(`${story.company} — ${story.summary} Result: ${story.outcome}`)}>Copy for pitch</GlowButton></div>
                  </div>
                ))}
            </div>}

            {/* KEY POINTS TAB */}
            {activeTab === "keypoints" && selMessages?.key_points && <div className="card-enter">
              <div style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: DISPLAY, marginBottom: 16 }}>💡 Why This Message Was Written This Way</div>
                {selMessages.key_points.map((point, i) => <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E4ECF4", borderLeft: "3px solid #1B6EF3", marginBottom: 8 }}>
                  <span style={{ color: C.gold, fontFamily: MONO, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>{point}</span>
                </div>)}
              </div>
            </div>}

            {/* OBJECTIONS TAB */}
            {activeTab === "objections" && selMessages?.objections && <div className="card-enter">
              <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, marginBottom: 16 }}>Ready-made responses to common objections.</div>
              {selMessages.objections.map((obj, i) => <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E4ECF4", borderRadius: 10, padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>？ {obj.title}</span>
                  <GlowButton small color={C.textMid} onClick={() => navigator.clipboard.writeText(obj.response)}>Copy</GlowButton>
                </div>
                <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, padding: "10px 14px", background: "#F8FAFC", borderRadius: 6 }}>{obj.response}</div>
              </div>)}
            </div>}

            {/* LOG REPLY TAB */}
            {activeTab === "reply" && <div className="card-enter">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 6 }}>Log a Reply</div>
                <div style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, lineHeight: 1.7 }}>When a prospect replies, log what worked here. Future pitches to similar companies will improve.</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="What did they reply? Summarize or paste the actual reply." style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "12px 14px", fontSize: 13, fontFamily: FONT, lineHeight: 1.7, outline: "none", minHeight: 120 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 6 }}>Industry Context</label><input value={replyIndustry} onChange={e => setReplyIndustry(e.target.value)} placeholder="e.g. EV / Fintech / SaaS" style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "9px 12px", fontSize: 12, fontFamily: FONT, outline: "none" }} /></div>
                  <div><label style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textDim, fontFamily: MONO, display: "block", marginBottom: 6 }}>Tone That Worked</label>
                    <select value={replyTone} onChange={e => setReplyTone(e.target.value)} style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D8E2EE", color: C.text, borderRadius: 8, padding: "9px 12px", fontSize: 12, fontFamily: FONT, outline: "none" }}>
                      <option value="">Select tone</option>
                      <option value="technical-peer">Technical peer exchange</option>
                      <option value="business-impact">Business impact focused</option>
                      <option value="casual-warm">Casual and warm</option>
                      <option value="formal-strategic">Formal strategic</option>
                    </select>
                  </div>
                </div>
                <GlowButton onClick={saveReply} disabled={!replyText.trim()} primary>💾 Save Reply Pattern</GlowButton>
              </div>
              {replies.length > 0 && <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.borderDim}` }}>
                <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", marginBottom: 12 }}>SAVED PATTERNS ({replies.length})</div>
                {replies.slice(-5).reverse().map(r => <div key={r.id} style={{ padding: "12px 14px", border: "1px solid #F0E8D8", borderRadius: 8, marginBottom: 6, background: "#FFFDF7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{r.prospect_name} · {r.company}</span>
                    <span style={{ fontSize: 10, fontFamily: MONO, color: C.textDim }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO }}>{r.industry} · {r.tone}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, lineHeight: 1.6 }}>{r.reply_summary.slice(0, 200)}...</div>
                </div>)}
              </div>}
            </div>}

            {/* Follow-up Timeline */}
            {sel.status === "following" && sel.sentAt && <div style={{ marginTop: 20 }} className="card-enter">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: DISPLAY }}>Follow-Up Timeline</span>
                <div style={{ flex: 1, height: 1, background: C.borderDim }} />
              </div>
              <div style={{ display: "flex", gap: 0, position: "relative" }}>
                <div style={{ position: "absolute", top: 14, left: "12.5%", right: "12.5%", height: 2, background: "#E4ECF4", zIndex: 0 }} />
                {[{ label: "Sent", day: 0, key: "day0_message" }, { label: "Day 3", day: 3, key: "day3_followup" }, { label: "Day 7", day: 7, key: "day7_followup" }, { label: "Day 14", day: 14, key: "day14_followup" }].map(step => {
                  const d = getDaysUntilFollowup(sel, step.day);
                  const isDue = d <= 0;
                  return <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDue ? C.greenDim : "#EEF2F7", border: `1px solid ${isDue ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: isDue ? C.green : C.textDim }}>
                      {isDue ? "✓" : "·"}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: isDue ? C.green : C.textDim, fontFamily: MONO }}>{step.label}</div>
                    {step.day > 0 && <div style={{ fontSize: 9, fontFamily: MONO, color: isDue ? C.green : C.amber }}>{isDue ? "send now" : `in ${d}d`}</div>}
                    {isDue && step.day > 0 && <GlowButton small color={C.green} onClick={() => { setActiveTab("messages"); setActiveMsg(step.key); }}>View →</GlowButton>}
                  </div>;
                })}
              </div>
            </div>}
          </div>}
        </div>
      </div>
    </div>
  </>;
}
