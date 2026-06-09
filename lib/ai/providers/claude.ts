import type { Provider } from "@/lib/ai/types";

// Anthropic Claude (paid). Implemented with fetch — no extra dependency.
// Prompts instruct "return ONLY valid JSON"; extractJson() handles parsing.
export const claudeProvider: Provider = {
  id: "claude",
  defaultModel: "claude-sonnet-4-6",

  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  },

  async generate({ systemPrompt, userPrompt, model }) {
    const modelId = model || process.env.AI_MODEL || this.defaultModel;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const text = Array.isArray(data.content)
      ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("")
      : "";
    return {
      text,
      model: modelId,
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    };
  },
};
