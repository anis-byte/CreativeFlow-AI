import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Load a session + its generations (RLS restricts to owner or admin).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ session, generations: generations ?? [] });
}
