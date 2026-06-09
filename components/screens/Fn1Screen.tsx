"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { StepBar } from "@/components/StepBar";
import { EmptyCard, Loading, OutList, CopyButton } from "@/components/ui";

const OBJECTIVES = [
  "Lead generation",
  "Sales conversion",
  "Brand awareness",
  "Event signups",
];

export function Fn1Screen() {
  const router = useRouter();
  const s = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOutput = s.angles.length > 0;

  async function run() {
    if (!s.fields.company.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        functionKey: "fn1",
        sessionId: s.sessionId,
        inputs: s.fields,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Generation failed");
      return;
    }
    s.setSessionId(data.sessionId);
    s.setCredits(data.creditsUsed, data.creditLimit);
    s.applyFn1(data.output);
  }

  return (
    <>
      <div className="page-hd">
        <h1>Creative angle generator</h1>
        <p>Describe your campaign and AI will return 10 strategic angles with full audience analysis.</p>
      </div>
      <StepBar current={1} />
      <div className="two-col">
        <div className="card">
          <div className="card-hd">Campaign details</div>
          <div className="form-stack">
            <Field label="Company name" value={s.fields.company} placeholder="e.g. Memi AI" onChange={(v) => s.setField("company", v)} />
            <Field label="Product / service" value={s.fields.product} placeholder="e.g. AI Avatar Course" onChange={(v) => s.setField("product", v)} />
            <Field label="Target audience" value={s.fields.audience} placeholder="e.g. Digital marketers, coaches" onChange={(v) => s.setField("audience", v)} />
            <Field label="Offer" value={s.fields.offer} placeholder="e.g. Free live Zoom masterclass" onChange={(v) => s.setField("offer", v)} />
            <div className="fg">
              <label>Campaign objective</label>
              <select className="fi" value={s.fields.objective} onChange={(e) => s.setField("objective", e.target.value)}>
                {OBJECTIVES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Additional context (optional)</label>
              <textarea
                className="fi"
                value={s.fields.context}
                placeholder="USPs, tone preferences, competitor notes..."
                onChange={(e) => s.setField("context", e.target.value)}
              />
            </div>
          </div>
          {error && <div className="auth-err" style={{ marginTop: 12 }}>{error}</div>}
          <div className="divider" />
          <div style={{ display: "flex", gap: 7 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={run}
              disabled={loading || !s.fields.company.trim()}
            >
              <i className="ti ti-sparkles" /> {loading ? "Generating…" : "Generate angles"}
            </button>
            <button className="btn btn-icon btn-sm" onClick={() => s.reset()} aria-label="Reset">
              <i className="ti ti-refresh" />
            </button>
          </div>
        </div>

        {loading ? (
          <Loading label="Generating angles…" />
        ) : !hasOutput ? (
          <EmptyCard icon="ti-bulb" title="No output yet" sub="Fill in details and generate." />
        ) : (
          <div>
            <div className="out-panel">
              <div className="op-hd">
                <span className="op-title">{s.angles.length} creative angles</span>
                <CopyButton text={s.selectedAngleDesc} />
              </div>
              <div className="pill-row" style={{ marginBottom: 9 }}>
                {s.angles.map((a) => (
                  <span
                    key={a.name}
                    className={`pill${s.selectedAngle === a.name ? " sel" : ""}`}
                    onClick={() => s.selectAngle(a.name, a.description)}
                  >
                    {a.name}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--txt1)",
                  lineHeight: 1.6,
                  background: "var(--ink3)",
                  border: ".5px solid var(--stroke)",
                  borderRadius: 7,
                  padding: "9px 11px",
                }}
              >
                {s.selectedAngleDesc}
              </div>
            </div>
            <div className="two-col" style={{ gap: 9, marginBottom: 9 }}>
              <div className="out-panel" style={{ marginBottom: 0 }}>
                <div className="op-title" style={{ marginBottom: 7 }}>Pain points</div>
                <OutList items={s.painPoints} />
              </div>
              <div className="out-panel" style={{ marginBottom: 0 }}>
                <div className="op-title" style={{ marginBottom: 7 }}>Desires</div>
                <OutList items={s.desires} />
              </div>
            </div>
            <div className="out-panel">
              <div className="op-title" style={{ marginBottom: 7 }}>Objections</div>
              <OutList items={s.objections} />
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => router.push("/fn/fn2")}
              >
                Use in ads copy <i className="ti ti-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="fg">
      <label>{label}</label>
      <input
        className="fi"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
