import { createAdminClient } from "@/lib/supabase/admin";
import { FUNCTION_BY_KEY } from "@/lib/functions/registry";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function AdminLogPage() {
  const admin = createAdminClient();

  const { data: gens } = await admin
    .from("generations")
    .select("id, user_id, session_id, function_key, provider, model, input_tokens, output_tokens, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const userIds = [...new Set((gens ?? []).map((g) => g.user_id))];
  const sessionIds = [...new Set((gens ?? []).map((g) => g.session_id).filter(Boolean))];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name, email")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const { data: sessions } = await admin
    .from("sessions")
    .select("id, title, company")
    .in("id", sessionIds.length ? (sessionIds as string[]) : ["00000000-0000-0000-0000-000000000000"]);

  const userById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]));

  const rows = gens ?? [];

  return (
    <>
      <div className="page-hd">
        <h1>Generation log</h1>
        <p>All AI generation events across all users.</p>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 7 }}>
          <input className="fi" placeholder="Search campaign or user…" style={{ flex: 1 }} />
          <select className="fi" style={{ width: 130 }}>
            <option>All functions</option>
            <option>Angles</option>
            <option>Copy</option>
            <option>Brief</option>
          </select>
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--txt2)" }}>No generations logged yet.</p>
        ) : (
          <table className="rtable">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>User</th>
                <th>Campaign</th>
                <th>Function</th>
                <th>Session</th>
                <th>Model</th>
                <th>Tokens</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const fn = FUNCTION_BY_KEY[g.function_key];
                const u = userById.get(g.user_id);
                const sess = g.session_id ? sessionById.get(g.session_id) : null;
                return (
                  <tr key={g.id}>
                    <td>{u?.name ?? u?.email ?? "—"}</td>
                    <td>{sess?.title || sess?.company || "—"}</td>
                    <td>
                      {fn ? (
                        <span className={`badge ${fn.badgeClass}`}>{fn.badgeLabel}</span>
                      ) : (
                        g.function_key
                      )}
                    </td>
                    <td style={{ color: "var(--txt3)", fontFamily: "monospace", fontSize: 10 }}>
                      #{(g.session_id ?? "").slice(0, 6)}
                    </td>
                    <td style={{ color: "var(--txt3)" }}>{g.model ?? g.provider ?? "—"}</td>
                    <td style={{ color: "var(--txt3)" }}>
                      {(g.input_tokens + g.output_tokens).toLocaleString()}
                    </td>
                    <td style={{ color: "var(--txt3)" }}>{fmtDate(g.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
