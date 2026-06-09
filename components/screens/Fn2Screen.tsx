"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { StepBar } from "@/components/StepBar";
import { EmptyCard, Loading, OutList, CopyButton } from "@/components/ui";

const PLATFORMS = ["Meta (Facebook + Instagram)", "TikTok", "LinkedIn", "Google Display"];
const TONES = ["Conversational", "Bold & direct", "Professional", "Inspiring"];

const numbered = (items: string[]) => items.map((t, i) => `${i + 1}. ${t}`).join("\n");

export function Fn2Screen() {
  const router = useRouter();
  const s = useSession();
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessSummary = `${s.fields.company} — ${s.fields.product}. Offer: ${s.fields.offer}. Audience: ${s.fields.audience}.`;
  const hasAngles = s.angles.length > 0;
  const hasOutput = s.primaryTexts.length > 0;

  async function run() {
    if (!s.selectedAngle) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        functionKey: "fn2",
        sessionId: s.sessionId,
        inputs: {
          business_summary: businessSummary,
          selected_angle: s.selectedAngle,
          angle_description: s.selectedAngleDesc,
          platform,
          tone,
        },
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
    s.applyFn2(data.output);
  }

  return (
    <>
      <div className="page-hd">
        <h1>Ads copy generator</h1>
        <p>Turn your selected angle into polished ad copy — primary texts, headlines, and CTAs.</p>
      </div>
      <StepBar current={2} />
      {s.fields.company && (
        <div className="carry-banner">
          <i className="ti ti-link" />
          <span>
            Carried from Step 1 — <strong>{s.fields.company} · {s.fields.product}</strong>
          </span>
        </div>
      )}
      <div className="two-col">
        <div className="card">
          <div className="card-hd">Business &amp; angle</div>
          <div className="form-stack">
            <div className="fg">
              <label>
                Business summary <span style={{ color: "var(--txt3)", fontSize: 10 }}>(auto-filled)</span>
              </label>
              <textarea className="fi" rows={2} readOnly value={businessSummary} />
            </div>
            <div className="fg">
              <label>Selected creative angle</label>
              {hasAngles ? (
                <>
                  <div className="pill-row">
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
                  {s.selectedAngleDesc && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--txt2)",
                        lineHeight: 1.6,
                        marginTop: 5,
                        padding: "7px 10px",
                        background: "var(--ink3)",
                        border: ".5px solid var(--stroke)",
                        borderRadius: 7,
                      }}
                    >
                      {s.selectedAngleDesc}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 11, color: "var(--txt2)" }}>
                  No angle yet — <Link href="/fn/fn1" style={{ color: "var(--pblue)" }}>generate angles first</Link>.
                </div>
              )}
            </div>
            <div className="fg">
              <label>Platform</label>
              <select className="fi" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Tone of voice</label>
              <div className="pill-row">
                {TONES.map((t) => (
                  <span key={t} className={`pill${tone === t ? " sel" : ""}`} onClick={() => setTone(t)}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {error && <div className="auth-err" style={{ marginTop: 12 }}>{error}</div>}
          <div className="divider" />
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={run}
            disabled={loading || !s.selectedAngle}
          >
            <i className="ti ti-sparkles" /> {loading ? "Writing copy…" : "Generate copy"}
          </button>
        </div>

        {loading ? (
          <Loading label="Writing copy…" />
        ) : !hasOutput ? (
          <EmptyCard icon="ti-writing" title="No output yet" sub="Select an angle and generate." />
        ) : (
          <div>
            <Panel title="5 primary texts" items={s.primaryTexts} />
            <Panel title="10 headlines" items={s.headlines} />
            <Panel title="5 CTA variations" items={s.ctas} />
            <div style={{ display: "flex", gap: 7 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => router.push("/fn/fn3")}
              >
                Use in creative brief <i className="ti ti-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="out-panel">
      <div className="op-hd">
        <span className="op-title">{title}</span>
        <CopyButton text={numbered(items)} />
      </div>
      <OutList items={items} />
    </div>
  );
}
