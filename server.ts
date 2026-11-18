import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "2mb" }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Server-side Gemini endpoint for live grant guideline & eligibility search with Google Search grounding
app.post("/api/guidelines/search", async (req, res) => {
  try {
    const { query, lang = "id", domainFilter = "", orgFilter = "" } = req.body || {};
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required." });
      return;
    }

    const ai = getGeminiClient();
    const languageInstruction =
      lang === "en"
        ? "Respond in clear, structured English."
        : "Jawab dalam Bahasa Indonesia yang jelas, terstruktur, dan akurat.";

    const systemInstruction = `You are a senior research grant specialist for Indonesian and Southeast Asian researchers specializing in Public Health, Social Sciences, and Road Safety.
${languageInstruction}
When answering queries about grant guidelines, NOFOs, Panduan Penelitian (e.g., BIMA Kemdiktisaintek, Hiliriset SINERGI, LPDP RISPRO, BRIN RIIM, UGM Dana Masyarakat/RTA, WHO/TDR, Health Security Partners (HSP), UKRI/MRC/ESRC, CDC, NIH PF5/RF2 foreign subaward rules, ASEAN NCAP ANCHOR, Wellcome Trust, Fondation Botnar, Bloomberg Philanthropies):
1. State clearly whether Indonesian institutions or researchers are eligible as Lead PI, International Co-Lead/Partner, or Individual Fellow.
2. Highlight specific technical requirements: TKT/TRL level, NIDN/NIDK/SINTA requirements, partner/offtaker requirements, indirect cost caps (e.g., 8% NIH, 10% Laerdal, 100% DAC UKRI), and typical opening/closing cycle windows.
3. Call out any eligibility traps (e.g., World Bank Upper-Middle-Income vs Lower-Middle-Income wording, G20 exclusions in Fogarty K43/D43, or NIH foreign subaward elimination since Jan 2026).
4. Format with clean headings and bullet points so a research team can immediately check compliance.`;

    const promptText = `Research Grant Guideline & Eligibility Query: "${query}"
${domainFilter ? `Focus Domain: ${domainFilter}` : ""}
${orgFilter ? `Target Funder / Organization: ${orgFilter}` : ""}
Search official funder portals and recent guidelines to provide an accurate, actionable breakdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: { title: string; uri: string }[] = [];
    const seen = new Set<string>();

    for (const chunk of rawChunks) {
      const uri = chunk?.web?.uri;
      const title = chunk?.web?.title || uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        sources.push({ title: title || uri, uri });
      }
    }

    res.json({
      answer: text,
      sources,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search grant guidelines.";
    console.error("Error in /api/guidelines/search:", message);
    res.status(500).json({ error: message });
  }
});

// Server-side proxy for open grant API feeds (Grants.gov, EU Horizon Portal, UKRI RSS) to avoid browser CORS blocks
app.post("/api/feeds/probe", async (req, res) => {
  const { keyword = "public health road safety social science" } = req.body || {};
  const results: {
    source: string;
    ok: boolean;
    count: number;
    items: { title: string; agency: string; closeDate: string; url: string }[];
    error?: string;
  }[] = [];

  // 1. Grants.gov API
  try {
    const gRes = await fetch("https://api.grants.gov/v1/api/search2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: 12,
        keyword: String(keyword || "public health"),
        oppStatuses: "forecasted|posted",
      }),
    });
    if (!gRes.ok) throw new Error(`HTTP ${gRes.status}`);
    const gJson = (await gRes.json()) as {
      data?: { hitCount?: number; oppHits?: Array<Record<string, string>> };
      oppHits?: Array<Record<string, string>>;
    };
    const hits = gJson.data?.oppHits || gJson.oppHits || [];
    results.push({
      source: "Grants.gov (NIH, CDC, USAID, State Dept)",
      ok: true,
      count: gJson.data?.hitCount || hits.length,
      items: hits.slice(0, 8).map((h) => ({
        title: h.title || h.number || "Untitled Opportunity",
        agency: h.agencyName || h.agencyCode || "US Federal Agency",
        closeDate: h.closeDate || "",
        url: `https://www.grants.gov/search-results-detail/${h.id}`,
      })),
    });
  } catch (e: unknown) {
    results.push({
      source: "Grants.gov (NIH, CDC, USAID, State Dept)",
      ok: false,
      count: 0,
      items: [],
      error: e instanceof Error ? e.message : "Unreachable",
    });
  }

  // 2. UKRI Opportunity Feed
  try {
    const uRes = await fetch("https://www.ukri.org/opportunity/feed/", {
      headers: { "User-Agent": "GrantRadarID/1.0" },
    });
    if (!uRes.ok) throw new Error(`HTTP ${uRes.status}`);
    const xml = await uRes.text();
    const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 8);
    const items = itemMatches.map((m) => {
      const block = m[1];
      const titleMatch =
        block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
        block.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
      return {
        title: (titleMatch ? titleMatch[1] : "UKRI Funding Opportunity").trim(),
        agency: "UKRI (MRC / ESRC / AHRC)",
        closeDate: "",
        url: (linkMatch ? linkMatch[1] : "https://www.ukri.org/opportunity/").trim(),
      };
    });
    results.push({
      source: "UKRI Funding Opportunities (MRC, ESRC, AHRC)",
      ok: items.length > 0,
      count: items.length,
      items,
    });
  } catch (e: unknown) {
    results.push({
      source: "UKRI Funding Opportunities (MRC, ESRC, AHRC)",
      ok: false,
      count: 0,
      items: [],
      error: e instanceof Error ? e.message : "Unreachable",
    });
  }

  // 3. EU Funding & Tenders API (Horizon Europe)
  try {
    const fd = new FormData();
    fd.append("query", JSON.stringify({ bool: { must: [{ terms: { type: ["1", "2"] } }] } }));
    fd.append("languages", '["en"]');
    fd.append("pageSize", "8");
    fd.append("pageNumber", "1");

    const euRes = await fetch(
      `https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA&text=${encodeURIComponent(
        String(keyword || "health road safety")
      )}`,
      { method: "POST", body: fd }
    );
    if (!euRes.ok) throw new Error(`HTTP ${euRes.status}`);
    const euJson = (await euRes.json()) as {
      totalResults?: number;
      results?: Array<{
        reference?: string;
        url?: string;
        metadata?: { title?: string[]; deadlineDate?: string[] };
      }>;
    };
    const resList = euJson.results || [];
    results.push({
      source: "EU Funding & Tenders Portal (Horizon Europe)",
      ok: true,
      count: euJson.totalResults || resList.length,
      items: resList.slice(0, 8).map((x) => ({
        title: x.metadata?.title?.[0] || x.reference || "Horizon Europe Topic",
        agency: "European Commission",
        closeDate: (x.metadata?.deadlineDate?.[0] || "").slice(0, 10),
        url: x.url || "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home",
      })),
    });
  } catch (e: unknown) {
    results.push({
      source: "EU Funding & Tenders Portal (Horizon Europe)",
      ok: false,
      count: 0,
      items: [],
      error: e instanceof Error ? e.message : "Unreachable",
    });
  }

  res.json({ results, timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grant Radar ID server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
