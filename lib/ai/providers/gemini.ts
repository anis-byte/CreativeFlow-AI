import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Provider } from "@/lib/ai/types";

// Google Gemini — free tier. JSON mode forces well-formed JSON output.
export const geminiProvider: Provider = {
  id: "gemini",
  defaultModel: "gemini-2.0-flash",

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },

  async generate({ systemPrompt, userPrompt, model }) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const modelId = model || process.env.AI_MODEL || this.defaultModel;
    const m = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" },
    });
    const res = await m.generateContent(userPrompt);
    const usage = res.response.usageMetadata;
    return {
      text: res.response.text(),
      model: modelId,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };
  },
};
