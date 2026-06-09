import { getAuth } from "@/lib/auth";
import { FUNCTION_META } from "@/lib/functions/registry";
import { OpenSessionButton } from "@/components/OpenSessionButton";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function HistoryPage() {
  const { supabase } = await getAuth();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, company, product, updated_at")
    .order("updated_at", { ascending: false });

  const { data: gens } = await supabase
    .from("generations")
    .select("session_id, function_key");

  const stepsBySession = new Map<string, Set<string>>();
  (gens ?? []).forEach((g) => {
    if (!g.session_id) return;
    const set = stepsBySession.get(g.session_id) ?? new Set<string>();
    set.add(g.function_key);
    stepsBySession.set(g.session_id, set);
  });

  const rows = sessions ?? [];

  return (
    <>
      <div className="page-hd">
        <h1>Generation history</h1>
        <p>All past sessions. Continue any from where you left off.</p>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 7 }}>
          <input className="fi" placeholder="Search by campaign or product…" style={{ flex: 1 }} />
          <select className="fi" style={{ width: 150 }}>
            <option>All steps</option>
            <option>Angles</option>
            <option>Copy</option>
            <option>Brief</option>
          </select>
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--txt2)" }}>No sessions yet.</p>
        ) : (
          <table className="rtable">
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Product</th>
                <th>Steps done</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const steps = stepsBySession.get(s.id) ?? new Set<string>();
                const done = steps.has("fn1");
                return (
                  <tr key={s.id}>
                    <td>{s.title || s.company || "Untitled"}</td>
                    <td style={{ color: "var(--txt2)" }}>{s.product || "—"}</td>
                    <td>
                      {FUNCTION_META.filter((f) => steps.has(f.key)).map((f) => (
                        <span key={f.key} className={`badge ${f.badgeClass}`} style={{ marginRight: 3 }}>
                          {f.badgeLabel}
                        </span>
                      ))}
                      {steps.size === 0 && <span style={{ color: "var(--txt3)", fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ color: "var(--txt3)" }}>{fmtDate(s.updated_at)}</td>
                    <td>
                      <OpenSessionButton sessionId={s.id} label={done ? "Open" : "Continue"} />
                    </td>
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
