import { z } from "zod";
import type { FunctionDef } from "@/lib/functions/types";

const schema = z.object({
  angles: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .min(1),
  pain_points: z.array(z.string()),
  desires: z.array(z.string()),
  objections: z.array(z.string()),
});

export type Fn1Output = z.infer<typeof schema>;

const s = (v: unknown) => (typeof v === "string" ? v : "");

export const fn1: FunctionDef<Fn1Output> = {
  key: "fn1",
  step: 1,
  navLabel: "Creative angles",
  badgeLabel: "Angles",
  navIcon: "ti-bulb",
  iconClass: "fi-blue",
  badgeClass: "b-blue",
  title: "Creative angle generator",
  subtitle:
    "Describe your campaign and AI will return 10 strategic angles with full audience analysis.",
  creditCost: 1,
  schema,

  buildUserPrompt(inputs) {
    return [
      `Company / brand: ${s(inputs.company)}`,
      `Product / service: ${s(inputs.product)}`,
      `Target audience: ${s(inputs.audience)}`,
      `Offer: ${s(inputs.offer)}`,
      `Campaign objective: ${s(inputs.objective)}`,
      s(inputs.context) ? `Additional context: ${s(inputs.context)}` : "",
      "",
      "Generate the 10 creative angles plus pain points, desires, and objections.",
    ]
      .filter(Boolean)
      .join("\n");
  },

  sessionPatch(inputs) {
    return {
      title: s(inputs.company) || "Untitled campaign",
      company: s(inputs.company),
      product: s(inputs.product),
      audience: s(inputs.audience),
      offer: s(inputs.offer),
      objective: s(inputs.objective),
      context: s(inputs.context),
    };
  },
};
