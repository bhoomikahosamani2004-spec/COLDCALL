export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not set" });

  const { model = "gemini-2.5-flash-lite", ...body } = req.body;

  body.generationConfig = {
    ...(body.generationConfig || {}),
    maxOutputTokens: 8192,
    temperature: 0.7,
  };

  function cleanJSON(text) {
    if (!text) return text;
    let s = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!s.startsWith("{") && s.includes('"')) s = "{" + s;
    if (!s.endsWith("}")) s = s + "}";
    try { JSON.parse(s); return s; } catch (_) {}
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1) return s.slice(start, end + 1);
    return s;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts) {
      data.candidates[0].content.parts = data.candidates[0].content.parts.map(p => {
        if (p.text) p.text = cleanJSON(p.text);
        return p;
      });
    }
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
