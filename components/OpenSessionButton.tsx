"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import type { GenerationRow } from "@/lib/types";

// Loads a session (+ its generations) into the working context and navigates to
// the furthest step completed — the "Open / Continue" affordance.
export function OpenSessionButton({
  sessionId,
  label,
}: {
  sessionId: string;
  label: string;
}) {
  const router = useRouter();
  const { loadSession } = useSession();
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const { session, generations } = (await res.json()) as {
      session: Parameters<typeof loadSession>[0];
      generations: GenerationRow[];
    };
    loadSession(session, generations);
    const has = (k: string) => generations.some((g) => g.function_key === k);
    const dest = has("fn3")
      ? "/fn/fn3"
      : has("fn2")
        ? "/fn/fn3"
        : has("fn1")
          ? "/fn/fn2"
          : "/fn/fn1";
    router.push(dest);
  }

  return (
    <button className="btn btn-sm" onClick={open} disabled={loading}>
      {loading ? "…" : label}
    </button>
  );
}
