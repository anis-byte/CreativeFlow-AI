import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { user, isAdmin: profile?.role === "admin", admin };
}

// List all prompts (admin only).
export async function GET() {
  const { user, isAdmin, admin } = await requireAdminUser();
  if (!user || !isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await admin!
    .from("prompts")
    .select("*")
    .order("function_key", { ascending: true });
  return NextResponse.json({ prompts: data ?? [] });
}

// Save a prompt: snapshot the current version, then bump (admin only).
export async function PUT(req: Request) {
  const { user, isAdmin, admin } = await requireAdminUser();
  if (!user || !isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { function_key, system_prompt } = await req.json();
  if (!function_key || typeof system_prompt !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: current } = await admin!
    .from("prompts")
    .select("*")
    .eq("function_key", function_key)
    .single();
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Snapshot the existing version into history before overwriting.
  await admin!.from("prompt_versions").insert({
    prompt_id: current.id,
    function_key,
    version: current.version,
    system_prompt: current.system_prompt,
    created_by: user.id,
  });

  const { data: updated } = await admin!
    .from("prompts")
    .update({
      system_prompt,
      version: current.version + 1,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("function_key", function_key)
    .select("*")
    .single();

  return NextResponse.json({ prompt: updated });
}
