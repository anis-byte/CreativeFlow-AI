import { GoogleGenAI } from "@google/genai";
import type { Provider } from "@/lib/ai/types";

// Google Gemini — free tier, via the unified @google/genai SDK.
// JSON mode (responseMimeType) forces well-formed JSON output.
// Default model is the `gemini-flash-latest` alias so it auto-tracks the
// current Flash release (pinned versions get retired). If the free tier rejects
// it, set AI_MODEL=gemini-flash-lite-latest.
export const geminiProvider: Provider = {
  id: "gemini",
  defaultModel: "gemini-flash-latest",

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },

  async generate({ systemPrompt, userPrompt, model }) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const modelId = model || process.env.AI_MODEL || this.defaultModel;

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
  },
};
