// Provider-agnostic AI contract. Every provider implements `Provider`.
// Swapping providers is a config change (AI_PROVIDER env) — no call-site change.

export interface GenerateInput {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}

export interface RawResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface Provider {
  id: string;
  defaultModel: string;
  /** True when the provider has the credentials it needs to run. */
  isConfigured(): boolean;
  generate(input: GenerateInput): Promise<RawResult>;
}
