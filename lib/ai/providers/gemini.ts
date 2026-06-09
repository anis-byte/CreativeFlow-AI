import { GoogleGenAI } from "@google/genai";
import type { Provider } from "@/lib/ai/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Transient = worth retrying / falling back (free-tier congestion, rate limits).
function isTransient(err: unknown): boolean {
  const s = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    s.includes("503") ||
    s.includes("unavailable") ||
    s.includes("overloaded") ||
    s.includes("high demand") ||
    s.includes("429") ||
    s.includes("resource_exhausted")
  );
}

// Google Gemini — free tier, via the unified @google/genai SDK.
// JSON mode forces well-formed JSON. Default model is the `gemini-flash-latest`
// alias (auto-tracks the current Flash release). On transient overload it retries
// with backoff, then falls back to the lighter `gemini-flash-lite-latest`.
export const geminiProvider: Provider = {
  id: "gemini",
  defaultModel: "gemini-flash-latest",

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },

  async generate({ systemPrompt, userPrompt, model }) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const primary = model || process.env.AI_MODEL || this.defaultModel;
    const candidates = [...new Set([primary, "gemini-flash-lite-latest"])];

    let lastError: unknown;
    for (const modelId of candidates) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelId,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
            },
          });
          const usage = response.usageMetadata;
          return {
            text: response.text ?? "",
            model: modelId,
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
          };
        } catch (e) {
          lastError = e;
          if (!isTransient(e)) throw e; // real error — don't burn retries
          await sleep(600 * (attempt + 1)); // backoff, then retry / fall back
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  },
};
