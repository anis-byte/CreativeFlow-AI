import { z } from "zod";
import type { FunctionDef } from "@/lib/functions/types";

const schema = z.object({
  primary_texts: z.array(z.string()).min(1),
  headlines: z.array(z.string()).min(1),
  ctas: z.array(z.string()).min(1),
});

export type Fn2Output = z.infer<typeof schema>;

const s = (v: unknown) => (typeof v === "string" ? v : "");

export const fn2: FunctionDef<Fn2Output> = {
  key: "fn2",
  step: 2,
  navLabel: "Ads copy",
  badgeLabel: "Copy",
  navIcon: "ti-writing",
  iconClass: "fi-mint",
  badgeClass: "b-mint",
  title: "Ads copy generator",
  subtitle:
    "Turn your selected angle into polished ad copy — primary texts, headlines, and CTAs.",
  creditCost: 1,
  schema,

  buildUserPrompt(inputs) {
    return [
      `Business summary: ${s(inputs.business_summary)}`,
      `Selected creative angle: ${s(inputs.selected_angle)}`,
      s(inputs.angle_description)
        ? `Angle rationale: ${s(inputs.angle_description)}`
        : "",
      `Platform: ${s(inputs.platform)}`,
      `Tone of voice: ${s(inputs.tone)}`,
      "",
      "Write the 5 primary texts, 10 headlines, and 5 CTAs for this angle, platform, and tone.",
    ]
      .filter(Boolean)
      .join("\n");
  },

  sessionPatch(inputs) {
    return { selected_angle: s(inputs.selected_angle) };
  },
};
