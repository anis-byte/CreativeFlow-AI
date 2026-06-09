import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Resolve the current user + their profile row (role, credits, status).
export async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null, supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null, supabase };
}

export async function requireUser() {
  const { user, profile, supabase } = await getAuth();
  if (!user) redirect("/login");
  return { user, profile, supabase };
}

export async function requireAdmin() {
  const { user, profile, supabase } = await getAuth();
  if (!user) redirect("/login");
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  return { user, profile, supabase };
}
