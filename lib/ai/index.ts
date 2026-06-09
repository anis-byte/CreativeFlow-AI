import "server-only";
import type { ZodType } from "zod";
import type { Provider } from "@/lib/ai/types";
import { geminiProvider } from "@/lib/ai/providers/gemini";
import { openaiProvider } from "@/lib/ai/providers/openai";
import { claudeProvider } from "@/lib/ai/providers/claude";
import { extractJson } from "@/lib/ai/parse";
import { DEMO_OUTPUTS } from "@/lib/ai/demoData";

const PROVIDERS: Record<string, Provider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  claude: claudeProvider,
};

export interface GenerateResult<T> {
  output: T;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

// Which provider is effectively active (falls back to "demo" if unconfigured).
export function activeProviderInfo() {
  const id = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const p = PROVIDERS[id];
  const configured = !!p && p.isConfigured();
  return { providerId: configured ? id : "demo", configured };
}

// Run one generation: render → call provider → extract+validate JSON (retry once)
// → fall back to demo data when no real provider is configured.
export async function generate<T>(opts: {
  functionKey: string;
  systemPrompt: string;
  userPrompt: string;
  schema: ZodType<T>;
}): Promise<GenerateResult<T>> {
  const providerId = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const provider = PROVIDERS[providerId];

  if (!provider || !provider.isConfigured()) {
    const demo = DEMO_OUTPUTS[opts.functionKey];
    if (!demo) throw new Error(`No demo output for function "${opts.functionKey}"`);
    return {
      output: opts.schema.parse(demo),
      provider: "demo",
      model: "demo",
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const systemPrompt =
      attempt === 0
        ? opts.systemPrompt
        : opts.systemPrompt +
          "\n\nReturn ONLY a single valid JSON object. No prose, no markdown fences.";
    const raw = await provider.generate({ systemPrompt, userPrompt: opts.userPrompt });
    try {
      const parsed = opts.schema.safeParse(extractJson(raw.text));
      if (parsed.success) {
        return {
          output: parsed.data,
          provider: provider.id,
          model: raw.model,
          inputTokens: raw.inputTokens,
          outputTokens: raw.outputTokens,
        };
      }
      lastError = parsed.error;
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error("AI returned invalid output: " + String(lastError));
}
