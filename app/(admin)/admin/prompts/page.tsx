import { createAdminClient } from "@/lib/supabase/admin";
import { PromptsManager } from "@/components/admin/PromptsManager";
import type { Prompt } from "@/lib/types";

export default async function AdminPromptsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("prompts")
    .select("*")
    .order("function_key", { ascending: true });

  return <PromptsManager initial={(data as Prompt[]) ?? []} />;
}
