import { requireUser } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";
import { ClientChrome } from "@/components/ClientChrome";
import { FUNCTION_META } from "@/lib/functions/registry";
import type { Profile } from "@/lib/types";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  // Trigger always creates a profile; fall back defensively just in case.
  const p: Profile =
    profile ??
    ({
      id: user!.id,
      name: user!.email ?? null,
      email: user!.email ?? null,
      role: "user",
      credit_limit: 500,
      credits_used: 0,
      status: "active",
      created_at: new Date().toISOString(),
    } as Profile);

  return (
    <SessionProvider
      initialCreditsUsed={p.credits_used}
      initialCreditLimit={p.credit_limit}
    >
      <ClientChrome profile={p} functions={FUNCTION_META}>
        {children}
      </ClientChrome>
    </SessionProvider>
  );
}
