export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not set" });

  const { linkedinUrl } = req.body;
  if (!linkedinUrl) return res.status(400).json({ error: "linkedinUrl required" });

  const slug = linkedinUrl
    .replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/\//g, "")
    .trim();

  const prompt = `Search for the LinkedIn profile of this person: ${linkedinUrl}
Search query: "${slug} linkedin profile job title company"

Find their current job title, company, full name, industry, seniority level, and country/region.

Return ONLY this JSON object with no other text:
{"name":"Full Name","jobTitle":"Their exact job title","company":"Company name","industry":"Industry","seniority":"Engineer or Manager or VP or CTO or Head etc","region":"Country or City Country","confidence":80}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
        }),
      }
    );

    const data = await response.json();
    
    // Extract text from all parts
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || "").join("");

    // Aggressively extract JSON
    let cleaned = text
      .replace(/<[^>]+>/g, "") // strip HTML tags
      .replace(/\*\*[^*]+\*\*/g, "") // strip bold markdown
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    
    if (start === -1 || end === -1) {
      return res.status(422).json({ error: "Could not extract profile info" });
    }

    const json = JSON.parse(cleaned.slice(start, end + 1));
    return res.json(json);
  } catch (err) {
    console.error("LinkedIn lookup error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
