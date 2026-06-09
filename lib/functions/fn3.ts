import { z } from "zod";
import type { FunctionDef } from "@/lib/functions/types";

const schema = z.object({
  hook: z.string(),
  visual_concept: z.string(),
  scene_breakdown: z
    .array(z.object({ timestamp: z.string(), description: z.string() }))
    .min(1),
  ai_image_prompt: z.string(),
  designer_notes: z.string(),
});

export type Fn3Output = z.infer<typeof schema>;

const s = (v: unknown) => (typeof v === "string" ? v : "");

export const fn3: FunctionDef<Fn3Output> = {
  key: "fn3",
  step: 3,
  navLabel: "Creative brief",
  badgeLabel: "Brief",
  navIcon: "ti-file-description",
  iconClass: "fi-lav",
  badgeClass: "b-lav",
  title: "Creative brief generator",
  subtitle:
    "A production-ready brief for your designer or video editor, including an AI image prompt.",
  creditCost: 1,
  schema,

  buildUserPrompt(inputs) {
    const aiFormat = s(inputs.ai_format) || "Midjourney";
    return [
      `Locked creative angle: ${s(inputs.angle)}`,
      `Selected primary text: ${s(inputs.selected_primary)}`,
      `Format: ${s(inputs.format)}`,
      `Visual style: ${s(inputs.visual_style)}`,
      `AI image prompt format: ${aiFormat}`,
      "",
      `Write the creative brief. The ai_image_prompt must use ${aiFormat} syntax.`,
    ]
      .filter(Boolean)
      .join("\n");
  },

  sessionPatch(inputs) {
    return {
      selected_angle: s(inputs.angle),
      selected_primary: s(inputs.selected_primary),
    };
  },
};
