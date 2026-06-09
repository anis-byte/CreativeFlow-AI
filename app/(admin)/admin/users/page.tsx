import { createAdminClient } from "@/lib/supabase/admin";
import { UsersManager } from "@/components/admin/UsersManager";
import type { Profile } from "@/lib/types";

export default async function AdminUsersPage() {
  // Admin client to list every profile (the layout already enforced admin role).
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return <UsersManager initial={(data as Profile[]) ?? []} />;
}
