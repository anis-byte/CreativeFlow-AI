import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFunction } from "@/lib/functions/registry";
import { generate } from "@/lib/ai";
import type { Profile } from "@/lib/types";

export async function POST(req: Request) {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse + validate request
  let body: { functionKey?: string; sessionId?: string; inputs?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const functionKey = body.functionKey ?? "";
  const inputs = body.inputs ?? {};
  const fn = getFunction(functionKey);
  if (!fn) return NextResponse.json({ error: "Unknown function" }, { status: 400 });

  const admin = createAdminClient();

  // 3. Load profile, check status + credits
  const { data: profileRow } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileRow as Profile | null;
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 403 });
  if (profile.status !== "active")
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  if (
    profile.credit_limit !== null &&
    profile.credits_used + fn.creditCost > profile.credit_limit
  ) {
    return NextResponse.json({ error: "Credit limit reached" }, { status: 402 });
  }

  // 4. Resolve the session (create one if needed; verify ownership)
  let sessionId = body.sessionId ?? null;
  if (sessionId) {
    const { data: existing } = await admin
      .from("sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .single();
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  } else {
    const { data: created, error } = await admin
      .from("sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json({ error: "Could not create session" }, { status: 500 });
    }
    sessionId = created.id;
  }

  // 5. Load the active (admin-editable) system prompt for this function
  const { data: promptRow } = await admin
    .from("prompts")
    .select("system_prompt")
    .eq("function_key", functionKey)
    .single();
  if (!promptRow) {
    return NextResponse.json({ error: "Prompt not configured" }, { status: 500 });
  }

  // 6. Generate (provider-agnostic; demo fallback handled inside generate())
  let result;
  try {
    result = await generate({
      functionKey,
      systemPrompt: promptRow.system_prompt,
      userPrompt: fn.buildUserPrompt(inputs),
      schema: fn.schema,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 502 },
    );
  }

  // 7. Persist: session carry-forward, generation log/audit, credit decrement
  const patch = fn.sessionPatch ? fn.sessionPatch(inputs, result.output) : {};
  await admin
    .from("sessions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  await admin.from("generations").insert({
    session_id: sessionId,
    user_id: user.id,
    function_key: functionKey,
    input: inputs,
    output: result.output as Record<string, unknown>,
    provider: result.provider,
    model: result.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
  });

  const newCreditsUsed = profile.credits_used + fn.creditCost;
  await admin
    .from("profiles")
    .update({ credits_used: newCreditsUsed })
    .eq("id", user.id);

  return NextResponse.json({
    ok: true,
    sessionId,
    output: result.output,
    provider: result.provider,
    model: result.model,
    creditsUsed: newCreditsUsed,
    creditLimit: profile.credit_limit,
  });
}
