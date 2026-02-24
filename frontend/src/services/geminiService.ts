import { MatchAnalysis } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5179";

async function parseError(resp: Response) {
  try {
    const data = await resp.json();
    return data?.detail?.error || data?.error || JSON.stringify(data);
  } catch {
    return `${resp.status} ${resp.statusText}`;
  }
}

export async function sendMessageToGemini(message: string): Promise<string> {
  const resp = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    throw new Error(await parseError(resp));
  }

  const data = (await resp.json()) as { text?: string };
  return data.text || "";
}

/**
 * Job match with raw job description text.
 */
export async function analyzeJobMatch(jobDescription: string): Promise<MatchAnalysis | null> {
  const resp = await fetch(`${BASE}/api/job-match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
  });

  if (!resp.ok) return null;
  return (await resp.json()) as MatchAnalysis;
}

/**
 * Job match by URL (backend will extract using Playwright, then run Gemini).
 */
export async function analyzeJobMatchUrl(url: string): Promise<MatchAnalysis | null> {
  const resp = await fetch(`${BASE}/api/job-match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!resp.ok) return null;
  return (await resp.json()) as MatchAnalysis;
}