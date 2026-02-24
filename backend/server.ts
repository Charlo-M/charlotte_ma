// server.ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { chromium, type Browser } from "playwright";

type ExtractJobRequest = {
  url?: string;
};

type ExtractJobResponse =
  | { jobText: string; title?: string; site?: string; finalUrl?: string }
  | { error: string };

const app = express();

// --------------------
// Config
// --------------------
const PORT = Number(process.env.PORT) || 5179;
const ORIGIN = process.env.ORIGIN || "*";

// --------------------
// Middleware
// --------------------
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: ORIGIN === "*" ? true : ORIGIN,
    credentials: false,
  })
);

// --------------------
// Health
// --------------------
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// --------------------
// Helpers
// --------------------
function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --------------------
// Main Endpoint
// --------------------
app.post(
  "/api/extract-job",
  async (req: Request, res: Response<ExtractJobResponse>) => {
    const body = req.body as ExtractJobRequest;
    const url = String(body?.url || "").trim();

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL." });
    }

    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });

      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        viewport: { width: 1280, height: 720 },
      });

      const page = await context.newPage();

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });

      // 给动态站一点时间
      await page.waitForTimeout(1200);
      try {
        await page.waitForLoadState("networkidle", { timeout: 8000 });
      } catch {
        // ignore
      }

      const finalUrl = page.url();

      // 取标题
      const title = normalizeText(
        (await page.title().catch(() => "")) || ""
      );

      // 尽量过滤掉导航/页脚/脚本等
      const rawText = await page.evaluate(() => {
        const pick =
          document.querySelector("main") ||
          document.querySelector('[role="main"]') ||
          document.querySelector("article") ||
          document.body;

        // 防止空
        const text = pick?.innerText || document.body?.innerText || "";
        return text;
      });

      const text = normalizeText(rawText);

      if (!text || text.length < 500) {
        return res.status(422).json({
          error:
            "Failed to extract enough text from this page (site may block scraping or text is loaded differently). Please paste the full job description text instead.",
        });
      }

      const jobText = text.slice(0, 15000);

      let site = "";
      try {
        site = new URL(finalUrl).hostname;
      } catch {
        site = "";
      }

      return res.json({
        jobText,
        title: title || undefined,
        site: site || undefined,
        finalUrl: finalUrl || undefined,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Extraction failed.";
      return res.status(500).json({ error: message });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {
          // ignore
        }
      }
    }
  }
);

// --------------------
// Error Handler
// --------------------
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// --------------------
// Start
// --------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Job extractor running on port ${PORT}`);
});