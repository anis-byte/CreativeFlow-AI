import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function guard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401 };
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false as const, status: 403 };
  return { ok: true as const, admin, user };
}

// Invite a user: create the auth account (no email needed), then mark the
// profile invited with a credit limit. Returns a one-time temp password the
// admin can share (works without SMTP configured).
export async function POST(req: Request) {
  const g = await guard();
  if (!g.ok) return NextResponse.json({ error: "Forbidden" }, { status: g.status });

  const { name, email, credit_limit } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const tempPassword = `${crypto.randomUUID().slice(0, 12)}!Aa1`;
  const { data: created, error } = await g.admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !created.user) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create user" },
      { status: 400 },
    );
  }

  // The signup trigger created the profile; tune it for the invite.
  // The invited user already has a working account + temp password, so mark
  // them active immediately — otherwise they'd be blocked by the "Account is
  // not active" guard in /api/generate with no way to ever activate.
  const { data: profile } = await g.admin
    .from("profiles")
    .update({
      name: name ?? null,
      credit_limit: credit_limit ?? null,
      status: "active",
    })
    .eq("id", created.user.id)
    .select("*")
    .single();

  return NextResponse.json({ profile, tempPassword });
}

// Edit a user (role / credits / status / name).
export async function PATCH(req: Request) {
  const g = await guard();
  if (!g.ok) return NextResponse.json({ error: "Forbidden" }, { status: g.status });

  const { id, role, credit_limit, status, name } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (role !== undefined) patch.role = role;
  if (credit_limit !== undefined) patch.credit_limit = credit_limit;
  if (status !== undefined) patch.status = status;
  if (name !== undefined) patch.name = name;

  const { data: profile, error } = await g.admin
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ profile });
}
