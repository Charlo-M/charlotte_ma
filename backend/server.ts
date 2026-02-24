// server.ts
import express from "express";
import cors from "cors";
import { chromium } from "playwright";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

type ExtractJobRequest = {
  url?: string;
};

type ExtractJobResponse =
  | { jobText: string; title?: string; site?: string }
  | { error: string };

const app = express();

// ---- Config ----
const PORT = Number(process.env.PORT || 5179);

const ORIGIN = process.env.ORIGIN || "*";

// Limit payload size
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: ORIGIN === "*" ? true : ORIGIN,
    credentials: false,
  })
);

// Basic health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function extractReadableText(html: string, url: string) {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const text = (article?.textContent || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    text,
    title: article?.title || "",
  };
}

app.post("/api/extract-job", async (req, res) => {
  const body = req.body as ExtractJobRequest;
  const url = String(body?.url || "").trim();

  if (!url || !isValidUrl(url)) {
    const payload: ExtractJobResponse = { error: "Invalid URL." };
    return res.status(400).json(payload);
  }

  let browser: any;
  try {
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // Some job sites do redirects; allow them.
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForTimeout(1500);
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {
    }

    const finalUrl = page.url();
    const html = await page.content();

    const { text, title } = extractReadableText(html, finalUrl);

    if (!text || text.length < 500) {
      const payload: ExtractJobResponse = {
        error:
          "Failed to extract enough text from this page (site may block scraping). Please paste the full job description text instead.",
      };
      return res.status(422).json(payload);
    }

    const jobText = text.slice(0, 15000);

    const site = (() => {
      try {
        return new URL(finalUrl).hostname;
      } catch {
        return "";
      }
    })();

    const payload: ExtractJobResponse = { jobText, title: title || undefined, site: site || undefined };
    return res.json(payload);
  } catch (err: any) {
    const payload: ExtractJobResponse = {
      error: err?.message || "Extraction failed.",
    };
    return res.status(500).json(payload);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Job extractor running: http://localhost:${PORT}`);
  console.log(`POST http://localhost:${PORT}/api/extract-job { "url": "https://..." }`);
});