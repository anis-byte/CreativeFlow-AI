import type { Provider } from "@/lib/ai/types";

// OpenAI (paid). Implemented with fetch — no extra dependency. JSON mode on.
export const openaiProvider: Provider = {
  id: "openai",
  defaultModel: "gpt-4o-mini",

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  },

  async generate({ systemPrompt, userPrompt, model }) {
    const modelId = model || process.env.AI_MODEL || this.defaultModel;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? "",
      model: modelId,
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  },
};
