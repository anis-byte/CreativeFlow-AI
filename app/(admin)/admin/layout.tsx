import { requireAdmin } from "@/lib/auth";
import { AdminChrome } from "@/components/AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();
  return <AdminChrome profile={profile!}>{children}</AdminChrome>;
}
