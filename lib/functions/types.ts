import type { ZodType } from "zod";

// A function = one prompt → structured JSON, plus the metadata the UI and the
// generate API need. Add a new function by creating one of these and listing it
// in registry.ts — nothing else in the server pipeline needs to change.
export interface FunctionDef<T = unknown> {
  key: string; // e.g. "fn1" — matches prompts.function_key
  step: number; // position in the chain (1-based)
  navLabel: string; // sidebar label
  badgeLabel: string; // short badge label, e.g. "Angles"
  navIcon: string; // tabler icon class, e.g. "ti-bulb"
  iconClass: string; // function-card icon color class, e.g. "fi-blue"
  badgeClass: string; // badge color class, e.g. "b-blue"
  title: string; // page heading
  subtitle: string; // page sub-heading
  creditCost: number; // credits consumed per run

  // Output validation (zod). The generate API validates the model's JSON here.
  schema: ZodType<T>;

  // Render the user-content string sent to the model from this step's inputs
  // (form fields + any carried selections the client passes through).
  buildUserPrompt: (inputs: Record<string, unknown>) => string;

  // Fields to persist onto the session row after a successful run (carry-forward).
  sessionPatch?: (
    inputs: Record<string, unknown>,
    output: T,
  ) => Record<string, unknown>;
}
