const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Auto-load .env file
try {
  require("fs").readFileSync(".env", "utf8").split("\n").forEach(line => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
} catch (_) {}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY not set. Create a .env file with GEMINI_API_KEY=your-key");
  process.exit(1);
}

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

app.post("/api/gemini", async (req, res) => {
  try {
    const { model = "gemini-2.5-flash", ...body } = req.body;

    body.generationConfig = {
      ...(body.generationConfig || {}),
      maxOutputTokens: 8192,
      temperature: 0.7,
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts) {
      data.candidates[0].content.parts = data.candidates[0].content.parts.map(p => {
        if (p.text) p.text = cleanJSON(p.text);
        return p;
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(3001, () => {
  console.log("Gemini proxy running at http://localhost:3001");
  console.log("Key:", API_KEY.slice(0, 10) + "...");
});
