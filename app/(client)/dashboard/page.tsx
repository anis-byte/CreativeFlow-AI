import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { FUNCTIONS, FUNCTION_META } from "@/lib/functions/registry";
import { OpenSessionButton } from "@/components/OpenSessionButton";

export default async function DashboardPage() {
  const { user, profile, supabase } = await getAuth();

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

  const campaignsRun = sessions?.length ?? 0;
  const outputsSaved = gens?.length ?? 0;
  const fullSessions = [...stepsBySession.values()].filter((s) =>
    s.has("fn3"),
  ).length;
  const creditsUsed = profile?.credits_used ?? 0;
  const creditLimit = profile?.credit_limit ?? null;

  const firstName = (profile?.name ?? user?.email ?? "there").split(/\s|@/)[0];
  const recent = (sessions ?? []).slice(0, 3);

  return (
    <>
      <div className="page-hd">
        <h1>Good day, {firstName}</h1>
        <p>Your CreativeFlow AI workspace — campaigns, copy, and briefs in one place.</p>
      </div>

      <div className="metric-grid">
        <div className="mc">
          <div className="mc-lbl">Credits used</div>
          <div className="mc-val">{creditsUsed}</div>
          <div className="mc-sub">
            {creditLimit === null ? "unlimited plan" : `of ${creditLimit} this month`}
          </div>
        </div>
        <div className="mc">
          <div className="mc-lbl">Campaigns run</div>
          <div className="mc-val">{campaignsRun}</div>
          <div className="mc-sub">sessions started</div>
        </div>
        <div className="mc">
          <div className="mc-lbl">Outputs saved</div>
          <div className="mc-val">{outputsSaved}</div>
          <div className="mc-sub">generations logged</div>
        </div>
        <div className="mc">
          <div className="mc-lbl">Full sessions</div>
          <div className="mc-val">{fullSessions}</div>
          <div className="mc-sub">all 3 steps done</div>
        </div>
      </div>

      <div className="fn-grid">
        {FUNCTIONS.map((f) => (
          <Link key={f.key} href={`/fn/${f.key}`} className="fn-card" style={{ textDecoration: "none" }}>
            <div className={`fn-icon ${f.iconClass}`}>
              <i className={`ti ${f.navIcon}`} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.subtitle}</p>
            <div className="fn-cta">
              <i className="ti ti-arrow-right" />{" "}
              {f.step === 1 ? "Start new campaign" : "Continue session"}
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="card-hd" style={{ marginBottom: 0 }}>
            Recent sessions
          </span>
          <Link className="btn btn-sm" href="/history">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--txt2)" }}>
            No sessions yet — start a new campaign to generate your first angles.
          </p>
        ) : (
          <table className="rtable">
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Product</th>
                <th>Steps done</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => {
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
                      {steps.size === 0 && (
                        <span style={{ color: "var(--txt3)", fontSize: 11 }}>—</span>
                      )}
                    </td>
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
